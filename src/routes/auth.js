const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { avatarUpload } = require('../middleware/upload');
const { validate } = require('../middleware/validate');

const router = express.Router();

const newPasswordRules = [
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and a number'),
];

// ─── Public ────────────────────────────────────────────────────────────────────

router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase and a number'),
  ],
  validate, ctrl.register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate, ctrl.login
);

router.get('/verify-email/:token', ctrl.verifyEmail);

router.post('/resend-verification',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  validate, ctrl.resendVerification
);

router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  validate, ctrl.forgotPassword
);

router.post('/reset-password/:token', newPasswordRules, validate, ctrl.resetPassword);

// ─── Authenticated ─────────────────────────────────────────────────────────────

router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.getMe);
router.put('/profile', authenticate, ctrl.updateProfile);
router.post('/avatar', authenticate, avatarUpload.single('avatar'), ctrl.uploadAvatar);

router.put('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    ...newPasswordRules,
  ],
  validate, ctrl.changePassword
);

// ─── Admin only ────────────────────────────────────────────────────────────────

router.patch('/admin/users/:userId/toggle-active', authenticate, authorize('ADMIN'), ctrl.toggleUserActive);

module.exports = router;
