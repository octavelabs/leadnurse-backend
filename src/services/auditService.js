const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAuditLog({ userId, action, entity, entityId, details, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: { userId: userId || null, action, entity, entityId: entityId || null, details: details || null, ipAddress: ipAddress || null },
    });
  } catch (_) {
    // fire-and-forget; never propagate
  }
}

module.exports = { createAuditLog };
