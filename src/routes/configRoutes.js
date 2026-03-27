const express = require('express');
const { getClientConfig } = require('../controllers/configController');
const router = express.Router();

router.get('/', getClientConfig);

module.exports = router;
