const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { createAuditLog } = require('../services/auditService');

const prisma = new PrismaClient();

// ─── Admin: Upload a signable document ───────────────────────────────────────

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No file provided', 400);
    const { title, description } = req.body;
    if (!title?.trim()) return error(res, 'Document title is required', 400);

    const doc = await prisma.signableDocument.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        documentUrl: req.file.path,
        uploadedById: req.user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true } }, signatures: true },
    });

    await createAuditLog({ userId: req.user.id, action: 'CREATE', entity: 'SignableDocument', entityId: doc.id });
    return success(res, doc, 'Document uploaded', 201);
  } catch (err) { next(err); }
};

// ─── Admin: Get all documents ─────────────────────────────────────────────────

exports.getAllDocuments = async (req, res, next) => {
  try {
    const docs = await prisma.signableDocument.findMany({
      include: {
        uploadedBy: { select: { id: true, name: true } },
        signatures: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return success(res, docs);
  } catch (err) { next(err); }
};

// ─── Admin: Assign document to employees ─────────────────────────────────────

exports.assignDocument = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) return error(res, 'Provide at least one userId', 400);

    const doc = await prisma.signableDocument.findUnique({ where: { id: req.params.id } });
    if (!doc) return error(res, 'Document not found', 404);

    const created = await Promise.all(
      userIds.map((userId) =>
        prisma.documentSignature.upsert({
          where: { documentId_userId: { documentId: doc.id, userId } },
          update: {},
          create: { documentId: doc.id, userId },
        })
      )
    );

    await createAuditLog({ userId: req.user.id, action: 'ASSIGN', entity: 'SignableDocument', entityId: doc.id, details: { userIds } });
    return success(res, created, `Document assigned to ${created.length} employee(s)`);
  } catch (err) { next(err); }
};

// ─── Admin: Delete a document ─────────────────────────────────────────────────

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await prisma.signableDocument.findUnique({ where: { id: req.params.id } });
    if (!doc) return error(res, 'Document not found', 404);
    await prisma.signableDocument.delete({ where: { id: req.params.id } });
    return success(res, null, 'Document deleted');
  } catch (err) { next(err); }
};

// ─── Employee: Get my documents to sign ──────────────────────────────────────

exports.getMyDocuments = async (req, res, next) => {
  try {
    const signatures = await prisma.documentSignature.findMany({
      where: { userId: req.user.id },
      include: { document: { include: { uploadedBy: { select: { name: true } } } } },
      orderBy: { assignedAt: 'desc' },
    });
    return success(res, signatures);
  } catch (err) { next(err); }
};

// ─── Employee: Sign a document ────────────────────────────────────────────────

exports.signDocument = async (req, res, next) => {
  try {
    const { signatureText } = req.body;
    if (!signatureText?.trim()) return error(res, 'Signature (typed name) is required', 400);

    const sig = await prisma.documentSignature.findFirst({
      where: { id: req.params.sigId, userId: req.user.id },
    });
    if (!sig) return error(res, 'Document not found or not assigned to you', 404);
    if (sig.status === 'SIGNED') return error(res, 'Document already signed', 400);

    const updated = await prisma.documentSignature.update({
      where: { id: sig.id },
      data: { status: 'SIGNED', signatureText: signatureText.trim(), signedAt: new Date() },
      include: { document: true },
    });

    await createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'DocumentSignature', entityId: sig.id, details: { action: 'signed' } });
    return success(res, updated, 'Document signed successfully');
  } catch (err) { next(err); }
};

// ─── Employee: Decline a document ────────────────────────────────────────────

exports.declineDocument = async (req, res, next) => {
  try {
    const sig = await prisma.documentSignature.findFirst({
      where: { id: req.params.sigId, userId: req.user.id },
    });
    if (!sig) return error(res, 'Document not found or not assigned to you', 404);
    if (sig.status !== 'PENDING') return error(res, 'Document cannot be declined at this stage', 400);

    const updated = await prisma.documentSignature.update({
      where: { id: sig.id },
      data: { status: 'DECLINED' },
    });
    return success(res, updated, 'Document declined');
  } catch (err) { next(err); }
};
