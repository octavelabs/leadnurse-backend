const { PrismaClient } = require('@prisma/client');
const { updateComplianceStatuses } = require('../services/complianceService');
const {
  sendShiftStartingSoonEmail,
  sendClockOutReminderEmail,
  sendMissedClockOutEmail,
  sendComplianceExpiringEmail,
  sendComplianceExpiredEmail,
} = require('../services/emailService');

const prisma = new PrismaClient();

// This job is meant to be triggered on a schedule (e.g. every 15 minutes) by an
// external pinger hitting the protected /api/internal/scheduled-checks route —
// this app has no in-process cron since Render's free tier spins down when idle.
//
// Windows are intentionally wider than the cron interval so a slow or skipped
// run can't let a shift slip through with zero reminder — each check is guarded
// by a "sent" flag/timestamp so it never double-sends once caught.

const REMINDER_WINDOW_START_MIN = 55;
const REMINDER_WINDOW_END_MIN = 90;
const MISSED_CHECKOUT_GRACE_MIN = 30;

async function checkShiftsStartingSoon() {
  const now = new Date();
  const from = new Date(now.getTime() + REMINDER_WINDOW_START_MIN * 60000);
  const to = new Date(now.getTime() + REMINDER_WINDOW_END_MIN * 60000);

  const assignments = await prisma.shiftAssignment.findMany({
    where: {
      status: 'CONFIRMED',
      startReminderSentAt: null,
      shift: { startTime: { gte: from, lte: to } },
    },
    include: { shift: { include: { facility: true } }, user: { select: { name: true, email: true } } },
  });

  let sent = 0;
  for (const a of assignments) {
    try {
      await sendShiftStartingSoonEmail({
        name: a.user.name, email: a.user.email, shiftTitle: a.shift.title,
        facilityName: a.shift.facility?.name, startTime: a.shift.startTime,
      });
      await prisma.shiftAssignment.update({ where: { id: a.id }, data: { startReminderSentAt: now } });
      sent++;
    } catch (err) { console.error('[ScheduledChecks] shift-starting-soon failed for', a.id, err?.message); }
  }
  return sent;
}

async function checkClockOutReminders() {
  const now = new Date();
  const from = new Date(now.getTime() + REMINDER_WINDOW_START_MIN * 60000);
  const to = new Date(now.getTime() + REMINDER_WINDOW_END_MIN * 60000);

  const assignments = await prisma.shiftAssignment.findMany({
    where: {
      status: 'CONFIRMED',
      endReminderSentAt: null,
      shift: { endTime: { gte: from, lte: to } },
    },
    include: { shift: true, user: { select: { id: true, name: true, email: true } } },
  });

  let sent = 0;
  for (const a of assignments) {
    try {
      const attendance = await prisma.attendance.findFirst({
        where: { shiftId: a.shiftId, userId: a.userId, checkInTime: { not: null }, checkOutTime: null },
      });
      if (!attendance) continue; // not checked in — nothing to remind them to check out of

      await sendClockOutReminderEmail({ name: a.user.name, email: a.user.email, shiftTitle: a.shift.title, endTime: a.shift.endTime });
      await prisma.shiftAssignment.update({ where: { id: a.id }, data: { endReminderSentAt: now } });
      sent++;
    } catch (err) { console.error('[ScheduledChecks] clock-out-reminder failed for', a.id, err?.message); }
  }
  return sent;
}

async function checkMissedClockOuts() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - MISSED_CHECKOUT_GRACE_MIN * 60000);

  const records = await prisma.attendance.findMany({
    where: {
      checkInTime: { not: null },
      checkOutTime: null,
      missedCheckoutAlertSent: false,
      shift: { endTime: { lte: cutoff } },
    },
    include: { shift: true, user: { select: { name: true } } },
  });

  let sent = 0;
  for (const r of records) {
    try {
      await sendMissedClockOutEmail({ employeeName: r.user.name, shiftTitle: r.shift.title, date: r.shift.date, endTime: r.shift.endTime });
      await prisma.attendance.update({ where: { id: r.id }, data: { missedCheckoutAlertSent: true } });
      sent++;
    } catch (err) { console.error('[ScheduledChecks] missed-clock-out failed for', r.id, err?.message); }
  }
  return sent;
}

async function checkComplianceExpiry() {
  await updateComplianceStatuses();
  const now = new Date();

  const expiringSoon = await prisma.workerCompliance.findMany({
    where: { status: 'EXPIRING_SOON', expiringSoonNotifiedAt: null },
    include: { user: { select: { name: true, email: true } } },
  });
  let expiringSent = 0;
  for (const r of expiringSoon) {
    try {
      await sendComplianceExpiringEmail({ name: r.user.name, email: r.user.email, complianceType: r.type, expiryDate: r.expiryDate });
      await prisma.workerCompliance.update({ where: { id: r.id }, data: { expiringSoonNotifiedAt: now } });
      expiringSent++;
    } catch (err) { console.error('[ScheduledChecks] compliance-expiring failed for', r.id, err?.message); }
  }

  const expired = await prisma.workerCompliance.findMany({
    where: { status: 'EXPIRED', expiredNotifiedAt: null },
    include: { user: { select: { name: true, email: true } } },
  });
  let expiredSent = 0;
  for (const r of expired) {
    try {
      await sendComplianceExpiredEmail({ name: r.user.name, email: r.user.email, complianceType: r.type, expiryDate: r.expiryDate });
      await prisma.workerCompliance.update({ where: { id: r.id }, data: { expiredNotifiedAt: now } });
      expiredSent++;
    } catch (err) { console.error('[ScheduledChecks] compliance-expired failed for', r.id, err?.message); }
  }

  return { expiringSent, expiredSent };
}

async function runScheduledChecks() {
  const [shiftsStartingSoon, clockOutReminders, missedClockOuts, compliance] = await Promise.all([
    checkShiftsStartingSoon(),
    checkClockOutReminders(),
    checkMissedClockOuts(),
    checkComplianceExpiry(),
  ]);
  return { shiftsStartingSoon, clockOutReminders, missedClockOuts, ...compliance };
}

module.exports = { runScheduledChecks };
