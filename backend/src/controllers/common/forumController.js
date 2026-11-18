const catchAsync = require('../../utils/catchAsync');
const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// Créer un sujet (Enseignant)
exports.createTopic = catchAsync(async (req, res) => {
  const { courseId, title, content, meetingLink, meetingDate } = req.body;
  
  const topic = await prisma.forumTopic.create({
    data: {
      courseId: parseInt(courseId),
      authorId: req.user.id,
      title,
      content,
      meetingLink: meetingLink || null,
      meetingDate: meetingDate ? new Date(meetingDate) : null
    }
  });
  res.status(201).json({ success: true, data: topic });
});

// Lister les sujets d'un cours
exports.getTopics = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const topics = await prisma.forumTopic.findMany({
    where: { courseId: parseInt(courseId) },
    include: {
      author: { select: { firstName: true, lastName: true, role: true } },
      _count: { select: { replies: true } }
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
  });
  res.json({ success: true, data: topics });
});

// Voir un sujet et ses réponses
exports.getTopicDetails = catchAsync(async (req, res) => {
  const { topicId } = req.params;
  const topic = await prisma.forumTopic.findUnique({
    where: { id: parseInt(topicId) },
    include: {
      author: { select: { firstName: true, lastName: true, role: true } },
      replies: {
        include: { author: { select: { firstName: true, lastName: true, role: true } } },
        orderBy: { createdAt: 'asc' }
      }
    }
  });
  if (!topic) throw new AppError('Sujet introuvable', 404, 'NOT_FOUND');
  res.json({ success: true, data: topic });
});

// Répondre à un sujet
exports.createReply = catchAsync(async (req, res) => {
  const { topicId } = req.params;
  const { content } = req.body;
  
  const reply = await prisma.forumReply.create({
    data: {
      topicId: parseInt(topicId),
      authorId: req.user.id,
      content
    },
    include: { author: { select: { firstName: true, lastName: true } } }
  });
  res.status(201).json({ success: true, data: reply });
});