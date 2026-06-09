const express = require('express');
const { body } = require('express-validator');
const {
  getAssessmentByCourse,
  submitAssessment,
  createAssessment,
  updateAssessment,
} = require('../controllers/assessmentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticate);

router.get('/course/:courseId', getAssessmentByCourse);

router.post(
  '/course/:courseId/submit',
  authorize('EMPLOYEE'),
  [body('answers').isArray().withMessage('answers must be an array')],
  validate,
  submitAssessment
);

router.post(
  '/course/:courseId',
  authorize('ADMIN'),
  [
    body('passScore').optional().isInt({ min: 1, max: 100 }),
    body('maxAttempts').optional().isInt({ min: 1 }),
    body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
    body('questions.*.question').notEmpty().withMessage('Question text is required'),
    body('questions.*.options').isArray({ min: 2 }).withMessage('At least 2 options required'),
    body('questions.*.correctAnswer').isInt({ min: 0 }).withMessage('correctAnswer must be a valid index'),
  ],
  validate,
  createAssessment
);

router.put(
  '/course/:courseId',
  authorize('ADMIN'),
  [
    body('passScore').optional().isInt({ min: 1, max: 100 }),
    body('maxAttempts').optional().isInt({ min: 1 }),
    body('questions').optional().isArray({ min: 1 }),
  ],
  validate,
  updateAssessment
);

module.exports = router;
