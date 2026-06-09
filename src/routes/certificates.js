const express = require('express');
const { getMyCertificates, getCertificateById, getCertificateByCourse } = require('../controllers/certificateController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/my', getMyCertificates);
router.get('/course/:courseId', getCertificateByCourse);
router.get('/:id', getCertificateById);

module.exports = router;
