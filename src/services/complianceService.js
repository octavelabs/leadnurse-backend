const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EXPIRY_WARNING_DAYS = 30;

function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  return Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
}

async function checkWorkerCompliance(userId, shift) {
  const requirements = [];
  if (shift.requiresDBS) requirements.push('DBS');
  if (shift.requiresNMC) requirements.push('NMC_PIN');
  if (shift.requiresRightToWork) requirements.push('RIGHT_TO_WORK');
  if (shift.requiresCareCert) requirements.push('CARE_CERTIFICATE');
  if (shift.requiresMandatoryTraining) requirements.push('MANDATORY_TRAINING');

  if (requirements.length === 0) return { valid: true, issues: [] };

  const records = await prisma.workerCompliance.findMany({
    where: { userId, type: { in: requirements } },
  });

  const issues = [];
  for (const req of requirements) {
    const record = records.find((r) => r.type === req);
    if (!record || record.status === 'NOT_SUBMITTED') {
      issues.push(`${req} not submitted`);
    } else if (record.status === 'EXPIRED') {
      issues.push(`${req} is expired`);
    }
  }

  return { valid: issues.length === 0, issues };
}

async function updateComplianceStatuses() {
  const now = new Date();
  const warnDate = new Date(now.getTime() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000);

  await prisma.workerCompliance.updateMany({
    where: { expiryDate: { lt: now }, status: { not: 'EXPIRED' } },
    data: { status: 'EXPIRED' },
  });

  await prisma.workerCompliance.updateMany({
    where: { expiryDate: { gte: now, lte: warnDate }, status: 'VALID' },
    data: { status: 'EXPIRING_SOON' },
  });
}

module.exports = { checkWorkerCompliance, updateComplianceStatuses, getDaysUntilExpiry };
