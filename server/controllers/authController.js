const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');

const mapUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  rollNumber: user.rollNumber,
  batch: user.batch,
  cgpa: user.cgpa,
  branch: user.branch,
  profilePhoto: user.profilePhoto || null,
  linkedin: user.linkedin || '',
  github: user.github || '',
  portfolio: user.portfolio || '',
  skills: user.skills || '',
  bio: user.bio || '',
  notifications: user.notifications || [],
<<<<<<< HEAD
  isMentor: user.isMentor || false,
  mentorProfile: user.mentorProfile || null,
=======
>>>>>>> aea32e7ed93e3d02d9c09e812436b328a5716a43
  role: user.role,
  isBlocked: user.isBlocked
});

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, rollNumber, batch, cgpa, branch } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { rollNumber }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or roll number already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      rollNumber,
      batch,
      cgpa,
      branch
    });

    await user.save();

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: user._id 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked by admin. Contact support.' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: mapUserResponse(user)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
// Register new admin with secret code
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, rollNumber, batch, cgpa, branch, adminSecret } = req.body;

    // Check admin secret code
    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'your-super-secret-admin-code-2025';
    
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(403).json({ 
        message: 'Invalid admin secret code' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { rollNumber }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or roll number already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      rollNumber,
      batch,
      cgpa,
      branch,
      role: 'admin',  // Set role as admin
      verified: true  // Auto-verify admins
    });

    await user.save();

    res.status(201).json({ 
      message: 'Admin registered successfully',
      userId: user._id 
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};
// Register Super Admin with super secret code
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password, rollNumber, batch, cgpa, branch, superSecretCode } = req.body;

    // Check super secret code
    if (superSecretCode !== process.env.SUPERADMIN_SECRET) {
      return res.status(403).json({ message: 'Invalid super admin secret code' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { rollNumber }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or roll number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      rollNumber,
      batch,
      cgpa,
      branch,
      role: 'superadmin',
      verified: true
    });

    await user.save();

    res.status(201).json({ 
      message: 'Super Admin registered successfully',
      user: mapUserResponse(user)
    });

  } catch (error) {
    console.error('Super admin registration error:', error);
    res.status(500).json({ message: 'Error registering super admin' });
  }
};

// Get current logged in user details
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: mapUserResponse(user)
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

// Update current logged in user profile
exports.updateCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      linkedin,
      github,
      portfolio,
      skills,
      bio,
    } = req.body;

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (typeof linkedin === 'string') {
      user.linkedin = linkedin.trim();
    }

    if (typeof github === 'string') {
      user.github = github.trim();
    }

    if (typeof portfolio === 'string') {
      user.portfolio = portfolio.trim();
    }

    if (typeof skills === 'string') {
      user.skills = skills.trim();
    }

    if (typeof bio === 'string') {
      user.bio = bio.trim();
    }

    if (req.file) {
      if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: 'Profile photo must be an image' });
      }

      const uploadedPhoto = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'placement-portal/profile-photos', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      user.profilePhoto = uploadedPhoto.secure_url;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: mapUserResponse(user),
    });
  } catch (error) {
    console.error('Update current user error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};
