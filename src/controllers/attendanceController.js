const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { createAuditLog } = require('../services/auditService');

const prisma = new PrismaClient();

exports.getAttendance = async (req, res, next) => {
  try {
    const { shiftId, userId, from, to, status } = req.query;
    const where = {};
    if (shiftId) where.shiftId = shiftId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (from || to) {
      where.checkInTime = {};
      if (from) where.checkInTime.gte = new Date(from);
      if (to) where.checkInTime.lte = new Date(to);
    }

    const records = await prisma.attendance.findMany({
      where,
      include: { shift: { include: { facility: true } }, user: { select: { id: true, name: true, email: true } } },
      orderBy: { checkInTime: 'desc' },
    });
    success(res, records);
  } catch (err) { next(err); }
};

exports.checkIn = async (req, res, next) => {
  try {
    const { shiftId } = req.body;
    const userId = req.user.id;

    const assignment = await prisma.shiftAssignment.findFirst({ where: { shiftId, userId, status: 'CONFIRMED' } });
    if (!assignment) return error(res, 'No confirmed assignment for this shift', 403);

    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    const now = new Date();

    const minutesLate = Math.floor((now - new Date(shift.startTime)) / 60000);
    const status = minutesLate > 10 ? 'LATE' : 'ON_TIME';

    const existing = await prisma.attendance.findFirst({ where: { shiftId, userId } });
    let record;
    if (existing) {
      record = await prisma.attendance.update({ where: { id: existing.id }, data: { checkInTime: now, status } });
    } else {
      record = await prisma.attendance.create({ data: { shiftId, userId, checkInTime: now, status } });
    }

    await createAuditLog({ userId, action: 'CHECKIN', entity: 'Attendance', entityId: record.id });
    success(res, record, 'Checked in successfully');
  } catch (err) { next(err); }
};

exports.checkOut = async (req, res, next) => {
  try {
    const { shiftId, signatureName, confirmedBy } = req.body;
    const userId = req.user.id;

    const normalize = (s) => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
    if (!signatureName || normalize(signatureName) !== normalize(req.user.name)) {
      return error(res, 'Signature must match your full name exactly', 400);
    }
    if (!confirmedBy || !confirmedBy.trim()) {
      return error(res, 'Confirmed By is required', 400);
    }

    const record = await prisma.attendance.findFirst({ where: { shiftId, userId } });
    if (!record) return error(res, 'No check-in record found', 404);
    if (!record.checkInTime) return error(res, 'Must check in before checking out', 400);

    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    const now = new Date();
    const hoursWorked = (now - new Date(record.checkInTime)) / (1000 * 60 * 60);
    const scheduledHours = (new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60);
    const overtimeHours = Math.max(0, hoursWorked - scheduledHours);
    const leftEarly = now < new Date(shift.endTime);
    const status = leftEarly ? 'LEFT_EARLY' : record.status;

    const updated = await prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOutTime: now,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        status,
        checkOutSignature: signatureName.trim(),
        confirmedBy: confirmedBy.trim(),
      },
    });

    await createAuditLog({ userId, action: 'CHECKOUT', entity: 'Attendance', entityId: record.id });
    success(res, updated, 'Checked out successfully');
  } catch (err) { next(err); }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const record = await prisma.attendance.update({ where: { id: req.params.id }, data: req.body });
    await createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'Attendance', entityId: record.id });
    success(res, record, 'Attendance updated');
  } catch (err) { next(err); }
};

exports.getMyAttendance = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = { userId: req.user.id };
    if (from || to) {
      where.checkInTime = {};
      if (from) where.checkInTime.gte = new Date(from);
      if (to) where.checkInTime.lte = new Date(to);
    }
    const records = await prisma.attendance.findMany({
      where,
      include: { shift: { include: { facility: true } } },
      orderBy: { checkInTime: 'desc' },
    });
    success(res, records);
  } catch (err) { next(err); }
};
