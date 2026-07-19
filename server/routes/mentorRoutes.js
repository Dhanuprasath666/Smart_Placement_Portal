const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { verifyToken } = require('../middleware/auth');

// GET /api/mentors - Get all verified mentors (public, with filters)
router.get('/', mentorController.getAllMentors);

// GET /api/mentors/requests/received - Mentor sees all requests sent to them
router.get('/requests/received', verifyToken, mentorController.getReceivedRequests);

// GET /api/mentors/requests/sent - Student sees all requests they sent
router.get('/requests/sent', verifyToken, mentorController.getSentRequests);

// GET /api/mentors/requests/:id/messages - Get chat messages for an accepted request
router.get('/requests/:id/messages', verifyToken, mentorController.getMessages);

// POST /api/mentors/requests/:id/messages - Send a chat message
router.post('/requests/:id/messages', verifyToken, mentorController.sendMessage);

// GET /api/mentors/requests/:id - Get a single mentor request (used for chat header info)
// NOTE: kept after the literal /requests/received and /requests/sent routes above
router.get('/requests/:id', verifyToken, mentorController.getMentorRequestById);

// PUT /api/mentors/requests/:id - Mentor accepts or declines a request
router.put('/requests/:id', verifyToken, mentorController.updateRequestStatus);

// PUT /api/mentors/profile - Mentor updates their own mentorProfile fields
router.put('/profile', verifyToken, mentorController.updateMentorProfile);

// POST /api/mentors/request - Student sends a connection request
router.post('/request', verifyToken, mentorController.sendMentorRequest);

// GET /api/mentors/:id - Get one mentor's full profile (public)
// NOTE: kept last so it doesn't shadow the literal routes above
router.get('/:id', mentorController.getMentorById);

module.exports = router;
