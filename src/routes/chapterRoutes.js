const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const ctrl = require('../controllers/chapterController');

router.use(authenticate);

// Employee routes
router.get('/:chapterId/quiz', ctrl.getChapterQuizForStudent);
router.post('/:chapterId/quiz/submit', ctrl.submitChapterQuiz);

// Shared: employees (enrolled) + admins
router.get('/course/:courseId', ctrl.getChaptersByCourse);
router.post('/', authorize('ADMIN'), ctrl.createChapter);
router.put('/:id', authorize('ADMIN'), ctrl.updateChapter);
router.delete('/:id', authorize('ADMIN'), ctrl.deleteChapter);
router.put('/:chapterId/quiz', authorize('ADMIN'), ctrl.upsertChapterQuiz);

module.exports = router;
