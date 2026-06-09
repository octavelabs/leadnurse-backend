const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/timesheetSignoffController');

// Public (no auth)
router.get('/form/:token', ctrl.getPublicSignoffForm);
router.post('/form/:token/submit', ctrl.submitSignoff);

// Admin only
router.post('/request', authenticate, authorize('ADMIN'), ctrl.requestSignoff);
router.get('/:attendanceId', authenticate, authorize('ADMIN'), ctrl.getSignoff);

module.exports = router;
