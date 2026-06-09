const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');

const prisma = new PrismaClient();

exports.getSlidesByLesson = async (req, res, next) => {
  try {
    const slides = await prisma.slide.findMany({
      where: { lessonId: req.params.lessonId },
      orderBy: { order: 'asc' },
    });
    return success(res, slides);
  } catch (err) { next(err); }
};

exports.createSlide = async (req, res, next) => {
  try {
    const { lessonId, title, content, slideType, backgroundTheme, imageUrl, bulletPoints, order } = req.body;

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return error(res, 'Lesson not found', 404);

    let slideOrder = order;
    if (slideOrder === undefined || slideOrder === null) {
      const last = await prisma.slide.findFirst({ where: { lessonId }, orderBy: { order: 'desc' } });
      slideOrder = last ? last.order + 1 : 1;
    }

    const slide = await prisma.slide.create({
      data: {
        lessonId,
        title: title?.trim() || '',
        content: content || '',
        slideType: slideType || 'CONTENT',
        backgroundTheme: backgroundTheme || 'white',
        imageUrl: imageUrl || null,
        bulletPoints: bulletPoints || [],
        order: parseInt(slideOrder),
      },
    });
    return success(res, slide, 'Slide created', 201);
  } catch (err) { next(err); }
};

exports.updateSlide = async (req, res, next) => {
  try {
    const { title, content, slideType, backgroundTheme, imageUrl, bulletPoints, order } = req.body;
    const slide = await prisma.slide.findUnique({ where: { id: req.params.id } });
    if (!slide) return error(res, 'Slide not found', 404);

    const updated = await prisma.slide.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content }),
        ...(slideType !== undefined && { slideType }),
        ...(backgroundTheme !== undefined && { backgroundTheme }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(bulletPoints !== undefined && { bulletPoints }),
        ...(order !== undefined && { order: parseInt(order) }),
      },
    });
    return success(res, updated, 'Slide updated');
  } catch (err) { next(err); }
};

exports.deleteSlide = async (req, res, next) => {
  try {
    const slide = await prisma.slide.findUnique({ where: { id: req.params.id } });
    if (!slide) return error(res, 'Slide not found', 404);
    await prisma.slide.delete({ where: { id: req.params.id } });
    return success(res, null, 'Slide deleted');
  } catch (err) { next(err); }
};
