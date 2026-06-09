const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, uploadAvatar } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase and a number'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, avatarUpload.single('avatar'), uploadAvatar);

module.exports = router;
