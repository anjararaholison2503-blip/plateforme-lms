exports.listExamsByCourse = async (req, res) => {
  const exams = await prisma.exam.findMany({
    where: { courseId: parseInt(req.params.courseId) },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: exams });
};

exports.publishExam = async (req, res) => {
  const exam = await prisma.exam.update({
    where: { id: parseInt(req.params.id) },
    data: { status: 'PUBLISHED' }
  });
  res.json({ success: true, data: exam });
};