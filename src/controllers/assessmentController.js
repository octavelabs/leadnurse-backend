const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

const getAssessmentByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) return error(res, 'You must be enrolled to access this assessment', 403);

    const assessment = await prisma.assessment.findUnique({
      where: { courseId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: { id: true, question: true, options: true, order: true },
          // correctAnswer deliberately omitted for employees
        },
      },
    });
    if (!assessment) return error(res, 'No assessment found for this course', 404);

    const attempts = await prisma.assessmentAttempt.findMany({
      where: { userId, assessmentId: assessment.id },
      orderBy: { attemptedAt: 'desc' },
    });

    const attemptsUsed = attempts.length;
    const bestAttempt = attempts.reduce(
      (best, a) => (!best || a.score > best.score ? a : best),
      null
    );

    return success(res, {
      assessment: { ...assessment, attemptsUsed, attemptsRemaining: assessment.maxAttempts - attemptsUsed },
      attempts,
      bestAttempt,
      canAttempt: attemptsUsed < assessment.maxAttempts && !bestAttempt?.passed,
    });
  } catch (err) {
    next(err);
  }
};

const submitAssessment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) return error(res, 'You must be enrolled to take this assessment', 403);

    const assessment = await prisma.assessment.findUnique({
      where: { courseId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!assessment) return error(res, 'Assessment not found', 404);

    const attemptsUsed = await prisma.assessmentAttempt.count({
      where: { userId, assessmentId: assessment.id },
    });

    const alreadyPassed = await prisma.assessmentAttempt.findFirst({
      where: { userId, assessmentId: assessment.id, passed: true },
    });
    if (alreadyPassed) return error(res, 'You have already passed this assessment', 400);

    if (attemptsUsed >= assessment.maxAttempts) {
      return error(res, `Maximum attempts (${assessment.maxAttempts}) reached`, 400);
    }

    if (!Array.isArray(answers) || answers.length !== assessment.questions.length) {
      return error(res, 'Please answer all questions', 400);
    }

    let correctCount = 0;
    const results = assessment.questions.map((q, index) => {
      const selected = answers[index];
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) correctCount++;
      return { questionId: q.id, selected, correct: q.correctAnswer, isCorrect };
    });

    const score = Math.round((correctCount / assessment.questions.length) * 100);
    const passed = score >= assessment.passScore;

    const attempt = await prisma.assessmentAttempt.create({
      data: {
        userId,
        assessmentId: assessment.id,
        score,
        passed,
        answers,
      },
    });

    // Auto-generate certificate if passed
    let certificate = null;
    if (passed) {
      certificate = await prisma.certificate.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: {},
        create: { userId, courseId },
        include: { course: { select: { title: true } }, user: { select: { name: true } } },
      });
    }

    return success(res, {
      attempt,
      score,
      passed,
      correctCount,
      totalQuestions: assessment.questions.length,
      passScore: assessment.passScore,
      results,
      certificate,
    }, passed ? 'Congratulations! You passed!' : `Score: ${score}%. Pass mark is ${assessment.passScore}%.`);
  } catch (err) {
    next(err);
  }
};

const createAssessment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { passScore, maxAttempts, questions } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return error(res, 'Course not found', 404);

    const existing = await prisma.assessment.findUnique({ where: { courseId } });
    if (existing) return error(res, 'Assessment already exists for this course. Use PUT to update.', 409);

    const assessment = await prisma.assessment.create({
      data: {
        courseId,
        passScore: passScore || 70,
        maxAttempts: maxAttempts || 3,
        questions: {
          create: questions.map((q, i) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: q.order || i + 1,
          })),
        },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    return success(res, assessment, 'Assessment created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const updateAssessment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { passScore, maxAttempts, questions } = req.body;

    const assessment = await prisma.assessment.findUnique({ where: { courseId } });
    if (!assessment) return error(res, 'Assessment not found', 404);

    await prisma.assessment.update({
      where: { courseId },
      data: {
        ...(passScore !== undefined && { passScore }),
        ...(maxAttempts !== undefined && { maxAttempts }),
      },
    });

    if (questions && Array.isArray(questions)) {
      await prisma.question.deleteMany({ where: { assessmentId: assessment.id } });
      await prisma.question.createMany({
        data: questions.map((q, i) => ({
          assessmentId: assessment.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          order: q.order || i + 1,
        })),
      });
    }

    const updated = await prisma.assessment.findUnique({
      where: { courseId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    return success(res, updated, 'Assessment updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAssessmentByCourse, submitAssessment, createAssessment, updateAssessment };
