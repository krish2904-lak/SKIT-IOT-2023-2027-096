const express = require('express');
const authenticate = require('../middleware/authenticate');
const controller = require('../controllers/recommendation.controller');

const router = express.Router();

router.use(authenticate);
router.get('/', controller.listRecommendations);
router.post('/', controller.generateRecommendations);
router.get('/:id/explanation', controller.getExplanation);
router.get('/:id/roadmap', controller.getRoadmap);
router.get('/:id', controller.getRecommendation);

module.exports = router;
