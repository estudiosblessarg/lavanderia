const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { registerUser, getUserProfile } = require('../controllers/userController');
const router = express.Router();

router.post('/register', authMiddleware, registerUser);
router.get('/me', authMiddleware, getUserProfile);

module.exports = router;
