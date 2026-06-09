const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { documentUpload } = require('../middleware/upload');
const ctrl = require('../controllers/documentController');

router.use(authenticate);

// Employee routes
router.get('/my', ctrl.getMyDocuments);
router.post('/sign/:sigId', ctrl.signDocument);
router.post('/decline/:sigId', ctrl.declineDocument);

// Admin routes
router.get('/', authorize('ADMIN'), ctrl.getAllDocuments);
router.post('/', authorize('ADMIN'), documentUpload.single('document'), ctrl.uploadDocument);
router.post('/:id/assign', authorize('ADMIN'), ctrl.assignDocument);
router.delete('/:id', authorize('ADMIN'), ctrl.deleteDocument);

module.exports = router;
