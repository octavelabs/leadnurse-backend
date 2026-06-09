const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return error(res, 'An account with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = generateToken(user);
    return success(res, { user, token }, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user);
    const { password: _, ...userData } = user;
    return success(res, { user: userData, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const PROFILE_SELECT = { id: true, name: true, email: true, role: true, phone: true, address: true, city: true, postcode: true, bio: true, avatarUrl: true, createdAt: true };

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: PROFILE_SELECT });
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No image file provided', 400);
    const avatarUrl = req.file.path;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
      select: PROFILE_SELECT,
    });
    return success(res, user, 'Avatar updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile, uploadAvatar };
