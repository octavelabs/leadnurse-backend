const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { createAuditLog } = require('../services/auditService');
const { createNotification } = require('../services/notificationService');
const { generatePayrollReport } = require('../services/payrollService');

const prisma = new PrismaClient();

exports.getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = status ? { status } : {};
    const [reports, total] = await Promise.all([
      prisma.payrollReport.findMany({ where, include: { generatedBy: { select: { id: true, name: true } }, entries: { select: { id: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: Number(limit) }),
      prisma.payrollReport.count({ where }),
    ]);
    success(res, { reports, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getReport = async (req, res, next) => {
  try {
    const report = await prisma.payrollReport.findUnique({
      where: { id: req.params.id },
      include: { generatedBy: { select: { id: true, name: true } }, entries: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    if (!report) return error(res, 'Payroll report not found', 404);
    success(res, report);
  } catch (err) { next(err); }
};

exports.createReport = async (req, res, next) => {
  try {
    const { periodStart, periodEnd, notes } = req.body;
    const report = await generatePayrollReport({ periodStart, periodEnd, generatedById: req.user.id, notes });
    await createAuditLog({ userId: req.user.id, action: 'CREATE', entity: 'PayrollReport', entityId: report.id });
    success(res, report, 'Payroll report generated', 201);
  } catch (err) { next(err); }
};

exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const data = { status };
    if (status === 'APPROVED') data.approvedAt = new Date();
    if (status === 'PAID') data.paidAt = new Date();

    const report = await prisma.payrollReport.update({ where: { id: req.params.id }, data, include: { entries: { include: { user: { select: { id: true } } } } } });

    if (status === 'PAID') {
      const userIds = [...new Set(report.entries.map((e) => e.userId))];
      for (const uid of userIds) {
        await createNotification({ userId: uid, type: 'PAYROLL_READY', title: 'Payroll Processed', message: 'Your payroll for the recent period has been processed.', data: { reportId: report.id } });
      }
    }

    await createAuditLog({ userId: req.user.id, action: 'APPROVE', entity: 'PayrollReport', entityId: report.id, details: { status } });
    success(res, report, 'Status updated');
  } catch (err) { next(err); }
};

exports.getMyEarnings = async (req, res, next) => {
  try {
    const entries = await prisma.payrollEntry.findMany({
      where: { userId: req.user.id },
      include: { payrollReport: { select: { id: true, periodStart: true, periodEnd: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
    success(res, entries);
  } catch (err) { next(err); }
};
