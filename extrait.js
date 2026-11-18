const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Définition de la route POST pour créer un cours
router.post(
  '/', 
  requireAuth,                 // Vérifie le jeton JWT
  requireRole('TEACHER', 'ADMIN'), // Vérifie les droits d'accès
  courseController.createCourse // Appel du contrôleur
);

module.exports = router;



const courseService = require('../services/courseService');
const catchAsync = require('../utils/catchAsync');

exports.createCourse = catchAsync(async (req, res, next) => {
  // Récupération des données JSON envoyées par le client (React)
  const courseData = req.body; 
  const userId = req.user.id;

  // Appel du service (la logique métier)
  const newCourse = await courseService.createCourse(courseData, userId);

  // Renvoi de la réponse au format JSON à l'interface React
  res.status(201).json({
    status: 'success',
    message: 'Cours créé avec succès',
    data: newCourse,
  });
});