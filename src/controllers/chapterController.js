const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

// ─── Admin: Get all chapters for a course ─────────────────────────────────────

exports.getChaptersByCourse = async (req, res, next) => {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { courseId: req.params.courseId },
      include: {
        lessons: { orderBy: { order: 'asc' } },
        quiz: { include: { questions: { orderBy: { order: 'asc' } } } },
      },
      orderBy: { order: 'asc' },
    });
    return success(res, chapters);
  } catch (err) { next(err); }
};

// ─── Admin: Create a chapter ──────────────────────────────────────────────────

exports.createChapter = async (req, res, next) => {
  try {
    const { courseId, title, description, order } = req.body;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return error(res, 'Course not found', 404);

    let chapterOrder = order;
    if (!chapterOrder) {
      const last = await prisma.chapter.findFirst({ where: { courseId }, orderBy: { order: 'desc' } });
      chapterOrder = last ? last.order + 1 : 1;
    }

    const chapter = await prisma.chapter.create({
      data: { courseId, title: title.trim(), description: description?.trim() || null, order: chapterOrder },
      include: { lessons: true, quiz: true },
    });
    return success(res, chapter, 'Chapter created', 201);
  } catch (err) { next(err); }
};

// ─── Admin: Update a chapter ──────────────────────────────────────────────────

exports.updateChapter = async (req, res, next) => {
  try {
    const { title, description, order } = req.body;
    const chapter = await prisma.chapter.findUnique({ where: { id: req.params.id } });
    if (!chapter) return error(res, 'Chapter not found', 404);

    const updated = await prisma.chapter.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(order !== undefined && { order }),
      },
      include: { lessons: true, quiz: { include: { questions: true } } },
    });
    return success(res, updated, 'Chapter updated');
  } catch (err) { next(err); }
};

// ─── Admin: Delete a chapter ──────────────────────────────────────────────────

exports.deleteChapter = async (req, res, next) => {
  try {
    const chapter = await prisma.chapter.findUnique({ where: { id: req.params.id } });
    if (!chapter) return error(res, 'Chapter not found', 404);
    await prisma.chapter.delete({ where: { id: req.params.id } });
    return success(res, null, 'Chapter deleted');
  } catch (err) { next(err); }
};

// ─── Admin: Create/update chapter quiz ───────────────────────────────────────

exports.upsertChapterQuiz = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const { questions } = req.body; // [{ question, options[], correctAnswer, explanation?, order? }]

    if (!Array.isArray(questions) || questions.length === 0) return error(res, 'At least one question is required', 400);
    if (questions.length > 5) return error(res, 'Maximum 5 questions per chapter quiz', 400);

    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) return error(res, 'Chapter not found', 404);

    // Upsert quiz record
    const quiz = await prisma.chapterQuiz.upsert({
      where: { chapterId },
      update: {},
      create: { chapterId },
    });

    // Replace all questions
    await prisma.chapterQuestion.deleteMany({ where: { quizId: quiz.id } });
    await prisma.chapterQuestion.createMany({
      data: questions.map((q, i) => ({
        quizId: quiz.id,
        question: q.question.trim(),
        options: q.options,
        correctAnswer: parseInt(q.correctAnswer),
        explanation: q.explanation?.trim() || null,
        order: q.order ?? i,
      })),
    });

    const updated = await prisma.chapterQuiz.findUnique({
      where: { id: quiz.id },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    return success(res, updated, 'Chapter quiz saved');
  } catch (err) { next(err); }
};

// ─── Employee: Get chapter quiz (questions only, no answers) ─────────────────

exports.getChapterQuizForStudent = async (req, res, next) => {
  try {
    const quiz = await prisma.chapterQuiz.findUnique({
      where: { chapterId: req.params.chapterId },
      include: { questions: { orderBy: { order: 'asc' }, select: { id: true, question: true, options: true, order: true } } },
    });
    if (!quiz) return error(res, 'No quiz for this chapter', 404);

    const attempt = await prisma.chapterQuizAttempt.findFirst({
      where: { userId: req.user.id, quizId: quiz.id },
      orderBy: { attemptedAt: 'desc' },
    });

    return success(res, { ...quiz, previousAttempt: attempt || null });
  } catch (err) { next(err); }
};

// ─── Employee: Submit chapter quiz attempt ────────────────────────────────────

exports.submitChapterQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // [answerIndex, ...]

    const quiz = await prisma.chapterQuiz.findUnique({
      where: { chapterId: req.params.chapterId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz) return error(res, 'Quiz not found', 404);
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return error(res, `Expected ${quiz.questions.length} answers`, 400);
    }

    const correct = quiz.questions.filter((q, i) => parseInt(answers[i]) === q.correctAnswer).length;
    const score = (correct / quiz.questions.length) * 100;
    const passed = score >= 67; // 2/3 or more correct

    const attempt = await prisma.chapterQuizAttempt.create({
      data: { userId: req.user.id, quizId: quiz.id, chapterId: req.params.chapterId, score, passed, answers: answers.map(Number) },
    });

    // Return with correct answers so UI can show feedback
    const results = quiz.questions.map((q, i) => ({
      question: q.question,
      yourAnswer: parseInt(answers[i]),
      correctAnswer: q.correctAnswer,
      correct: parseInt(answers[i]) === q.correctAnswer,
      explanation: q.explanation,
      options: q.options,
    }));

    return success(res, { attempt, results, score, passed });
  } catch (err) { next(err); }
};
