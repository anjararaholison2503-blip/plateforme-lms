const prisma = require('../../config/database');

exports.getStats = async () => {
  const [students, teachers, units, courses, events] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'TEACHER', status: 'ACTIVE' } }),
    prisma.institutionUnit.count({ where: { isActive: true } }),
    0, // prisma.course.count() → à activer quand le modèle Course sera créé
    prisma.calendarEvent.count({ where: { endDate: { gte: new Date() } } }),
  ]);

  return {
    students,
    teachers,
    units,
    courses,
    upcomingEvents: events,
    revenue: 0,
  };
};