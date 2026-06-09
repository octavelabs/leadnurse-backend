const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/payrollController');

router.use(authenticate);

router.get('/my', ctrl.getMyEarnings);
router.get('/', authorize('ADMIN'), ctrl.getReports);
router.get('/:id', authorize('ADMIN'), ctrl.getReport);
router.post('/', authorize('ADMIN'), ctrl.createReport);
router.patch('/:id/status', authorize('ADMIN'), ctrl.updateReportStatus);

module.exports = router;
