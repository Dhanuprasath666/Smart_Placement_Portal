const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/placements/submit - Submit new placement (requires login)
router.post(
  '/submit',
  verifyToken,
  upload.fields([
    { name: 'offerLetter', maxCount: 1 },
    { name: 'idCard', maxCount: 1 }
  ]),
  placementController.submitPlacement
);

// GET /api/placements - Get all approved placements (public)
router.get('/', placementController.getAllPlacements);

// GET /api/placements/my - Get user's own placements (requires login)
router.get('/my', verifyToken, placementController.getMyPlacements);

module.exports = router;