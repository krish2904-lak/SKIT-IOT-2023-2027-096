const express = require('express');
const multer = require('multer');
const authenticate = require('../middleware/authenticate');
const profileController = require('../controllers/profile.controller');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    const supportedTypes = new Set([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);
    if (!supportedTypes.has(file.mimetype)) {
      const error = new Error('Only PDF and DOCX uploads are supported');
      error.statusCode = 415;
      error.code = 'UNSUPPORTED_MEDIA_TYPE';
      callback(error);
      return;
    }
    callback(null, true);
  },
});

router.use(authenticate);
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/erp', profileController.requestErpRefresh);
router.post('/resume', upload.single('file'), profileController.uploadResume);

module.exports = router;
