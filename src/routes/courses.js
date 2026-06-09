const express = require('express');
const { body } = require('express-validator');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getAdminStats,
} = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllCourses);
router.get('/admin/stats', authorize('ADMIN'), getAdminStats);
router.get('/:id', getCourseById);

router.post(
  '/',
  authorize('ADMIN'),
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  validate,
  createCourse
);

router.put(
  '/:id',
  authorize('ADMIN'),
  [
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().trim().notEmpty(),
    body('isPublished').optional().isBoolean(),
  ],
  validate,
  updateCourse
);

router.delete('/:id', authorize('ADMIN'), deleteCourse);

module.exports = router;
