const { PrismaClient } = require('@prisma/client');
const { success } = require('../utils/apiResponse');

const prisma = new PrismaClient();

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    success(res, notifications);
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id, userId: req.user.id }, data: { isRead: true } });
    success(res, null, 'Marked as read');
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
    success(res, null, 'All notifications marked as read');
  } catch (err) { next(err); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
    success(res, { count });
  } catch (err) { next(err); }
};
