const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

// ─── Admin: Request a sign-off for an attendance record ──────────────────────

exports.requestSignoff = async (req, res, next) => {
  try {
    const { attendanceId, supervisorName, supervisorEmail, supervisorRole } = req.body;
    if (!attendanceId) return error(res, 'attendanceId is required', 400);

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { user: { select: { name: true } }, shift: { include: { facility: true } } },
    });
    if (!attendance) return error(res, 'Attendance record not found', 404);

    const existing = await prisma.timesheetSignoff.findUnique({ where: { attendanceId } });
    if (existing?.status === 'SIGNED') return error(res, 'Timesheet already signed off', 400);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const signoff = existing
      ? await prisma.timesheetSignoff.update({
          where: { attendanceId },
          data: { token, tokenExpiresAt, status: 'PENDING', requestedAt: new Date(), supervisorName: supervisorName || null, supervisorEmail: supervisorEmail || null, supervisorRole: supervisorRole || null },
        })
      : await prisma.timesheetSignoff.create({
          data: { attendanceId, requestedById: req.user.id, token, tokenExpiresAt, requestedAt: new Date(), supervisorName: supervisorName || null, supervisorEmail: supervisorEmail || null, supervisorRole: supervisorRole || null },
        });

    // TODO: send email to supervisorEmail with: `${process.env.FRONTEND_URL}/timesheet-signoff/${token}`

    return success(res, { ...signoff, signoffUrl: `${process.env.FRONTEND_URL}/timesheet-signoff/${token}` }, 'Sign-off requested — link generated');
  } catch (err) { next(err); }
};

// ─── Admin: Get signoffs for an attendance record ─────────────────────────────

exports.getSignoff = async (req, res, next) => {
  try {
    const signoff = await prisma.timesheetSignoff.findUnique({ where: { attendanceId: req.params.attendanceId } });
    return success(res, signoff || null);
  } catch (err) { next(err); }
};

// ─── Public: Get sign-off form context from token ────────────────────────────

exports.getPublicSignoffForm = async (req, res, next) => {
  try {
    const signoff = await prisma.timesheetSignoff.findUnique({
      where: { token: req.params.token },
      include: {
        attendance: {
          include: {
            user: { select: { name: true } },
            shift: { include: { facility: { select: { name: true, city: true } } } },
          },
        },
      },
    });

    if (!signoff) return error(res, 'Invalid or expired sign-off link', 404);
    if (signoff.status === 'SIGNED') return error(res, 'This timesheet has already been signed off', 410);
    if (signoff.tokenExpiresAt && signoff.tokenExpiresAt < new Date()) {
      await prisma.timesheetSignoff.update({ where: { id: signoff.id }, data: { status: 'PENDING' } });
      return error(res, 'This link has expired. Ask the admin to resend.', 410);
    }

    const { attendance } = signoff;
    return success(res, {
      workerName: attendance.user.name,
      shiftTitle: attendance.shift?.title,
      facilityName: attendance.shift?.facility?.name,
      facilityCity: attendance.shift?.facility?.city,
      shiftDate: attendance.shift?.date,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      hoursWorked: attendance.hoursWorked,
      supervisorName: signoff.supervisorName,
      supervisorRole: signoff.supervisorRole,
    });
  } catch (err) { next(err); }
};

// ─── Public: Submit the sign-off ─────────────────────────────────────────────

exports.submitSignoff = async (req, res, next) => {
  try {
    const signoff = await prisma.timesheetSignoff.findUnique({ where: { token: req.params.token } });

    if (!signoff) return error(res, 'Invalid sign-off link', 404);
    if (signoff.status === 'SIGNED') return error(res, 'Already signed off', 410);
    if (signoff.tokenExpiresAt && signoff.tokenExpiresAt < new Date()) return error(res, 'Link has expired', 410);

    const { confirmed, rating, feedback, supervisorName } = req.body;
    if (!confirmed) return error(res, 'You must confirm attendance to sign off', 400);
    if (rating !== undefined) {
      const r = parseInt(rating);
      if (isNaN(r) || r < 1 || r > 5) return error(res, 'Rating must be between 1 and 5', 400);
    }

    await prisma.timesheetSignoff.update({
      where: { id: signoff.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        token: null,
        rating: rating ? parseInt(rating) : null,
        feedback: feedback?.trim() || null,
        supervisorName: supervisorName?.trim() || signoff.supervisorName,
      },
    });

    return success(res, null, 'Timesheet signed off successfully. Thank you.');
  } catch (err) { next(err); }
};
