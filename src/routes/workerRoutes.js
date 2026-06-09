const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/workerController');

router.use(authenticate);

router.get('/me', ctrl.getMyProfile);
router.put('/me/availability', ctrl.updateAvailability);
router.get('/', authorize('ADMIN'), ctrl.getWorkers);
router.get('/:id', authorize('ADMIN'), ctrl.getWorker);

module.exports = router;
