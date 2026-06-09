const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

const getLessonsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return error(res, 'Course not found', 404);
    if (req.user.role === 'EMPLOYEE' && !course.isPublished) return error(res, 'Course not found', 404);

    if (req.user.role === 'EMPLOYEE') {
      const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId } } });
      if (!enrollment) return error(res, 'You must enroll in this course to view lessons', 403);
    }

    const lessons = await prisma.lesson.findMany({ where: { courseId }, orderBy: { order: 'asc' } });
    return success(res, lessons);
  } catch (err) { next(err); }
};

const getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, isPublished: true } },
        chapter: { include: { lessons: { orderBy: { order: 'asc' }, select: { id: true, order: true, title: true } }, quiz: { select: { id: true } } } },
      },
    });

    if (!lesson) return error(res, 'Lesson not found', 404);
    if (req.user.role === 'EMPLOYEE' && !lesson.course.isPublished) return error(res, 'Lesson not found', 404);

    if (req.user.role === 'EMPLOYEE') {
      const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId: lesson.courseId } } });
      if (!enrollment) return error(res, 'You must enroll to view this lesson', 403);

      const progress = await prisma.progress.findUnique({ where: { userId_lessonId: { userId: req.user.id, lessonId: id } } });

      if (lesson.chapter) {
        // Chapter-based navigation
        const chapterLessons = lesson.chapter.lessons;
        const currentIndex = chapterLessons.findIndex((l) => l.id === id);
        const prevSlide = currentIndex > 0 ? chapterLessons[currentIndex - 1] : null;
        const nextSlide = currentIndex < chapterLessons.length - 1 ? chapterLessons[currentIndex + 1] : null;
        const isLastInChapter = currentIndex === chapterLessons.length - 1;

        // Check if chapter quiz was passed
        let quizPassed = false;
        if (lesson.chapter.quiz) {
          const attempt = await prisma.chapterQuizAttempt.findFirst({
            where: { userId: req.user.id, quizId: lesson.chapter.quiz.id, passed: true },
          });
          quizPassed = !!attempt;
        }

        return success(res, {
          ...lesson,
          progress,
          navigation: {
            current: currentIndex + 1,
            total: chapterLessons.length,
            prevLessonId: prevSlide?.id || null,
            nextLessonId: nextSlide?.id || null,
            isLastInChapter,
            hasChapterQuiz: !!lesson.chapter.quiz,
            chapterQuizPassed: quizPassed,
          },
        });
      }

      // Legacy flat navigation
      const allLessons = await prisma.lesson.findMany({ where: { courseId: lesson.courseId }, orderBy: { order: 'asc' }, select: { id: true, order: true } });
      const currentIndex = allLessons.findIndex((l) => l.id === id);
      return success(res, {
        ...lesson,
        progress,
        navigation: {
          current: currentIndex + 1,
          total: allLessons.length,
          prevLessonId: currentIndex > 0 ? allLessons[currentIndex - 1].id : null,
          nextLessonId: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null,
          isLastInChapter: false,
          hasChapterQuiz: false,
          chapterQuizPassed: false,
        },
      });
    }

    return success(res, lesson);
  } catch (err) { next(err); }
};

const createLesson = async (req, res, next) => {
  try {
    const { courseId, chapterId, title, content, order, slideType, backgroundTheme, imageUrl, bulletPoints } = req.body;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return error(res, 'Course not found', 404);

    let lessonOrder = order;
    if (!lessonOrder) {
      const whereClause = chapterId ? { chapterId } : { courseId };
      const last = await prisma.lesson.findFirst({ where: whereClause, orderBy: { order: 'desc' } });
      lessonOrder = last ? last.order + 1 : 1;
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        chapterId: chapterId || null,
        title: title.trim(),
        content: content || '',
        order: parseInt(lessonOrder),
        slideType: slideType || 'CONTENT',
        backgroundTheme: backgroundTheme || 'white',
        imageUrl: imageUrl || null,
        bulletPoints: bulletPoints || [],
      },
    });
    return success(res, lesson, 'Lesson created', 201);
  } catch (err) { next(err); }
};

const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, order, slideType, backgroundTheme, imageUrl, bulletPoints } = req.body;
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return error(res, 'Lesson not found', 404);

    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content }),
        ...(order !== undefined && { order: parseInt(order) }),
        ...(slideType !== undefined && { slideType }),
        ...(backgroundTheme !== undefined && { backgroundTheme }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(bulletPoints !== undefined && { bulletPoints }),
      },
    });
    return success(res, updated, 'Lesson updated');
  } catch (err) { next(err); }
};

const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return error(res, 'Lesson not found', 404);
    await prisma.lesson.delete({ where: { id } });
    return success(res, null, 'Lesson deleted');
  } catch (err) { next(err); }
};

module.exports = { getLessonsByCourse, getLessonById, createLesson, updateLesson, deleteLesson };
