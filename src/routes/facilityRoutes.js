const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/facilityController');

router.use(authenticate);

router.get('/', ctrl.getFacilities);
router.get('/:id', ctrl.getFacility);
router.post('/', authorize('ADMIN'), ctrl.createFacility);
router.put('/:id', authorize('ADMIN'), ctrl.updateFacility);
router.delete('/:id', authorize('ADMIN'), ctrl.deleteFacility);

module.exports = router;
