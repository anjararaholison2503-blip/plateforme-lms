const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settingsController');
const upload = require('../../middlewares/uploadMiddleware');

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/logo', upload.single('logo'), settingsController.uploadLogo);

module.exports = router;