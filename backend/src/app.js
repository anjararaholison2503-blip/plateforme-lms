const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');


const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const settingsRoutes = require('./routes/admin/settingsRoutes');
const authRoutes = require('./routes/common/authRoutes');
const institutionRoutes = require('./routes/admin/institutionRoutes');
const dashboardRoutes = require('./routes/common/dashboardRoutes');      // ← VÉRIFIER
const calendarRoutes = require('./routes/common/calendarRoutes');        // ← VÉRIFIER
const userRoutes = require('./routes/admin/userRoutes');
const courseRoutes = require('./routes/common/courseRoutes');
const hierarchyRoutes = require('./routes/admin/hierarchyRoutes');
const teachingUnitRoutes = require('./routes/admin/teachingUnitRoutes');
const materialRoutes = require('./routes/common/materialRoutes');
const notificationRoutes = require('./routes/common/notificationRoutes');
const courseModuleRoutes = require('./routes/common/courseModuleRoutes');
const announcementRoutes = require('./routes/common/announcementRoutes');
const enrollmentRoutes = require('./routes/admin/enrollmentRoutes');
const financeRoutes = require('./routes/admin/financeRoutes');
const academicYearRoutes = require('./routes/admin/academicYearRoutes');
const assignmentRoutes = require('./routes/common/assignmentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const mobileMoneyRoutes = require('./routes/admin/mobileMoneyRoutes');
const examRoutes = require('./routes/admin/examRoutes');
const gradeRoutes = require('./routes/admin/gradeRoutes');
const app = express();
const forumRoutes = require('./routes/common/forumRoutes');
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);
app.use('/api/forum', forumRoutes);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '600mb' }));
app.use(express.urlencoded({ extended: true, limit: '600mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/grades', gradeRoutes);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'API LMS opérationnelle', timestamp: new Date() });
});

// Routes
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/dashboard', dashboardRoutes);    // ← VÉRIFIER
app.use('/api/calendar', calendarRoutes);      // ← VÉRIFIER
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/hierarchy', hierarchyRoutes);//← AJOUTER
app.use('/api/teaching-units', teachingUnitRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/uploads/materials', express.static(path.join(__dirname, '../uploads/materials')));//route pour servir les fichiers téléchargés
app.use('/api/programs', courseModuleRoutes);
app.use('/api/announcements', announcementRoutes);//route pour gérer les annonces
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api', quizRoutes);
app.use('/api/mobile-money', mobileMoneyRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;