const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { documentUpload } = require('../middleware/upload');
const ctrl = require('../controllers/complianceController');

router.use(authenticate);

router.get('/my', ctrl.getMyCompliance);
router.post('/my/document', documentUpload.single('document'), ctrl.submitMyCompliance);
router.get('/expiring', authorize('ADMIN'), ctrl.getExpiringCompliance);
router.get('/', authorize('ADMIN'), ctrl.getAllCompliance);
router.get('/worker/:userId', authorize('ADMIN'), ctrl.getWorkerCompliance);
router.post('/', authorize('ADMIN'), ctrl.upsertCompliance);
router.post('/:id/document', documentUpload.single('document'), ctrl.uploadComplianceDocument);

module.exports = router;
