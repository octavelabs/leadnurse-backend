const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/attendanceController');

router.use(authenticate);

router.get('/my', ctrl.getMyAttendance);
router.post('/checkin', ctrl.checkIn);
router.post('/checkout', ctrl.checkOut);
router.get('/', authorize('ADMIN'), ctrl.getAttendance);
router.put('/:id', authorize('ADMIN'), ctrl.updateAttendance);

module.exports = router;
