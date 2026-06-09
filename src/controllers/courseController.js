const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

const getAllCourses = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = {};

    if (req.user.role === 'EMPLOYEE') {
      where.isPublished = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        _count: { select: { lessons: true, enrollments: true } },
        assessment: { select: { id: true, passScore: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Attach enrollment status for employees
    if (req.user.role === 'EMPLOYEE') {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: req.user.id },
        select: { courseId: true, completed: true },
      });
      const enrollmentMap = Object.fromEntries(enrollments.map((e) => [e.courseId, e]));

      return success(res, courses.map((c) => ({
        ...c,
        enrollment: enrollmentMap[c.id] || null,
      })));
    }

    return success(res, courses);
  } catch (err) {
    next(err);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } },
        assessment: { select: { id: true, passScore: true, maxAttempts: true, _count: { select: { questions: true } } } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) return error(res, 'Course not found', 404);
    if (req.user.role === 'EMPLOYEE' && !course.isPublished) {
      return error(res, 'Course not found', 404);
    }

    let enrollment = null;
    let progress = [];

    if (req.user.role === 'EMPLOYEE') {
      enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.id, courseId: id } },
      });

      if (enrollment) {
        progress = await prisma.progress.findMany({
          where: { userId: req.user.id, lesson: { courseId: id } },
          select: { lessonId: true, completed: true },
        });
      }
    }

    return success(res, { ...course, enrollment, progress });
  } catch (err) {
    next(err);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, isPublished } = req.body;
    const course = await prisma.course.create({
      data: { title, description, isPublished: isPublished || false },
    });
    return success(res, course, 'Course created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, isPublished } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return error(res, 'Course not found', 404);

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });
    return success(res, updated, 'Course updated successfully');
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) return error(res, 'Course not found', 404);

    await prisma.course.delete({ where: { id } });
    return success(res, null, 'Course deleted successfully');
  } catch (err) {
    next(err);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const [totalCourses, totalUsers, totalEnrollments, totalCertificates] = await Promise.all([
      prisma.course.count(),
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.enrollment.count(),
      prisma.certificate.count(),
    ]);
    return success(res, { totalCourses, totalUsers, totalEnrollments, totalCertificates });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, getAdminStats };
