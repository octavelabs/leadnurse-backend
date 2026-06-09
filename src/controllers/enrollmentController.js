const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return error(res, 'Course not found', 404);
    if (!course.isPublished) return error(res, 'This course is not available for enrollment', 400);

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return error(res, 'You are already enrolled in this course', 409);

    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
      include: { course: { select: { id: true, title: true } } },
    });

    return success(res, enrollment, 'Enrolled successfully', 201);
  } catch (err) {
    next(err);
  }
};

const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user.id },
      include: {
        course: {
          include: {
            _count: { select: { lessons: true } },
            assessment: { select: { id: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // Attach lesson completion counts
    const enriched = await Promise.all(
      enrollments.map(async (enrollment) => {
        const completedLessons = await prisma.progress.count({
          where: { userId: req.user.id, lesson: { courseId: enrollment.courseId }, completed: true },
        });
        return { ...enrollment, completedLessons };
      })
    );

    return success(res, enriched);
  } catch (err) {
    next(err);
  }
};

const unenrollFromCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) return error(res, 'Enrollment not found', 404);
    if (enrollment.completed) return error(res, 'Cannot unenroll from a completed course', 400);

    await prisma.enrollment.delete({ where: { userId_courseId: { userId, courseId } } });
    return success(res, null, 'Unenrolled successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { enrollInCourse, getMyEnrollments, unenrollFromCourse };
