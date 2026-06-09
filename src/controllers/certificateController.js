const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.user.id },
      include: {
        course: { select: { id: true, title: true, description: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
    return success(res, certificates);
  } catch (err) {
    next(err);
  }
};

const getCertificateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, description: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!certificate) return error(res, 'Certificate not found', 404);

    if (req.user.role === 'EMPLOYEE' && certificate.userId !== req.user.id) {
      return error(res, 'Access denied', 403);
    }

    return success(res, certificate);
  } catch (err) {
    next(err);
  }
};

const getCertificateByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const certificate = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId } },
      include: {
        course: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!certificate) return error(res, 'Certificate not found for this course', 404);
    return success(res, certificate);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyCertificates, getCertificateById, getCertificateByCourse };
