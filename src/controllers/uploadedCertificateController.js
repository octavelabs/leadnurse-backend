const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

const CERT_LABELS = {
  CARE_CERT_COMBINED:  'Care Certificate Standards 1–15 (Combined)',
  CARE_CERT_STD_1:     'Care Certificate – Standard 1: Understand your role',
  CARE_CERT_STD_2:     'Care Certificate – Standard 2: Your personal development',
  CARE_CERT_STD_3:     'Care Certificate – Standard 3: Duty of care',
  CARE_CERT_STD_4:     'Care Certificate – Standard 4: Equality and diversity',
  CARE_CERT_STD_5:     'Care Certificate – Standard 5: Work in a person-centred way',
  CARE_CERT_STD_6:     'Care Certificate – Standard 6: Communication',
  CARE_CERT_STD_7:     'Care Certificate – Standard 7: Privacy and dignity',
  CARE_CERT_STD_8:     'Care Certificate – Standard 8: Fluids and nutrition',
  CARE_CERT_STD_9:     'Care Certificate – Standard 9: Awareness of mental health, dementia and learning disability',
  CARE_CERT_STD_10:    'Care Certificate – Standard 10: Safeguarding adults',
  CARE_CERT_STD_11:    'Care Certificate – Standard 11: Safeguarding children',
  CARE_CERT_STD_12:    'Care Certificate – Standard 12: Basic life support',
  CARE_CERT_STD_13:    'Care Certificate – Standard 13: Health and safety',
  CARE_CERT_STD_14:    'Care Certificate – Standard 14: GDPR / Handling information',
  CARE_CERT_STD_15:    'Care Certificate – Standard 15: Infection prevention and control',
  AUTISM_AWARENESS_LD: 'Autism Awareness and Learning Disabilities',
  FIRST_AID_CERT:      'First Aid',
  MCA_DOLS:            'MCA & DoLS',
  FOOD_HYGIENE:        'Food Hygiene',
  FIRE_SAFETY:         'Fire Safety',
  MOVING_HANDLING:     'Moving and Handling (Theory and Practical)',
};

// ─── Worker: upload one or more certificates (one file, one or many types) ────

exports.uploadCertificate = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No file uploaded', 400);

    const { certTypes, issueDate, expiryDate, notes } = req.body;

    // certTypes is a JSON string array from the form
    let types;
    try {
      types = JSON.parse(certTypes);
    } catch {
      types = [certTypes];
    }

    if (!Array.isArray(types) || types.length === 0) {
      return error(res, 'At least one certificate type is required', 400);
    }

    const fileUrl = req.file.path;
    const fileName = req.file.originalname;

    const records = await Promise.all(
      types.map((certType) =>
        prisma.uploadedCertificate.create({
          data: {
            userId:    req.user.id,
            certType,
            label:     CERT_LABELS[certType] || certType,
            fileUrl,
            fileName,
            issueDate:  issueDate  ? new Date(issueDate)  : null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            notes:      notes || null,
          },
        })
      )
    );

    return success(res, records, `${records.length} certificate(s) uploaded`, 201);
  } catch (err) { next(err); }
};

// ─── Worker: get my uploaded certificates ────────────────────────────────────

exports.getMyCertificates = async (req, res, next) => {
  try {
    const certs = await prisma.uploadedCertificate.findMany({
      where: { userId: req.user.id },
      orderBy: { uploadedAt: 'desc' },
    });
    return success(res, certs);
  } catch (err) { next(err); }
};

// ─── Worker: delete a certificate ────────────────────────────────────────────

exports.deleteCertificate = async (req, res, next) => {
  try {
    const cert = await prisma.uploadedCertificate.findUnique({ where: { id: req.params.id } });
    if (!cert) return error(res, 'Certificate not found', 404);
    if (cert.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return error(res, 'Not authorised', 403);
    }
    await prisma.uploadedCertificate.delete({ where: { id: req.params.id } });
    return success(res, null, 'Certificate deleted');
  } catch (err) { next(err); }
};

// ─── Admin: get certificates for a specific worker ───────────────────────────

exports.getWorkerCertificates = async (req, res, next) => {
  try {
    const certs = await prisma.uploadedCertificate.findMany({
      where: { userId: req.params.userId },
      orderBy: { uploadedAt: 'desc' },
    });
    return success(res, certs);
  } catch (err) { next(err); }
};
