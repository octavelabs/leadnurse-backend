const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

const COOKIE = '_lntoken';

const authenticate = async (req, res, next) => {
  try {
    // Read from httpOnly cookie first; fallback to Authorization header for API clients
    const token =
      req.cookies?.[COOKIE] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) return error(res, 'Authentication required', 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, isActive: true, tokenVersion: true },
    });

    if (!user) return error(res, 'User not found', 401);

    if (!user.isActive) {
      return error(res, 'Your account has been deactivated. Please contact your administrator.', 403);
    }

    // Reject tokens issued before a logout or password change
    if (decoded.ver !== undefined && decoded.ver !== user.tokenVersion) {
      return error(res, 'Session expired, please log in again', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Token expired, please log in again', 401);
    if (err.name === 'JsonWebTokenError') return error(res, 'Invalid token', 401);
    next(err);
  }
};

module.exports = { authenticate, COOKIE };
