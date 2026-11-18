const express = require('express');
const router = express.Router();
const hierarchyController = require('../../controllers/admin/hierarchyController');
const { requireAuth, requireRole } = require('../../middlewares/authMiddleware');

// Routes publiques (pour l'assistant de configuration)
router.get('/presets', hierarchyController.getPresets);
router.get('/current', hierarchyController.getCurrent);
router.get('/can-change', hierarchyController.canChange);
router.post('/setup', hierarchyController.setup);

// Routes admin
router.put('/labels', requireAuth, requireRole('ADMIN'), hierarchyController.updateLabels);
router.put('/model', requireAuth, requireRole('ADMIN'), hierarchyController.changeModel);

module.exports = router;