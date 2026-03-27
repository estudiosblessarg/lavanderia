const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { allowRoles } = require('../middlewares/roleMiddleware');
const { getMetrics } = require('../controllers/metricController');
const router = express.Router();

router.use(authMiddleware);
router.get('/', allowRoles('admin'), getMetrics);

module.exports = router;
