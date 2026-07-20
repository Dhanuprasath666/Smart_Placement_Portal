const Placement = require('../models/Placement');
const User = require('../models/User');

// Get all pending placements (admin only)
exports.getPendingPlacements = async (req, res) => {
  try {
    const placements = await Placement.find({ status: 'pending' })
      .populate('userId', 'name email rollNumber batch')
      .sort({ createdAt: -1 });

    res.json({ placements });

  } catch (error) {
    console.error('Error fetching pending placements:', error);
    res.status(500).json({ message: 'Error fetching pending placements' });
  }
};

// Approve placement (admin only)
exports.approvePlacement = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;

    const placement = await Placement.findById(id);

    if (!placement) {
      return res.status(404).json({ message: 'Placement not found' });
    }

    placement.status = 'approved';
    placement.verifiedBy = adminId;
    await placement.save();


    // Verified Alumni Referral & Mentorship Network:
    // automatically make the approved student a verified mentor
    await User.findByIdAndUpdate(placement.userId, {
      isMentor: true,
      'mentorProfile.company': placement.company,
      'mentorProfile.jobRole': placement.jobRole || '',
      'mentorProfile.graduationYear': new Date().getFullYear().toString(),
    });


    res.json({ 
      message: 'Placement approved successfully',
      placement 
    });

  } catch (error) {
    console.error('Error approving placement:', error);
    res.status(500).json({ message: 'Error approving placement' });
  }
};

// Reject placement (admin only)
exports.rejectPlacement = async (req, res) => {
  try {
    const { id } = req.params;

    const placement = await Placement.findById(id);

    if (!placement) {
      return res.status(404).json({ message: 'Placement not found' });
    }

    placement.status = 'rejected';
    await placement.save();

    res.json({ 
      message: 'Placement rejected',
      placement 
    });

  } catch (error) {
    console.error('Error rejecting placement:', error);
    res.status(500).json({ message: 'Error rejecting placement' });
  }
};

// Get all placements with any status (admin only)
exports.getAllPlacementsAdmin = async (req, res) => {
  try {
    const placements = await Placement.find()
      .populate('userId', 'name email rollNumber batch')
      .sort({ createdAt: -1 });

    res.json({ placements });

  } catch (error) {
    console.error('Error fetching all placements:', error);
    res.status(500).json({ message: 'Error fetching placements' });
  }
};