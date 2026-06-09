const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/shiftController');

router.use(authenticate);

router.get('/my', ctrl.getMyShifts);
router.get('/available', ctrl.getAvailableShifts);
router.get('/timesheet', authorize('ADMIN'), ctrl.getTimesheetByFacility);
router.get('/', ctrl.getShifts);
router.get('/:id', ctrl.getShift);
router.post('/', authorize('ADMIN'), ctrl.createShift);
router.put('/:id', authorize('ADMIN'), ctrl.updateShift);
router.delete('/:id', authorize('ADMIN'), ctrl.deleteShift);
router.post('/:id/apply', ctrl.applyForShift);
router.patch('/assign/:id/review', authorize('ADMIN'), ctrl.confirmApplication);
router.post('/assign', authorize('ADMIN'), ctrl.assignWorker);
router.delete('/assign/:id', authorize('ADMIN'), ctrl.unassignWorker);

module.exports = router;
