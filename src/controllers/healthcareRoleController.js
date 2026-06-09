const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { createAuditLog } = require('../services/auditService');

const prisma = new PrismaClient();

exports.getRoles = async (req, res, next) => {
  try {
    const roles = await prisma.healthcareRole.findMany({ orderBy: { name: 'asc' } });
    success(res, roles);
  } catch (err) { next(err); }
};

exports.createRole = async (req, res, next) => {
  try {
    const role = await prisma.healthcareRole.create({ data: req.body });
    await createAuditLog({ userId: req.user.id, action: 'CREATE', entity: 'HealthcareRole', entityId: role.id });
    success(res, role, 'Role created', 201);
  } catch (err) { next(err); }
};

exports.updateRole = async (req, res, next) => {
  try {
    const role = await prisma.healthcareRole.update({ where: { id: req.params.id }, data: req.body });
    await createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'HealthcareRole', entityId: role.id });
    success(res, role, 'Role updated');
  } catch (err) { next(err); }
};

exports.deleteRole = async (req, res, next) => {
  try {
    await prisma.healthcareRole.delete({ where: { id: req.params.id } });
    await createAuditLog({ userId: req.user.id, action: 'DELETE', entity: 'HealthcareRole', entityId: req.params.id });
    success(res, null, 'Role deleted');
  } catch (err) { next(err); }
};

exports.getWorkerRoles = async (req, res, next) => {
  try {
    const workerRoles = await prisma.workerRole.findMany({
      where: { userId: req.params.userId },
      include: { role: true },
    });
    success(res, workerRoles);
  } catch (err) { next(err); }
};

exports.assignWorkerRole = async (req, res, next) => {
  try {
    const { userId, roleId, isPrimary } = req.body;
    const workerRole = await prisma.workerRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: { isPrimary: isPrimary || false },
      create: { userId, roleId, isPrimary: isPrimary || false },
    });
    success(res, workerRole, 'Role assigned', 201);
  } catch (err) { next(err); }
};

exports.removeWorkerRole = async (req, res, next) => {
  try {
    await prisma.workerRole.delete({ where: { id: req.params.id } });
    success(res, null, 'Role removed');
  } catch (err) { next(err); }
};
