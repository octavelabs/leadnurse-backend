const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/healthcareRoleController');

router.use(authenticate);

router.get('/', ctrl.getRoles);
router.post('/', authorize('ADMIN'), ctrl.createRole);
router.put('/:id', authorize('ADMIN'), ctrl.updateRole);
router.delete('/:id', authorize('ADMIN'), ctrl.deleteRole);

router.get('/workers/:userId/roles', ctrl.getWorkerRoles);
router.post('/workers/assign', authorize('ADMIN'), ctrl.assignWorkerRole);
router.delete('/workers/role/:id', authorize('ADMIN'), ctrl.removeWorkerRole);

module.exports = router;
