const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

module.exports = (io) => {
  // ═══════════════════════════════════════════════════════════
  // MIDDLEWARE D'AUTHENTIFICATION
  // ═══════════════════════════════════════════════════════════
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Token manquant'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          status: true,
          unitId: true,
        },
      });

      if (!user) {
        return next(new Error('Utilisateur introuvable'));
      }

      if (user.status !== 'ACTIVE') {
        return next(new Error('Compte inactif'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error('❌ Socket auth error:', err.message);
      next(new Error('Authentification échouée'));
    }
  });

  // ═══════════════════════════════════════════════════════════
  // CONNEXION
  // ═══════════════════════════════════════════════════════════
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connecté : ${socket.user.email} (${socket.user.role})`);

    // ═══ ENREGISTRER LES HANDLERS DE QUIZ ═══
    require('./quizHandler')(io, socket);

    // Rejoindre la room personnelle (pour les notifications ciblées)
    socket.join(`user:${socket.user.id}`);

    // Rejoindre la room de rôle (pour les broadcasts)
    socket.join(`role:${socket.user.role}`);

    // Si l'utilisateur a une unité (classe), rejoindre la room
    if (socket.user.unitId) {
      socket.join(`unit:${socket.user.unitId}`);
    }

    // Émettre un événement de connexion
    socket.emit('connected', {
      message: 'Connecté au serveur temps réel',
      userId: socket.user.id,
      timestamp: new Date().toISOString(),
    });

    // ─── Événements personnalisés ───

    // Marquer une notification comme lue
    socket.on('notification:read', async (data) => {
      try {
        await prisma.notification.updateMany({
          where: { id: data.notificationId, userId: socket.user.id },
          data: { readAt: new Date(), status: 'READ' },
        });
        socket.emit('notification:read:success', { notificationId: data.notificationId });
      } catch (err) {
        socket.emit('notification:read:error', { error: err.message });
      }
    });

    // Quitter les rooms à la déconnexion
    socket.on('disconnect', () => {
      console.log(`🔌 Socket déconnecté : ${socket.user.email}`);
    });
  });

  return io;
};