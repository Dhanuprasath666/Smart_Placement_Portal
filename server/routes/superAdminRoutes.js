const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { verifyToken, isSuperAdmin } = require('../middleware/auth');

// All routes require super admin authentication
router.use(verifyToken, isSuperAdmin);

// Get all users
router.get('/users', superAdminController.getAllUsers);

// Get user statistics
router.get('/stats', superAdminController.getUserStats);

// Get user details with placements
router.get('/users/:userId', superAdminController.getUserDetails);

// NOTE: Students can NEVER be promoted to Admin. Admins are only registered via secret code (register-admin endpoint)
// The following routes are commented out to enforce this policy:
// router.put('/users/:userId/make-admin', superAdminController.makeAdmin);
// router.put('/users/:userId/remove-admin', superAdminController.removeAdmin);

// Block user
router.put('/users/:userId/block', superAdminController.blockUser);

// Unblock user
router.put('/users/:userId/unblock', superAdminController.unblockUser);

// Delete user
router.delete('/users/:userId', superAdminController.deleteUser);

module.exports = router;