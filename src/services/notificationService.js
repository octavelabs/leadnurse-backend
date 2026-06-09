const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createNotification({ userId, type, title, message, data }) {
  try {
    return await prisma.notification.create({
      data: { userId, type, title, message, data: data || null },
    });
  } catch (_) {
    // fire-and-forget
  }
}

async function createBulkNotifications(notifications) {
  try {
    return await prisma.notification.createMany({ data: notifications });
  } catch (_) {}
}

module.exports = { createNotification, createBulkNotifications };
