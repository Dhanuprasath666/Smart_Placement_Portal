const Placement = require('../models/Placement');
const cloudinary = require('../config/cloudinary');

// Submit new placement
exports.submitPlacement = async (req, res) => {
  try {
    const { studentName, company, package, batch, interviewExperience, isAnonymous } = req.body;
    const userId = req.user.userId;

    // Check if files are uploaded
    if (!req.files || !req.files.offerLetter || !req.files.idCard) {
      return res.status(400).json({ message: 'Both offer letter and ID card are required' });
    }

    // Upload offer letter to Cloudinary
    const offerLetterUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'placement-portal/offer-letters', resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.files.offerLetter[0].buffer);
    });

    // Upload ID card to Cloudinary
    const idCardUpload = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'placement-portal/id-cards', resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.files.idCard[0].buffer);
    });

    // Create placement record
    const placement = new Placement({
      userId,
      studentName,
      company,
      package: parseFloat(package),
      batch,
      offerLetterUrl: offerLetterUpload.secure_url,
      idCardUrl: idCardUpload.secure_url,
      interviewExperience: interviewExperience || '',
      isAnonymous: isAnonymous === 'true',
      status: 'pending'
    });

    await placement.save();

    res.status(201).json({
      message: 'Placement submitted successfully! Waiting for admin approval.',
      placementId: placement._id
    });

  } catch (error) {
    console.error('Placement submission error:', error);
    res.status(500).json({ message: 'Error submitting placement data' });
  }
};

// Get all approved placements
exports.getAllPlacements = async (req, res) => {
  try {
    const placements = await Placement.find({ status: 'approved' })
      .populate('userId', 'name email batch')
      .sort({ createdAt: -1 });

    res.json({ placements });

  } catch (error) {
    console.error('Error fetching placements:', error);
    res.status(500).json({ message: 'Error fetching placements' });
  }
};

// Get user's own placements
exports.getMyPlacements = async (req, res) => {
  try {
    const userId = req.user.userId;
    const placements = await Placement.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ placements });

  } catch (error) {
    console.error('Error fetching user placements:', error);
    res.status(500).json({ message: 'Error fetching your placements' });
  }
};