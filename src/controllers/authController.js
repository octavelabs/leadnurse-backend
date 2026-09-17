const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { createAuditLog } = require('../services/auditService');
const { sendEmailVerificationEmail, sendPasswordResetEmail, sendAccountStatusEmail } = require('../services/emailService');

const prisma = new PrismaClient();
const COOKIE = '_lntoken';

const PROFILE_SELECT = {
  id: true, name: true, email: true, role: true,
  isActive: true, emailVerified: true,
  phone: true, address: true, city: true, postcode: true,
  bio: true, avatarUrl: true, createdAt: true,
};

// JWT payload is lean: only id + tokenVersion (role/email are always re-read from DB)
const generateToken = (user, rememberMe = false) =>
  jwt.sign(
    { id: user.id, ver: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d') }
  );

// Frontend (Vercel) and backend (Render) are on different sites, so the auth
// cookie must be SameSite=None to be sent on cross-site API calls in production.
const isProd = process.env.NODE_ENV === 'production';

const setCookie = (res, token, rememberMe = false) =>
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
  });

const clearCookie = (res) =>
  res.clearCookie(COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });

// Hash verification/reset tokens before storing — protects against DB leaks
const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

// ─── Register ─────────────────────────────────────────────────────────────────

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return error(res, 'An account with this email already exists', 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const rawVerifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        password: hashedPassword,
        emailVerified: false,
        emailVerificationToken: hashToken(rawVerifyToken),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      select: PROFILE_SELECT,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${rawVerifyToken}`;
    sendEmailVerificationEmail({ name: user.name, email: user.email, verifyUrl })
      .catch((e) => console.error('[Resend] Verification email failed:', e?.message));

    createAuditLog({ userId: user.id, action: 'CREATE', entity: 'User', entityId: user.id, details: { event: 'register' } }).catch(() => {});

    return success(res, { user }, 'Account created. Please check your email to verify your account before logging in.', 201);
  } catch (err) { next(err); }
};

// ─── Login ────────────────────────────────────────────────────────────────────

exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always run bcrypt to prevent timing-based email enumeration
    const DUMMY = '$2a$12$dummyhashXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const isMatch = await bcrypt.compare(password, user?.password || DUMMY);

    if (!user || !isMatch) {
      if (user) createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'User', entityId: user.id, details: { event: 'login_failed' } }).catch(() => {});
      return error(res, 'Invalid email or password', 401);
    }
    if (!user.isActive) return error(res, 'Your account has been deactivated. Please contact your administrator.', 403);
    if (!user.emailVerified) return error(res, 'Please verify your email address before logging in. Check your inbox for the verification link.', 403);

    const token = generateToken(user, rememberMe);
    setCookie(res, token, rememberMe);

    createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'User', entityId: user.id, details: { event: 'login_success' } }).catch(() => {});

    const { password: _p, isActive: _a, tokenVersion: _v, ...userData } = user;
    return success(res, { user: userData });
  } catch (err) { next(err); }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

exports.logout = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { tokenVersion: { increment: 1 } },
    });
    clearCookie(res);
    createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'User', entityId: req.user.id, details: { event: 'logout' } }).catch(() => {});
    return success(res, null, 'Logged out successfully');
  } catch (err) { next(err); }
};

// ─── Verify email ─────────────────────────────────────────────────────────────

exports.verifyEmail = async (req, res, next) => {
  try {
    const hashed = hashToken(req.params.token);
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashed,
        emailVerificationExpires: { gt: new Date() },
        emailVerified: false,
      },
    });

    if (!user) return error(res, 'Verification link is invalid or has expired. Please request a new one.', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null, emailVerificationExpires: null },
    });

    createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'User', entityId: user.id, details: { event: 'email_verified' } }).catch(() => {});
    return success(res, null, 'Email verified successfully. You can now log in.');
  } catch (err) { next(err); }
};

// ─── Resend verification email ────────────────────────────────────────────────

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const GENERIC = 'If that email has a pending verification, a new link has been sent.';
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) return success(res, null, GENERIC);

    const rawToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashToken(rawToken),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${rawToken}`;
    sendEmailVerificationEmail({ name: user.name, email: user.email, verifyUrl })
      .catch((e) => console.error('[Resend] Resend verification failed:', e?.message));

    return success(res, null, GENERIC);
  } catch (err) { next(err); }
};

// ─── Forgot password ──────────────────────────────────────────────────────────

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const GENERIC = 'If an account with that email exists, a password reset link has been sent.';
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return success(res, null, GENERIC);

    const rawToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashToken(rawToken),
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;
    sendPasswordResetEmail({ name: user.name, email: user.email, resetUrl })
      .catch((e) => console.error('[Resend] Reset email failed:', e?.message));

    createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'User', entityId: user.id, details: { event: 'forgot_password' } }).catch(() => {});
    return success(res, null, GENERIC);
  } catch (err) { next(err); }
};

// ─── Reset password ───────────────────────────────────────────────────────────

exports.resetPassword = async (req, res, next) => {
  try {
    const hashed = hashToken(req.params.token);
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: hashed, resetPasswordExpires: { gt: new Date() } },
    });

    if (!user) return error(res, 'Password reset link is invalid or has expired.', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(req.body.newPassword, 12),
        resetPasswordToken: null,
        resetPasswordExpires: null,
        tokenVersion: { increment: 1 },
      },
    });

    clearCookie(res);
    createAuditLog({ userId: user.id, action: 'UPDATE', entity: 'User', entityId: user.id, details: { event: 'password_reset' } }).catch(() => {});
    return success(res, null, 'Password reset successfully. Please log in with your new password.');
  } catch (err) { next(err); }
};

// ─── Change password (authenticated) ─────────────────────────────────────────

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return error(res, 'Current password is incorrect', 400);

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { password: await bcrypt.hash(newPassword, 12), tokenVersion: { increment: 1 } },
      select: { id: true, tokenVersion: true },
    });

    // Re-issue cookie so the current session stays valid after tokenVersion bump
    setCookie(res, generateToken(updated));

    createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'User', entityId: req.user.id, details: { event: 'password_changed' } }).catch(() => {});
    return success(res, null, 'Password changed successfully.');
  } catch (err) { next(err); }
};

// ─── Admin: toggle user active/inactive ──────────────────────────────────────

exports.toggleUserActive = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return error(res, 'User not found', 404);
    if (target.id === req.user.id) return error(res, 'You cannot deactivate your own account', 400);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: !target.isActive,
        ...(target.isActive ? { tokenVersion: { increment: 1 } } : {}),
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    createAuditLog({
      userId: req.user.id, action: 'UPDATE', entity: 'User', entityId: userId,
      details: { event: updated.isActive ? 'account_reactivated' : 'account_deactivated' },
    }).catch(() => {});
    sendAccountStatusEmail({ name: updated.name, email: updated.email, isActive: updated.isActive })
      .catch((err) => console.error('[Resend] Failed to send account status email:', err?.message));

    return success(res, updated, `Account ${updated.isActive ? 'reactivated' : 'deactivated'} successfully.`);
  } catch (err) { next(err); }
};

// ─── GET /me ──────────────────────────────────────────────────────────────────

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: PROFILE_SELECT });
    return success(res, user);
  } catch (err) { next(err); }
};

// ─── Update profile ───────────────────────────────────────────────────────────

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, city, postcode, bio } = req.body;
    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (phone !== undefined) data.phone = phone.trim() || null;
    if (address !== undefined) data.address = address.trim() || null;
    if (city !== undefined) data.city = city.trim() || null;
    if (postcode !== undefined) data.postcode = postcode.trim() || null;
    if (bio !== undefined) data.bio = bio.trim() || null;
    const user = await prisma.user.update({ where: { id: req.user.id }, data, select: PROFILE_SELECT });
    return success(res, user, 'Profile updated');
  } catch (err) { next(err); }
};

// ─── Upload avatar ────────────────────────────────────────────────────────────

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No image file provided', 400);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: req.file.path },
      select: PROFILE_SELECT,
    });
    return success(res, user, 'Avatar updated');
  } catch (err) { next(err); }
};
