const prisma = require('../../config/database');
const AppError = require('../../errors/AppError');

// Lister les événements (avec filtres)
exports.getEvents = async (userId, filters = {}) => {
  const where = {};

  // Filtres par date
  if (filters.startDate || filters.endDate) {
    where.AND = [];
    if (filters.startDate) {
      where.AND.push({ endDate: { gte: new Date(filters.startDate) } });
    }
    if (filters.endDate) {
      where.AND.push({ startDate: { lte: new Date(filters.endDate) } });
    }
  }

  if (filters.type) where.type = filters.type;
  if (filters.unitId) where.unitId = parseInt(filters.unitId);

  // Visibilité : PUBLIC + les siens + ceux de son unité
  where.OR = [
    { visibility: 'PUBLIC' },
    { createdById: userId },
    { visibility: 'UNIT', unitId: filters.userUnitId },
  ];

  return prisma.calendarEvent.findMany({
    where,
    orderBy: { startDate: 'asc' },
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

// Récupérer un événement
exports.getEventById = async (id) => {
  const event = await prisma.calendarEvent.findUnique({
    where: { id },
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!event) {
    throw new AppError('Événement introuvable', 404, 'EVENT_NOT_FOUND');
  }

  return event;
};

// Créer un événement
exports.createEvent = async (data, userId) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError('Dates invalides', 400, 'INVALID_DATES');
  }

  if (end < start) {
    throw new AppError(
      'La date de fin doit être postérieure à la date de début',
      400,
      'INVALID_DATE_RANGE'
    );
  }

  return prisma.calendarEvent.create({
    data: {
      title: data.title,
      description: data.description || null,
      type: data.type || 'OTHER',
      visibility: data.visibility || 'PUBLIC',
      startDate: start,
      endDate: end,
      allDay: data.allDay || false,
      location: data.location || null,
      color: data.color || '#3B82F6',
      unitId: data.unitId || null,
      createdById: userId,
    },
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

// Mettre à jour un événement
exports.updateEvent = async (id, data, userId, isAdmin) => {
  const event = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!event) {
    throw new AppError('Événement introuvable', 404, 'EVENT_NOT_FOUND');
  }

  if (event.createdById !== userId && !isAdmin) {
    throw new AppError(
      'Vous ne pouvez modifier que vos propres événements',
      403,
      'FORBIDDEN'
    );
  }

  const updateData = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);

  return prisma.calendarEvent.update({
    where: { id },
    data: updateData,
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
};

// Supprimer un événement
exports.deleteEvent = async (id, userId, isAdmin) => {
  const event = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!event) {
    throw new AppError('Événement introuvable', 404, 'EVENT_NOT_FOUND');
  }

  if (event.createdById !== userId && !isAdmin) {
    throw new AppError(
      'Vous ne pouvez supprimer que vos propres événements',
      403,
      'FORBIDDEN'
    );
  }

  await prisma.calendarEvent.delete({ where: { id } });
  return { message: 'Événement supprimé avec succès' };
};

// Événements à venir (pour le dashboard)
exports.getUpcomingEvents = async (userId, limit = 5) => {
  return prisma.calendarEvent.findMany({
    where: {
      endDate: { gte: new Date() },
      OR: [{ visibility: 'PUBLIC' }, { createdById: userId }],
    },
    orderBy: { startDate: 'asc' },
    take: limit,
    include: {
      unit: { select: { id: true, name: true, type: true, code: true } },
    },
  });
};