const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { createAuditLog } = require('../services/auditService');
const { updateComplianceStatuses } = require('../services/complianceService');

const prisma = new PrismaClient();

exports.getAllCompliance = async (req, res, next) => {
  try {
    await updateComplianceStatuses();
    const { status, type, userId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (userId) where.userId = userId;

    const records = await prisma.workerCompliance.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: [{ expiryDate: 'asc' }, { status: 'asc' }],
    });
    success(res, records);
  } catch (err) { next(err); }
};

exports.getWorkerCompliance = async (req, res, next) => {
  try {
    await updateComplianceStatuses();
    const records = await prisma.workerCompliance.findMany({ where: { userId: req.params.userId }, orderBy: { type: 'asc' } });
    success(res, records);
  } catch (err) { next(err); }
};

exports.upsertCompliance = async (req, res, next) => {
  try {
    const { userId, type, status, documentNumber, issueDate, expiryDate, notes, verifiedAt } = req.body;

    const data = {};
    if (status !== undefined) data.status = status;
    if (documentNumber !== undefined) data.documentNumber = documentNumber || null;
    if (issueDate !== undefined) data.issueDate = issueDate ? new Date(issueDate) : null;
    if (expiryDate !== undefined) data.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (notes !== undefined) data.notes = notes || null;
    if (verifiedAt !== undefined) data.verifiedAt = verifiedAt ? new Date(verifiedAt) : null;

    const record = await prisma.workerCompliance.upsert({
      where: { userId_type: { userId, type } },
      update: { ...data, updatedAt: new Date() },
      create: { userId, type, ...data },
    });
    await createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'WorkerCompliance', entityId: record.id, details: { type, userId } });
    success(res, record, 'Compliance record saved');
  } catch (err) { next(err); }
};

exports.getMyCompliance = async (req, res, next) => {
  try {
    await updateComplianceStatuses();
    const records = await prisma.workerCompliance.findMany({ where: { userId: req.user.id }, orderBy: { type: 'asc' } });
    success(res, records);
  } catch (err) { next(err); }
};

const VALID_TYPES = ['DBS', 'NMC_PIN', 'RIGHT_TO_WORK', 'CARE_CERTIFICATE', 'MANDATORY_TRAINING', 'FIRST_AID', 'MANUAL_HANDLING', 'INFECTION_CONTROL', 'SAFEGUARDING', 'OTHER'];

exports.submitMyCompliance = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No file provided', 400);
    const { type } = req.body;
    if (!type || !VALID_TYPES.includes(type)) return error(res, 'Invalid compliance type', 400);

    const documentUrl = req.file.path;
    const existing = await prisma.workerCompliance.findUnique({ where: { userId_type: { userId: req.user.id, type } } });
    const newStatus = existing && existing.status !== 'NOT_SUBMITTED' ? existing.status : 'UNDER_REVIEW';

    const record = await prisma.workerCompliance.upsert({
      where: { userId_type: { userId: req.user.id, type } },
      update: { documentUrl, status: newStatus, updatedAt: new Date() },
      create: { userId: req.user.id, type, documentUrl, status: 'UNDER_REVIEW' },
    });
    await createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'WorkerCompliance', entityId: record.id, details: { type, action: 'self_submit' } });
    success(res, record, 'Document submitted for review');
  } catch (err) { next(err); }
};

exports.uploadComplianceDocument = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No file provided', 400);

    const record = await prisma.workerCompliance.findUnique({ where: { id: req.params.id } });
    if (!record) return error(res, 'Compliance record not found', 404);

    // Workers can only upload to their own records; admins can upload to any
    if (req.user.role !== 'ADMIN' && record.userId !== req.user.id) {
      return error(res, 'Forbidden', 403);
    }

    const documentUrl = req.file.path;
    const updateData = { documentUrl };
    // When a worker uploads a doc, move status to UNDER_REVIEW if it was NOT_SUBMITTED
    if (req.user.role !== 'ADMIN' && record.status === 'NOT_SUBMITTED') {
      updateData.status = 'UNDER_REVIEW';
    }

    const updated = await prisma.workerCompliance.update({
      where: { id: req.params.id },
      data: updateData,
    });
    await createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'WorkerCompliance', entityId: record.id, details: { type: record.type, action: 'document_upload' } });
    success(res, updated, 'Document uploaded');
  } catch (err) { next(err); }
};

exports.getExpiringCompliance = async (req, res, next) => {
  try {
    await updateComplianceStatuses();
    const records = await prisma.workerCompliance.findMany({
      where: { status: { in: ['EXPIRING_SOON', 'EXPIRED'] } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { expiryDate: 'asc' },
    });
    success(res, records);
  } catch (err) { next(err); }
};
