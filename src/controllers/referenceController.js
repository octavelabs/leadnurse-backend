const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { createAuditLog } = require('../services/auditService');

const prisma = new PrismaClient();

const REFERENCE_INCLUDE = {
  worker: { select: { id: true, name: true, email: true } },
  addedBy: { select: { id: true, name: true } },
  response: true,
};

// ─── Admin: Add a reference request ──────────────────────────────────────────

exports.addReference = async (req, res, next) => {
  try {
    const {
      workerId, refereeName, refereeEmail, refereeJobTitle,
      refereeOrganisation, relationship, employmentStart, employmentEnd,
    } = req.body;

    if (!workerId || !refereeName || !refereeEmail) {
      return error(res, 'workerId, refereeName and refereeEmail are required', 400);
    }

    const worker = await prisma.user.findUnique({ where: { id: workerId } });
    if (!worker) return error(res, 'Worker not found', 404);

    const reference = await prisma.reference.create({
      data: {
        workerId,
        addedById: req.user.id,
        refereeName: refereeName.trim(),
        refereeEmail: refereeEmail.trim().toLowerCase(),
        refereeJobTitle: refereeJobTitle?.trim() || null,
        refereeOrganisation: refereeOrganisation?.trim() || null,
        relationship: relationship || 'OTHER',
        employmentStart: employmentStart ? new Date(employmentStart) : null,
        employmentEnd: employmentEnd ? new Date(employmentEnd) : null,
      },
      include: REFERENCE_INCLUDE,
    });

    await createAuditLog({ userId: req.user.id, action: 'CREATE', entity: 'Reference', entityId: reference.id, details: { workerId, refereeName } });
    return success(res, reference, 'Reference added', 201);
  } catch (err) { next(err); }
};

// ─── Admin: Get all references for a worker ───────────────────────────────────

exports.getWorkerReferences = async (req, res, next) => {
  try {
    const references = await prisma.reference.findMany({
      where: { workerId: req.params.workerId },
      include: REFERENCE_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return success(res, references);
  } catch (err) { next(err); }
};

// ─── Admin: Get all references (global monitor) ───────────────────────────────

exports.getAllReferences = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const where = status ? { status } : {};

    const [references, total] = await Promise.all([
      prisma.reference.findMany({
        where,
        include: REFERENCE_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
      prisma.reference.count({ where }),
    ]);
    return success(res, { references, total });
  } catch (err) { next(err); }
};

// ─── Admin: Get summary stats ─────────────────────────────────────────────────

exports.getReferenceSummary = async (req, res, next) => {
  try {
    const [total, pending, sent, completed, declined, expired] = await Promise.all([
      prisma.reference.count(),
      prisma.reference.count({ where: { status: 'PENDING' } }),
      prisma.reference.count({ where: { status: 'SENT' } }),
      prisma.reference.count({ where: { status: 'COMPLETED' } }),
      prisma.reference.count({ where: { status: 'DECLINED' } }),
      prisma.reference.count({ where: { status: 'EXPIRED' } }),
    ]);
    return success(res, { total, pending, sent, completed, declined, expired, awaitingResponse: pending + sent });
  } catch (err) { next(err); }
};

// ─── Admin: Send reference request (generate token) ──────────────────────────

exports.sendReferenceRequest = async (req, res, next) => {
  try {
    const ref = await prisma.reference.findUnique({ where: { id: req.params.id } });
    if (!ref) return error(res, 'Reference not found', 404);
    if (ref.status === 'COMPLETED') return error(res, 'This reference has already been completed', 400);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    const updated = await prisma.reference.update({
      where: { id: req.params.id },
      data: { token, tokenExpiresAt, status: 'SENT', requestedAt: new Date() },
      include: REFERENCE_INCLUDE,
    });

    // TODO: send email to ref.refereeEmail with link:
    // `${process.env.FRONTEND_URL}/references/${token}`

    await createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'Reference', entityId: ref.id, details: { action: 'send_request' } });
    return success(res, updated, 'Reference request sent');
  } catch (err) { next(err); }
};

// ─── Admin: Get a single reference with full response ─────────────────────────

exports.getReferenceResponse = async (req, res, next) => {
  try {
    const reference = await prisma.reference.findUnique({
      where: { id: req.params.id },
      include: REFERENCE_INCLUDE,
    });
    if (!reference) return error(res, 'Reference not found', 404);
    return success(res, reference);
  } catch (err) { next(err); }
};

// ─── Admin: Delete a reference request ───────────────────────────────────────

exports.deleteReference = async (req, res, next) => {
  try {
    const ref = await prisma.reference.findUnique({ where: { id: req.params.id } });
    if (!ref) return error(res, 'Reference not found', 404);

    await prisma.reference.delete({ where: { id: req.params.id } });
    await createAuditLog({ userId: req.user.id, action: 'DELETE', entity: 'Reference', entityId: req.params.id });
    return success(res, null, 'Reference removed');
  } catch (err) { next(err); }
};

// ─── Public: Get form context from token (no auth) ───────────────────────────

exports.getPublicReferenceForm = async (req, res, next) => {
  try {
    const reference = await prisma.reference.findUnique({
      where: { token: req.params.token },
      include: { worker: { select: { name: true } } },
    });

    if (!reference) return error(res, 'Invalid or expired reference link', 404);
    if (reference.status === 'COMPLETED') return error(res, 'This reference has already been submitted', 410);
    if (reference.status === 'EXPIRED') return error(res, 'This reference link has expired', 410);

    if (reference.tokenExpiresAt && reference.tokenExpiresAt < new Date()) {
      await prisma.reference.update({ where: { id: reference.id }, data: { status: 'EXPIRED' } });
      return error(res, 'This reference link has expired. Please ask the employer to resend.', 410);
    }

    return success(res, {
      refereeName: reference.refereeName,
      workerFirstName: reference.worker.name.split(' ')[0],
      relationship: reference.relationship,
      refereeOrganisation: reference.refereeOrganisation,
      employmentStart: reference.employmentStart,
      employmentEnd: reference.employmentEnd,
    });
  } catch (err) { next(err); }
};

// ─── Public: Submit reference form (no auth) ─────────────────────────────────

exports.submitReferenceForm = async (req, res, next) => {
  try {
    const reference = await prisma.reference.findUnique({ where: { token: req.params.token } });

    if (!reference) return error(res, 'Invalid reference link', 404);
    if (reference.status === 'COMPLETED') return error(res, 'This reference has already been submitted', 410);
    if (reference.tokenExpiresAt && reference.tokenExpiresAt < new Date()) {
      return error(res, 'This reference link has expired', 410);
    }

    const {
      jobTitleDuringTenure, reliability, timekeeping, teamwork,
      communication, overallPerformance, wouldRehire,
      reasonForLeaving, additionalComments, declarationSigned,
    } = req.body;

    if (!declarationSigned) return error(res, 'You must sign the declaration to submit', 400);

    const ratings = { reliability, timekeeping, teamwork, communication, overallPerformance };
    for (const [key, val] of Object.entries(ratings)) {
      const n = parseInt(val);
      if (isNaN(n) || n < 1 || n > 5) return error(res, `${key} must be a rating between 1 and 5`, 400);
    }

    await prisma.$transaction([
      prisma.referenceResponse.create({
        data: {
          referenceId: reference.id,
          jobTitleDuringTenure: jobTitleDuringTenure?.trim() || null,
          reliability: parseInt(reliability),
          timekeeping: parseInt(timekeeping),
          teamwork: parseInt(teamwork),
          communication: parseInt(communication),
          overallPerformance: parseInt(overallPerformance),
          wouldRehire: Boolean(wouldRehire),
          reasonForLeaving: reasonForLeaving?.trim() || null,
          additionalComments: additionalComments?.trim() || null,
          declarationSigned: true,
        },
      }),
      prisma.reference.update({
        where: { id: reference.id },
        data: { status: 'COMPLETED', completedAt: new Date(), token: null },
      }),
    ]);

    return success(res, null, 'Reference submitted successfully. Thank you.');
  } catch (err) { next(err); }
};
