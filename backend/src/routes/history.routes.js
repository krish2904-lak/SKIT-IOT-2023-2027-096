const express = require('express');
const authenticate = require('../middleware/authenticate');
const { getHistory } = require('../controllers/recommendation.controller');

const router = express.Router();

router.use(authenticate);
router.get('/', getHistory);

module.exports = router;
