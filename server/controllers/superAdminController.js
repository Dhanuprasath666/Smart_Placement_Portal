const User = require('../models/User');
const Placement = require('../models/Placement');

// Get all users (students and admins)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    // Get placement count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const placementCount = await Placement.countDocuments({ userId: user._id });
        return {
          ...user.toObject(),
          placementCount
        };
      })
    );

    res.json({ users: usersWithStats });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalSuperAdmins = await User.countDocuments({ role: 'superadmin' });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const activeUsers = await User.countDocuments({ isBlocked: false });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalUsers,
      totalStudents,
      totalAdmins,
      totalSuperAdmins,
      blockedUsers,
      activeUsers,
      recentRegistrations
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};

// Make user admin (only superadmin can do this)
exports.makeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot modify superadmin role' });
    }

    user.role = 'admin';
    user.verified = true;
    await user.save();

    res.json({ message: 'User promoted to admin successfully', user });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ message: 'Error promoting user to admin' });
  }
};

// Remove admin (demote to student)
exports.removeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot modify superadmin role' });
    }

    user.role = 'student';
    await user.save();

    res.json({ message: 'Admin demoted to student successfully', user });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ message: 'Error demoting admin' });
  }
};

// Block user
exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot block superadmin' });
    }

    user.isBlocked = true;
    await user.save();

    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Error blocking user' });
  }
};

// Unblock user
exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = false;
    await user.save();

    res.json({ message: 'User unblocked successfully', user });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Error unblocking user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot delete superadmin' });
    }

    // Delete user's placements
    await Placement.deleteMany({ userId: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and their placements deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Get user details with placements
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const placements = await Placement.find({ userId: userId });

    res.json({ user, placements });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
};