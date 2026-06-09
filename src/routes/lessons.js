const express = require('express');
const { body } = require('express-validator');
const {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/lessonController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/course/:courseId', getLessonsByCourse);
router.get('/:id', getLessonById);

router.post(
  '/',
  authorize('ADMIN'),
  [
    body('courseId').notEmpty().withMessage('courseId is required'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ],
  validate,
  createLesson
);

router.put(
  '/:id',
  authorize('ADMIN'),
  [
    body('title').optional().trim().notEmpty(),
    body('content').optional().notEmpty(),
    body('order').optional().isInt({ min: 1 }),
  ],
  validate,
  updateLesson
);

router.delete('/:id', authorize('ADMIN'), deleteLesson);

module.exports = router;
