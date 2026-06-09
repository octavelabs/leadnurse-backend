const express = require('express');
const { body } = require('express-validator');
const { enrollInCourse, getMyEnrollments, unenrollFromCourse } = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/my', getMyEnrollments);

router.post(
  '/',
  authorize('EMPLOYEE'),
  [body('courseId').notEmpty().withMessage('courseId is required')],
  validate,
  enrollInCourse
);

router.delete('/:courseId', authorize('EMPLOYEE'), unenrollFromCourse);

module.exports = router;
