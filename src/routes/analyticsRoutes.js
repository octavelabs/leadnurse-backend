const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/analyticsController');

router.use(authenticate, authorize('ADMIN'));

router.get('/workforce', ctrl.getWorkforceDashboard);
router.get('/attendance', ctrl.getAttendanceStats);

module.exports = router;
