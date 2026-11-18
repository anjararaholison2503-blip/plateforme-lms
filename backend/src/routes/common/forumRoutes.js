const express = require('express');
const router = express.Router();
const forumController = require('../../controllers/common/forumController');
const { requireAuth } = require('../../middlewares/authMiddleware');

router.post('/topics', requireAuth, forumController.createTopic);
router.get('/topics/course/:courseId', requireAuth, forumController.getTopics);
router.get('/topics/:topicId', requireAuth, forumController.getTopicDetails);
router.post('/topics/:topicId/replies', requireAuth, forumController.createReply);

module.exports = router;