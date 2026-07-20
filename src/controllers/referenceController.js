const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { createAuditLog } = require('../services/auditService');
const { sendReferenceRequestEmail, sendReferenceCompletedEmail } = require('../services/emailService');

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

// ─── Admin: Send reference request (generate token + send email) ──────────────

exports.sendReferenceRequest = async (req, res, next) => {
  try {
    const ref = await prisma.reference.findUnique({
      where: { id: req.params.id },
      include: { worker: { select: { name: true } } },
    });
    if (!ref) return error(res, 'Reference not found', 404);
    if (ref.status === 'COMPLETED') return error(res, 'This reference has already been completed', 400);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    const updated = await prisma.reference.update({
      where: { id: req.params.id },
      data: { token, tokenExpiresAt, status: 'SENT', requestedAt: new Date() },
      include: REFERENCE_INCLUDE,
    });

    const formUrl = `${process.env.FRONTEND_URL}/references/${token}`;
    const pdfUrl = process.env.REFERENCE_FORM_PDF_URL || null;

    // Send email — fire-and-forget (don't block the API response)
    sendReferenceRequestEmail({
      refereeName: ref.refereeName,
      refereeEmail: ref.refereeEmail,
      workerName: ref.worker.name,
      formUrl,
      pdfUrl,
    }).catch((err) => console.error('[Resend] Failed to send reference email:', err?.message));

    await createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'Reference', entityId: ref.id, details: { action: 'send_request' } });
    return success(res, updated, 'Reference request sent and email dispatched');
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
      refereeName:          reference.refereeName,
      refereeEmail:         reference.refereeEmail,
      refereeJobTitle:      reference.refereeJobTitle,
      refereeOrganisation:  reference.refereeOrganisation,
      workerName:           reference.worker.name,
      workerFirstName:      reference.worker.name.split(' ')[0],
      relationship:         reference.relationship,
      employmentStart:      reference.employmentStart,
      employmentEnd:        reference.employmentEnd,
    });
  } catch (err) { next(err); }
};

// ─── Public: Submit reference form (no auth) ─────────────────────────────────

exports.submitReferenceForm = async (req, res, next) => {
  try {
    const reference = await prisma.reference.findUnique({
      where: { token: req.params.token },
      include: { worker: { select: { name: true } } },
    });

    if (!reference) return error(res, 'Invalid reference link', 404);
    if (reference.status === 'COMPLETED') return error(res, 'This reference has already been submitted', 410);
    if (reference.tokenExpiresAt && reference.tokenExpiresAt < new Date()) {
      return error(res, 'This reference link has expired', 410);
    }

    const {
      refereeAddress, refereeTelephone, refereeEmailOnForm, refereeDate,
      howTheyKnow, howTheyKnowOther, durationKnown, capacityKnown,
      characterRatings,
      disciplinaryAction, disciplinaryDetails,
      misconductInvestigation, misconductDetails,
      unsuitableForVulnerable, unsuitableDetails,
      additionalComments,
      recommendation, recommendationComments,
      declarationName, declarationPosition, declarationOrganisation,
      declarationSignature, declarationDate, declarationSigned,
    } = req.body;

    if (!declarationSigned) return error(res, 'You must sign the declaration to submit', 400);
    if (!declarationName?.trim()) return error(res, 'Declaration name is required', 400);
    if (!declarationSignature?.trim()) return error(res, 'Signature is required', 400);
    if (!recommendation) return error(res, 'Overall recommendation is required', 400);

    await prisma.$transaction([
      prisma.referenceResponse.create({
        data: {
          referenceId:            reference.id,
          refereeAddress:         refereeAddress?.trim() || null,
          refereeTelephone:       refereeTelephone?.trim() || null,
          refereeEmailOnForm:     refereeEmailOnForm?.trim() || null,
          refereeDate:            refereeDate || null,
          howTheyKnow:            howTheyKnow || null,
          howTheyKnowOther:       howTheyKnowOther?.trim() || null,
          durationKnown:          durationKnown?.trim() || null,
          capacityKnown:          capacityKnown?.trim() || null,
          characterRatings:       characterRatings || null,
          disciplinaryAction:     disciplinaryAction != null ? Boolean(disciplinaryAction) : null,
          disciplinaryDetails:    disciplinaryDetails?.trim() || null,
          misconductInvestigation: misconductInvestigation != null ? Boolean(misconductInvestigation) : null,
          misconductDetails:      misconductDetails?.trim() || null,
          unsuitableForVulnerable: unsuitableForVulnerable != null ? Boolean(unsuitableForVulnerable) : null,
          unsuitableDetails:      unsuitableDetails?.trim() || null,
          additionalComments:     additionalComments?.trim() || null,
          recommendation,
          recommendationComments: recommendationComments?.trim() || null,
          declarationName:        declarationName.trim(),
          declarationPosition:    declarationPosition?.trim() || null,
          declarationOrganisation: declarationOrganisation?.trim() || null,
          declarationSignature:   declarationSignature.trim(),
          declarationDate:        declarationDate || null,
          declarationSigned:      true,
        },
      }),
      prisma.reference.update({
        where: { id: reference.id },
        data: { status: 'COMPLETED', completedAt: new Date(), token: null },
      }),
    ]);

    // Notify compliance team — fire-and-forget
    const adminViewUrl = `${process.env.FRONTEND_URL}/admin/workforce/references`;
    sendReferenceCompletedEmail({
      refereeName: reference.refereeName,
      workerName:  reference.worker.name,
      adminViewUrl,
    }).catch((err) => console.error('[Resend] Failed to send completion notification:', err?.message));

    return success(res, null, 'Reference submitted successfully. Thank you.');
  } catch (err) { next(err); }
};
