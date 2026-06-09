const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

const markLessonComplete = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user.id;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { course: true },
    });
    if (!lesson) return error(res, 'Lesson not found', 404);

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.courseId } },
    });
    if (!enrollment) return error(res, 'You are not enrolled in this course', 403);

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { userId, lessonId, completed: true, completedAt: new Date() },
    });

    // Check if all lessons are completed to mark course as done
    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({ where: { courseId: lesson.courseId } }),
      prisma.progress.count({
        where: { userId, lesson: { courseId: lesson.courseId }, completed: true },
      }),
    ]);

    if (totalLessons === completedLessons && !enrollment.completed) {
      await prisma.enrollment.update({
        where: { userId_courseId: { userId, courseId: lesson.courseId } },
        data: { completed: true, completedAt: new Date() },
      });
    }

    return success(res, { progress, totalLessons, completedLessons }, 'Lesson marked as complete');
  } catch (err) {
    next(err);
  }
};

const getCourseProgress = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) return error(res, 'You are not enrolled in this course', 403);

    const [totalLessons, completedProgress] = await Promise.all([
      prisma.lesson.count({ where: { courseId } }),
      prisma.progress.findMany({
        where: { userId, lesson: { courseId }, completed: true },
        select: { lessonId: true, completedAt: true },
      }),
    ]);

    const percentage = totalLessons > 0
      ? Math.round((completedProgress.length / totalLessons) * 100)
      : 0;

    return success(res, {
      enrollment,
      totalLessons,
      completedLessons: completedProgress.length,
      percentage,
      completedLessonIds: completedProgress.map((p) => p.lessonId),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { markLessonComplete, getCourseProgress };
