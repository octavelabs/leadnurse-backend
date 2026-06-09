const express = require('express');
const { body } = require('express-validator');
const { markLessonComplete, getCourseProgress } = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, authorize('EMPLOYEE'));

router.get('/course/:courseId', getCourseProgress);

router.post(
  '/complete',
  [body('lessonId').notEmpty().withMessage('lessonId is required')],
  validate,
  markLessonComplete
);

module.exports = router;
