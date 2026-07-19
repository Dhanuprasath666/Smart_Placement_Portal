const User = require('../models/User');
const MentorRequest = require('../models/MentorRequest');
const Message = require('../models/Message');
const { getIO } = require('../socket');

// Get all verified mentors (public, with optional filters)
exports.getAllMentors = async (req, res) => {
  try {
    const { company, branch, jobRole, skills } = req.query;

    const query = { isMentor: true };

    if (company) {
      query['mentorProfile.company'] = { $regex: company, $options: 'i' };
    }

    if (branch) {
      query.branch = { $regex: branch, $options: 'i' };
    }

    if (jobRole) {
      query['mentorProfile.jobRole'] = { $regex: jobRole, $options: 'i' };
    }

    if (skills) {
      query.skills = { $regex: skills, $options: 'i' };
    }

    const mentors = await User.find(query)
      .select('name branch cgpa skills bio linkedin github profilePhoto mentorProfile createdAt')
      .sort({ createdAt: -1 });

    res.json({ mentors });

  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get one mentor's full profile (public)
exports.getMentorById = async (req, res) => {
  try {
    const { id } = req.params;

    const mentor = await User.findOne({ _id: id, isMentor: true })
      .select('name branch cgpa skills bio linkedin github profilePhoto mentorProfile createdAt');

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    res.json({ mentor });

  } catch (error) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mentor updates their own mentorProfile fields
exports.updateMentorProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isMentor) {
      return res.status(403).json({ message: 'Access denied. Verified alumni only.' });
    }

    const { jobRole, graduationYear, willingToMentor, willingToRefer, shortBio } = req.body;

    if (typeof jobRole === 'string') {
      user.mentorProfile.jobRole = jobRole.trim();
    }

    if (typeof graduationYear === 'string') {
      user.mentorProfile.graduationYear = graduationYear.trim();
    }

    if (typeof willingToMentor === 'boolean') {
      user.mentorProfile.willingToMentor = willingToMentor;
    }

    if (typeof willingToRefer === 'boolean') {
      user.mentorProfile.willingToRefer = willingToRefer;
    }

    if (typeof shortBio === 'string') {
      user.mentorProfile.shortBio = shortBio.trim();
    }

    await user.save();

    res.json({
      message: 'Mentor profile updated successfully',
      mentorProfile: user.mentorProfile
    });

  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student sends a connection request to a mentor
exports.sendMentorRequest = async (req, res) => {
  try {
    const fromStudent = req.user.userId;
    const { toMentor, requestType, message } = req.body;

    if (!toMentor || !requestType) {
      return res.status(400).json({ message: 'toMentor and requestType are required' });
    }

    if (toMentor === fromStudent) {
      return res.status(400).json({ message: 'You cannot send a request to yourself' });
    }

    const mentor = await User.findOne({ _id: toMentor, isMentor: true });

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    const existingRequest = await MentorRequest.findOne({
      fromStudent,
      toMentor,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request with this mentor' });
    }

    const mentorRequest = new MentorRequest({
      fromStudent,
      toMentor,
      requestType,
      message: message || ''
    });

    await mentorRequest.save();

    res.status(201).json({
      message: 'Request sent successfully',
      mentorRequest
    });

  } catch (error) {
    console.error('Error sending mentor request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mentor sees all requests sent to them
exports.getReceivedRequests = async (req, res) => {
  try {
    const toMentor = req.user.userId;

    const requests = await MentorRequest.find({ toMentor })
      .populate('fromStudent', 'name email branch cgpa skills profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ requests });

  } catch (error) {
    console.error('Error fetching received requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student sees all requests they sent
exports.getSentRequests = async (req, res) => {
  try {
    const fromStudent = req.user.userId;

    const requests = await MentorRequest.find({ fromStudent })
      .populate('toMentor', 'name email branch profilePhoto mentorProfile')
      .sort({ createdAt: -1 });

    res.json({ requests });

  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mentor accepts or declines a request (only the toMentor user may update)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or declined' });
    }

    const mentorRequest = await MentorRequest.findById(id);

    if (!mentorRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (mentorRequest.toMentor.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You are not the recipient of this request.' });
    }

    if (mentorRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been responded to and cannot be changed' });
    }

    mentorRequest.status = status;
    await mentorRequest.save();

    res.json({
      message: `Request ${status} successfully`,
      mentorRequest
    });

  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single mentor request (only the two participants may view it)
// Used to render the chat header once a request is accepted
exports.getMentorRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const mentorRequest = await MentorRequest.findById(id)
      .populate('fromStudent', 'name branch profilePhoto')
      .populate('toMentor', 'name profilePhoto mentorProfile');

    if (!mentorRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const isParticipant =
      mentorRequest.fromStudent._id.toString() === userId ||
      mentorRequest.toMentor._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ mentorRequest });

  } catch (error) {
    console.error('Error fetching mentor request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all chat messages for an accepted mentor request (only participants)
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const mentorRequest = await MentorRequest.findById(id);

    if (!mentorRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const isParticipant =
      mentorRequest.fromStudent.toString() === userId ||
      mentorRequest.toMentor.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (mentorRequest.status !== 'accepted') {
      return res.status(403).json({ message: 'Chat unlocks once the request is accepted' });
    }

    const messages = await Message.find({ mentorRequest: id })
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: 1 });

    res.json({ messages });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a chat message (only participants of an accepted request)
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const mentorRequest = await MentorRequest.findById(id);

    if (!mentorRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const isParticipant =
      mentorRequest.fromStudent.toString() === userId ||
      mentorRequest.toMentor.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (mentorRequest.status !== 'accepted') {
      return res.status(403).json({ message: 'Chat unlocks once the request is accepted' });
    }

    const newMessage = new Message({
      mentorRequest: id,
      sender: userId,
      text: text.trim()
    });

    await newMessage.save();
    await newMessage.populate('sender', 'name profilePhoto');

    // Real-time delivery to everyone currently in this conversation's room
    const io = getIO();
    if (io) {
      io.to(id).emit('newMessage', newMessage);
    }

    res.status(201).json({
      message: 'Message sent',
      chatMessage: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
