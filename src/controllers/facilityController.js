const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { createAuditLog } = require('../services/auditService');

const prisma = new PrismaClient();

exports.getFacilities = async (req, res, next) => {
  try {
    const facilities = await prisma.facility.findMany({ orderBy: { name: 'asc' } });
    success(res, facilities);
  } catch (err) { next(err); }
};

exports.getFacility = async (req, res, next) => {
  try {
    const facility = await prisma.facility.findUnique({ where: { id: req.params.id }, include: { shifts: { take: 10, orderBy: { date: 'desc' } } } });
    if (!facility) return error(res, 'Facility not found', 404);
    success(res, facility);
  } catch (err) { next(err); }
};

exports.createFacility = async (req, res, next) => {
  try {
    const facility = await prisma.facility.create({ data: req.body });
    await createAuditLog({ userId: req.user.id, action: 'CREATE', entity: 'Facility', entityId: facility.id });
    success(res, facility, 'Facility created', 201);
  } catch (err) { next(err); }
};

exports.updateFacility = async (req, res, next) => {
  try {
    const facility = await prisma.facility.update({ where: { id: req.params.id }, data: req.body });
    await createAuditLog({ userId: req.user.id, action: 'UPDATE', entity: 'Facility', entityId: facility.id });
    success(res, facility, 'Facility updated');
  } catch (err) { next(err); }
};

exports.deleteFacility = async (req, res, next) => {
  try {
    await prisma.facility.delete({ where: { id: req.params.id } });
    await createAuditLog({ userId: req.user.id, action: 'DELETE', entity: 'Facility', entityId: req.params.id });
    success(res, null, 'Facility deleted');
  } catch (err) { next(err); }
};
