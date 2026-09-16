const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/uploadedCertificateController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { certificateUpload } = require('../middleware/upload');

router.use(authenticate);

// Worker routes
router.get('/mine', ctrl.getMyCertificates);
router.post('/upload', certificateUpload.single('file'), ctrl.uploadCertificate);
router.delete('/:id', ctrl.deleteCertificate);

// Admin routes
router.get('/worker/:userId', authorize('ADMIN'), ctrl.getWorkerCertificates);

module.exports = router;
