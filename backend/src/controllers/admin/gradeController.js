const catchAsync = require('../../utils/catchAsync');
const prisma = require('../../config/database');

// 1. Pour l'ÉTUDIANT : Liste des cours avec la moyenne par cours
exports.getStudentGradesByCourse = catchAsync(async (req, res) => {
  const studentId = req.user.id;

  // Récupérer tous les cours où l'étudiant a des évaluations
  const courses = await prisma.course.findMany({
    include: {
      quizzes: { where: { attempts: { some: { studentId } } } },
      exams: { where: { attempts: { some: { studentId } } } },
      assignments: { where: { submissions: { some: { studentId } } } }
    }
  });

  // Pour faire simple, on va calculer la moyenne par cours en récupérant toutes ses notes
  const gradesByCourse = await Promise.all(courses.map(async (course) => {
    let totalScore = 0;
    let count = 0;

    // Notes quiz
    const quizAttempts = await prisma.quizAttempt.findMany({ where: { studentId, status: 'SUBMITTED', quiz: { courseId: course.id } } });
    quizAttempts.forEach(a => { totalScore += (Number(a.score) / 20) * 20; count++; });

    // Notes examens
    const examAttempts = await prisma.examAttempt.findMany({ where: { studentId, status: { in: ['SUBMITTED', 'TIMEOUT'] }, exam: { courseId: course.id } } });
    examAttempts.forEach(a => { totalScore += (Number(a.score) / 20) * 20; count++; });

    // Notes devoirs
    const assignmentSubs = await prisma.assignmentSubmission.findMany({ where: { studentId, status: 'GRADED', assignment: { courseId: course.id } }, include: { assignment: true } });
    assignmentSubs.forEach(s => { totalScore += (Number(s.score) / s.assignment.maxScore) * 20; count++; });

    return {
      courseId: course.id,
      courseTitle: course.title,
      courseCode: course.code,
      average: count > 0 ? (totalScore / count).toFixed(2) : null,
      totalEvaluations: count
    };
  }));

  // On ne garde que les cours où il y a des évaluations
  const filtered = gradesByCourse.filter(c => c.totalEvaluations > 0);

  res.json({ success: true, data: filtered });
});

// 2. Pour l'ÉTUDIANT : Détail des notes d'un cours spécifique
exports.getStudentCourseDetails = catchAsync(async (req, res) => {
  const studentId = req.user.id;
  const { courseId } = req.params;

  const quizzes = await prisma.quizAttempt.findMany({
    where: { studentId, quiz: { courseId: parseInt(courseId) }, status: 'SUBMITTED' },
    include: { quiz: { select: { title: true } } }
  });

  const exams = await prisma.examAttempt.findMany({
    where: { studentId, exam: { courseId: parseInt(courseId) }, status: { in: ['SUBMITTED', 'TIMEOUT'] } },
    include: { exam: { select: { title: true } } }
  });

  const assignments = await prisma.assignmentSubmission.findMany({
    where: { studentId, assignment: { courseId: parseInt(courseId) }, status: 'GRADED' },
    include: { assignment: { select: { title: true, maxScore: true } } }
  });

  const grades = [
    ...quizzes.map(q => ({ id: `q-${q.id}`, type: 'Quiz', title: q.quiz.title, score: q.score, max: 20, date: q.submittedAt })),
    ...exams.map(e => ({ id: `e-${e.id}`, type: 'Examen', title: e.exam.title, score: e.score, max: 20, date: e.submittedAt })),
    ...assignments.map(a => ({ id: `a-${a.id}`, type: 'Devoir', title: a.assignment.title, score: a.score, max: a.assignment.maxScore, date: a.gradedAt }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, data: grades });
});

// 3. Pour l'ENSEIGNANT : Liste des cours
exports.getTeacherCourses = catchAsync(async (req, res) => {
  const teacherId = req.user.id;
  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { createdById: teacherId },
        { teachers: { some: { teacherId } } }
      ]
    },
    orderBy: { title: 'asc' }
  });
  res.json({ success: true, data: courses });
});

// 4. Pour l'ENSEIGNANT : Liste des étudiants et leurs notes pour un cours
exports.getCourseStudentsGrades = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  // On récupère les étudiants inscrits à ce cours via les sessions
  const course = await prisma.course.findUnique({
    where: { id: parseInt(courseId) },
    include: {
      sessions: {
        include: {
          enrollments: {
            include: { student: { select: { id: true, firstName: true, lastName: true, matricule: true } } }
          }
        }
      }
    }
  });

  if (!course) return res.status(404).json({ success: false, message: 'Cours introuvable' });

  // On aplatit la liste des étudiants
  const students = [];
  course.sessions.forEach(session => {
    session.enrollments.forEach(enr => {
      if (!students.find(s => s.id === enr.student.id)) {
        students.push(enr.student);
      }
    });
  });

  // Pour chaque étudiant, on cherche ses notes (quiz, exam, devoirs) pour ce cours
  const studentsWithGrades = await Promise.all(students.map(async (student) => {
    let total = 0;
    let count = 0;

    const exams = await prisma.examAttempt.findMany({ where: { studentId: student.id, exam: { courseId: parseInt(courseId) }, status: { in: ['SUBMITTED', 'TIMEOUT'] } } });
    exams.forEach(e => { total += Number(e.score); count++; });

    const quizzes = await prisma.quizAttempt.findMany({ where: { studentId: student.id, quiz: { courseId: parseInt(courseId) }, status: 'SUBMITTED' } });
    quizzes.forEach(q => { total += Number(q.score); count++; });

    return {
      ...student,
      average: count > 0 ? (total / count).toFixed(2) : null,
      hasPassedExam: exams.length > 0
    };
  }));

  res.json({ success: true, data: studentsWithGrades });
});