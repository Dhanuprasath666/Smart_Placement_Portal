const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/register-admin
router.post('/register-admin', authController.registerAdmin);

// POST /api/auth/login
router.post('/login', authController.login);

// Register super admin
router.post('/register-superadmin', authController.registerSuperAdmin);

// Get current user (requires authentication)
router.get('/me', verifyToken, authController.getCurrentUser);

// Update current user profile
router.put('/me', verifyToken, upload.single('profilePhoto'), authController.updateCurrentUser);

module.exports = router;
