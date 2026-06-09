const { PrismaClient } = require('@prisma/client');
const { success } = require('../utils/apiResponse');

const prisma = new PrismaClient();

exports.getWorkforceDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const today = new Date(now.toDateString());
    const tomorrow = new Date(today.getTime() + 86400000);

    const [
      totalWorkers,
      totalShifts,
      openShifts,
      todayShifts,
      monthAttendance,
      expiringCompliance,
      recentAuditLogs,
      shiftsByStatus,
      referencesAwaitingResponse,
      referencesCompleted,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.shift.count(),
      prisma.shift.count({ where: { status: 'OPEN' } }),
      prisma.shift.count({ where: { date: { gte: today, lt: tomorrow } } }),
      prisma.attendance.aggregate({ where: { checkInTime: { gte: startOfMonth } }, _sum: { hoursWorked: true }, _count: true }),
      prisma.workerCompliance.count({ where: { status: { in: ['EXPIRING_SOON', 'EXPIRED'] } } }),
      prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
      prisma.shift.groupBy({ by: ['status'], _count: true }),
      prisma.reference.count({ where: { status: { in: ['PENDING', 'SENT'] } } }),
      prisma.reference.count({ where: { status: 'COMPLETED' } }),
    ]);

    success(res, {
      totalWorkers,
      totalShifts,
      openShifts,
      todayShifts,
      monthlyHours: monthAttendance._sum.hoursWorked || 0,
      monthlyAttendanceCount: monthAttendance._count,
      expiringCompliance,
      recentAuditLogs,
      shiftsByStatus: shiftsByStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      referencesAwaitingResponse,
      referencesCompleted,
    });
  } catch (err) { next(err); }
};

exports.getAttendanceStats = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from || to) {
      where.checkInTime = {};
      if (from) where.checkInTime.gte = new Date(from);
      if (to) where.checkInTime.lte = new Date(to);
    }

    const [byStatus, byUser, totalHours] = await Promise.all([
      prisma.attendance.groupBy({ by: ['status'], where, _count: true }),
      prisma.attendance.groupBy({
        by: ['userId'],
        where: { ...where, checkInTime: { not: null } },
        _sum: { hoursWorked: true, overtimeHours: true },
        _count: true,
        orderBy: { _sum: { hoursWorked: 'desc' } },
        take: 10,
      }),
      prisma.attendance.aggregate({ where, _sum: { hoursWorked: true, overtimeHours: true } }),
    ]);

    success(res, {
      byStatus: byStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      topWorkers: byUser,
      totalHours: totalHours._sum.hoursWorked || 0,
      totalOvertimeHours: totalHours._sum.overtimeHours || 0,
    });
  } catch (err) { next(err); }
};
