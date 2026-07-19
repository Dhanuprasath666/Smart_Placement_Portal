const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// GET /api/admin/placements/pending - Get all pending placements
router.get('/placements/pending', adminController.getPendingPlacements);

// GET /api/admin/placements - Get all placements
router.get('/placements', adminController.getAllPlacementsAdmin);

// PUT /api/admin/placements/:id/approve - Approve a placement
router.put('/placements/:id/approve', adminController.approvePlacement);

// PUT /api/admin/placements/:id/reject - Reject a placement
router.put('/placements/:id/reject', adminController.rejectPlacement);

module.exports = router;