const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/referenceController');

// ─── Public (no auth) ─────────────────────────────────────────────────────────
router.get('/form/:token', ctrl.getPublicReferenceForm);
router.post('/form/:token/submit', ctrl.submitReferenceForm);

// ─── Admin only ───────────────────────────────────────────────────────────────
router.get('/summary', authenticate, authorize('ADMIN'), ctrl.getReferenceSummary);
router.get('/', authenticate, authorize('ADMIN'), ctrl.getAllReferences);
router.post('/', authenticate, authorize('ADMIN'), ctrl.addReference);
router.get('/worker/:workerId', authenticate, authorize('ADMIN'), ctrl.getWorkerReferences);
router.post('/:id/send', authenticate, authorize('ADMIN'), ctrl.sendReferenceRequest);
router.get('/:id', authenticate, authorize('ADMIN'), ctrl.getReferenceResponse);
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.deleteReference);

module.exports = router;
