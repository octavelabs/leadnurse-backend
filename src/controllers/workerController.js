const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

const WORKER_LIST_SELECT = {
  id: true, name: true, email: true, phone: true, city: true, postcode: true, createdAt: true,
  workerRoles: { include: { role: true } },
  compliance: { select: { type: true, status: true, expiryDate: true } },
};

const WORKER_DETAIL_SELECT = {
  id: true, name: true, email: true, phone: true, address: true, city: true, postcode: true, bio: true, avatarUrl: true, createdAt: true,
  workerRoles: { include: { role: true } },
  compliance: true,
  availability: true,
  shiftAssignments: {
    take: 10,
    orderBy: { assignedAt: 'desc' },
    include: { shift: { include: { facility: true, role: true } } },
  },
};

exports.getWorkers = async (req, res, next) => {
  try {
    const { search, city, roleId, page = 1, limit = 20 } = req.query;
    const where = { role: 'EMPLOYEE' };

    const conditions = [];
    if (search) {
      conditions.push(
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      );
    }
    if (conditions.length) where.OR = conditions;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    const [workers, total] = await Promise.all([
      prisma.user.findMany({ where, select: WORKER_LIST_SELECT, orderBy: { name: 'asc' }, skip: (page - 1) * limit, take: Number(limit) }),
      prisma.user.count({ where }),
    ]);
    success(res, { workers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getWorker = async (req, res, next) => {
  try {
    const worker = await prisma.user.findUnique({ where: { id: req.params.id }, select: WORKER_DETAIL_SELECT });
    if (!worker) return error(res, 'Worker not found', 404);
    success(res, worker);
  } catch (err) { next(err); }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const worker = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, address: true, city: true, postcode: true, bio: true, createdAt: true, workerRoles: { include: { role: true } }, compliance: true, availability: true },
    });
    success(res, worker);
  } catch (err) { next(err); }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    await prisma.workerAvailability.deleteMany({ where: { userId: req.user.id } });
    const records = await prisma.workerAvailability.createMany({
      data: availability.map((a) => ({ ...a, userId: req.user.id })),
    });
    success(res, records, 'Availability updated');
  } catch (err) { next(err); }
};
