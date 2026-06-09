const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { createAuditLog } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');
const { checkWorkerCompliance } = require('../services/complianceService');

const prisma = new PrismaClient();

const shiftInclude = {
  facility: true,
  role: true,
  assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
};

exports.getShifts = async (req, res, next) => {
  try {
    const { status, facilityId, roleId, from, to, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (facilityId) where.facilityId = facilityId;
    if (roleId) where.roleId = roleId;
    if (from || to) where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);

    const [shifts, total] = await Promise.all([
      prisma.shift.findMany({ where, include: shiftInclude, orderBy: { date: 'asc' }, skip: (page - 1) * limit, take: Number(limit) }),
      prisma.shift.count({ where }),
    ]);
    success(res, { shifts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getShift = async (req, res, next) => {
  try {
    const shift = await prisma.shift.findUnique({ where: { id: req.params.id }, include: shiftInclude });
    if (!shift) return error(res, 'Shift not found', 404);
    success(res, shift);
  } catch (err) { next(err); }
};

function coerceShiftDates(body) {
  const data = { ...body };
  if (data.date) data.date = new Date(data.date);
  if (data.startTime) data.startTime = new Date(data.startTime);
  if (data.endTime) data.endTime = new Date(data.endTime);
  if (data.hourlyRate !== undefined) data.hourlyRate = parseFloat(data.hourlyRate);
  if (data.facilityHourlyRate !== undefined) data.facilityHourlyRate = parseFloat(data.facilityHourlyRate);
  if (data.requiredWorkers) data.requiredWorkers = parseInt(data.requiredWorkers);
  return data;
}

exports.createShift = async (req, res, next) => {
  try {
    const shift = await prisma.shift.create({ data: coerceShiftDates(req.body), include: shiftInclude });
    await createAuditLog({ userId: req.user.id, action: 'CREATE', entity: 'Shift', entityId: shift.id });
    success(res, shift, 'Shift created', 201);
  } catch (err) { next(err); }
};

exports.updateShift = async (req, res, next) => {
  try {
    const shift = await prisma.shift.update({ where: { id: req.params.id }, data: coerceShiftDates(req.body), include: shiftInclude });
    await createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'Shift', entityId: shift.id });
    success(res, shift, 'Shift updated');
  } catch (err) { next(err); }
};

exports.deleteShift = async (req, res, next) => {
  try {
    await prisma.shift.delete({ where: { id: req.params.id } });
    await createAuditLog({ userId: req.user.id, action: 'DELETE', entity: 'Shift', entityId: req.params.id });
    success(res, null, 'Shift deleted');
  } catch (err) { next(err); }
};

exports.assignWorker = async (req, res, next) => {
  try {
    const { shiftId, userId } = req.body;
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) return error(res, 'Shift not found', 404);

    const { valid, issues } = await checkWorkerCompliance(userId, shift);
    if (!valid) return error(res, `Compliance issues: ${issues.join(', ')}`, 422);

    const existingCount = await prisma.shiftAssignment.count({ where: { shiftId, status: { in: ['CONFIRMED', 'PENDING'] } } });
    if (existingCount >= shift.requiredWorkers) return error(res, 'Shift is already fully staffed', 409);

    const assignment = await prisma.shiftAssignment.create({ data: { shiftId, userId, status: 'CONFIRMED' } });

    const filled = existingCount + 1 >= shift.requiredWorkers;
    if (filled) await prisma.shift.update({ where: { id: shiftId }, data: { status: 'FILLED' } });
    else await prisma.shift.update({ where: { id: shiftId }, data: { status: 'PARTIALLY_FILLED' } });

    await createNotification({ userId, type: 'SHIFT_ASSIGNED', title: 'Shift Assigned', message: `You have been assigned to shift: ${shift.title}`, data: { shiftId } });
    await createAuditLog({ userId: req.user.id, action: 'ASSIGN', entity: 'ShiftAssignment', entityId: assignment.id, details: { shiftId, workerId: userId } });
    success(res, assignment, 'Worker assigned', 201);
  } catch (err) { next(err); }
};

exports.unassignWorker = async (req, res, next) => {
  try {
    const assignment = await prisma.shiftAssignment.findUnique({ where: { id: req.params.id }, include: { shift: true } });
    if (!assignment) return error(res, 'Assignment not found', 404);

    await prisma.shiftAssignment.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });

    const remaining = await prisma.shiftAssignment.count({ where: { shiftId: assignment.shiftId, status: { in: ['CONFIRMED', 'PENDING'] } } });
    const newStatus = remaining === 0 ? 'OPEN' : remaining < assignment.shift.requiredWorkers ? 'PARTIALLY_FILLED' : 'FILLED';
    await prisma.shift.update({ where: { id: assignment.shiftId }, data: { status: newStatus } });

    await createNotification({ userId: assignment.userId, type: 'SHIFT_CANCELLED', title: 'Shift Unassigned', message: `Your assignment to ${assignment.shift.title} has been cancelled`, data: { shiftId: assignment.shiftId } });
    await createAuditLog({ userId: req.user.id, action: 'UNASSIGN', entity: 'ShiftAssignment', entityId: req.params.id });
    success(res, null, 'Worker unassigned');
  } catch (err) { next(err); }
};

exports.applyForShift = async (req, res, next) => {
  try {
    const shiftId = req.params.id;
    const userId = req.user.id;

    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) return error(res, 'Shift not found', 404);
    if (!['OPEN', 'PARTIALLY_FILLED'].includes(shift.status)) return error(res, 'This shift is not accepting applications', 409);

    const existing = await prisma.shiftAssignment.findUnique({ where: { shiftId_userId: { shiftId, userId } } });
    if (existing) return error(res, 'You have already applied for this shift', 409);

    const { valid, issues } = await checkWorkerCompliance(userId, shift);
    if (!valid) return error(res, `Compliance issues: ${issues.join(', ')}`, 422);

    const confirmedCount = await prisma.shiftAssignment.count({ where: { shiftId, status: 'CONFIRMED' } });
    if (confirmedCount >= shift.requiredWorkers) return error(res, 'This shift is fully staffed', 409);

    const assignment = await prisma.shiftAssignment.create({ data: { shiftId, userId, status: 'PENDING' } });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    for (const admin of admins) {
      await createNotification({ userId: admin.id, type: 'SHIFT_ASSIGNED', title: 'New Shift Application', message: `${req.user.name} has applied for: ${shift.title}`, data: { shiftId, assignmentId: assignment.id } });
    }

    await createAuditLog({ userId, action: 'ASSIGN', entity: 'ShiftAssignment', entityId: assignment.id, details: { shiftId, type: 'self-apply' } });
    success(res, assignment, 'Application submitted — awaiting confirmation', 201);
  } catch (err) { next(err); }
};

exports.confirmApplication = async (req, res, next) => {
  try {
    const { action } = req.body; // 'confirm' | 'decline'
    const assignment = await prisma.shiftAssignment.findUnique({ where: { id: req.params.id }, include: { shift: true } });
    if (!assignment) return error(res, 'Assignment not found', 404);
    if (assignment.status !== 'PENDING') return error(res, 'Assignment is not pending', 409);

    const newStatus = action === 'confirm' ? 'CONFIRMED' : 'DECLINED';
    await prisma.shiftAssignment.update({ where: { id: req.params.id }, data: { status: newStatus, confirmedAt: action === 'confirm' ? new Date() : null } });

    if (action === 'confirm') {
      const confirmedCount = await prisma.shiftAssignment.count({ where: { shiftId: assignment.shiftId, status: 'CONFIRMED' } });
      const newShiftStatus = confirmedCount >= assignment.shift.requiredWorkers ? 'FILLED' : 'PARTIALLY_FILLED';
      await prisma.shift.update({ where: { id: assignment.shiftId }, data: { status: newShiftStatus } });
      await createNotification({ userId: assignment.userId, type: 'SHIFT_ASSIGNED', title: 'Application Confirmed', message: `Your application for "${assignment.shift.title}" has been confirmed.`, data: { shiftId: assignment.shiftId } });
    } else {
      await createNotification({ userId: assignment.userId, type: 'SHIFT_CANCELLED', title: 'Application Declined', message: `Your application for "${assignment.shift.title}" was not successful.`, data: { shiftId: assignment.shiftId } });
    }

    await createAuditLog({ userId: req.user.id, action: action === 'confirm' ? 'APPROVE' : 'REJECT', entity: 'ShiftAssignment', entityId: req.params.id });
    success(res, null, `Application ${action === 'confirm' ? 'confirmed' : 'declined'}`);
  } catch (err) { next(err); }
};

exports.getAvailableShifts = async (req, res, next) => {
  try {
    const { from, to, facilityId, roleId } = req.query;
    const userId = req.user.id;

    const where = { status: { in: ['OPEN', 'PARTIALLY_FILLED'] } };
    if (facilityId) where.facilityId = facilityId;
    if (roleId) where.roleId = roleId;
    if (from || to) where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);

    const [shifts, myApplications] = await Promise.all([
      prisma.shift.findMany({ where, include: { facility: true, role: true, assignments: { select: { userId: true, status: true } } }, orderBy: { date: 'asc' } }),
      prisma.shiftAssignment.findMany({ where: { userId }, select: { shiftId: true, status: true } }),
    ]);

    const appliedMap = Object.fromEntries(myApplications.map((a) => [a.shiftId, a.status]));

    const result = shifts.map((s) => ({
      ...s,
      confirmedCount: s.assignments.filter((a) => a.status === 'CONFIRMED').length,
      myApplicationStatus: appliedMap[s.id] || null,
    }));

    success(res, result);
  } catch (err) { next(err); }
};

exports.getTimesheetByFacility = async (req, res, next) => {
  try {
    const { facilityId, from, to } = req.query;
    if (!facilityId) return error(res, 'facilityId is required', 400);

    const where = { facilityId };
    if (from || to) where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);

    const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
    if (!facility) return error(res, 'Facility not found', 404);

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        role: true,
        attendance: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            signoff: { select: { id: true, supervisorName: true, signedAt: true, status: true } },
          },
        },
        assignments: {
          where: { status: 'CONFIRMED' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { date: 'asc' },
    });

    let totalHours = 0;
    let totalFacilityAmount = 0;
    let totalEmployeeAmount = 0;

    const enrichedShifts = shifts.map((shift) => {
      const rows = shift.attendance.map((att) => {
        const hours = att.hoursWorked ?? 0;
        const facilityAmount = hours * shift.facilityHourlyRate;
        const employeeAmount = hours * shift.hourlyRate;
        return { ...att, hours, facilityAmount, employeeAmount };
      });
      const shiftHours = rows.reduce((s, r) => s + r.hours, 0);
      const shiftFacilityAmount = rows.reduce((s, r) => s + r.facilityAmount, 0);
      const shiftEmployeeAmount = rows.reduce((s, r) => s + r.employeeAmount, 0);
      totalHours += shiftHours;
      totalFacilityAmount += shiftFacilityAmount;
      totalEmployeeAmount += shiftEmployeeAmount;
      return { ...shift, attendance: rows, shiftHours, shiftFacilityAmount, shiftEmployeeAmount };
    });

    return success(res, {
      facility,
      shifts: enrichedShifts,
      summary: { totalHours, totalFacilityAmount, totalEmployeeAmount, shiftCount: shifts.length },
      period: { from, to },
    });
  } catch (err) { next(err); }
};

exports.getMyShifts = async (req, res, next) => {
  try {
    const { status, from, to } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const dateFilter = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const assignments = await prisma.shiftAssignment.findMany({
      where,
      include: { shift: { include: { facility: true, role: true } } },
      orderBy: { shift: { date: 'asc' } },
    });

    const filtered = (from || to)
      ? assignments.filter((a) => {
          const d = new Date(a.shift.date);
          if (from && d < new Date(from)) return false;
          if (to && d > new Date(to)) return false;
          return true;
        })
      : assignments;

    success(res, filtered);
  } catch (err) { next(err); }
};
