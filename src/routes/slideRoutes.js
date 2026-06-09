const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/slideController');

router.use(authenticate);

router.get('/lesson/:lessonId', ctrl.getSlidesByLesson);
router.post('/', authorize('ADMIN'), ctrl.createSlide);
router.put('/:id', authorize('ADMIN'), ctrl.updateSlide);
router.delete('/:id', authorize('ADMIN'), ctrl.deleteSlide);

module.exports = router;
