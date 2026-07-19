const CompanyVisit = require('../models/CompanyVisit');
const User = require('../models/User');
const CompanyApplication = require('../models/CompanyApplication');

const buildEligibilityNotification = (companyVisit) => ({
  companyVisit: companyVisit._id,
  companyName: companyVisit.companyName,
  message: `You're eligible for ${companyVisit.companyName}`,
  isRead: false,
  isDismissed: false,
  createdAt: new Date(),
});

const fanOutEligibilityNotifications = async (companyVisit) => {
  if (!companyVisit) {
    return { matchedStudents: 0, eligibleStudents: 0 };
  }

  const students = await User.find({
    role: 'student',
    isBlocked: false,
  });

  const eligibleStudents = students.filter((student) =>
    typeof companyVisit.minCgpa === 'number' &&
    Array.isArray(companyVisit.eligibleBranches) &&
    companyVisit.minCgpa <= student.cgpa &&
    companyVisit.eligibleBranches.includes(student.branch)
  );

  let matchedStudents = 0;

  await Promise.all(
    eligibleStudents.map(async (student) => {
      const existingNotificationVisitIds = new Set(
        (student.notifications || []).map((notification) => notification.companyVisit?.toString())
      );

      if (existingNotificationVisitIds.has(companyVisit._id.toString())) {
        return;
      }

      student.notifications = [...(student.notifications || []), buildEligibilityNotification(companyVisit)];
      await student.save();
      matchedStudents += 1;
    })
  );

  return { matchedStudents, eligibleStudents: eligibleStudents.length };
};

// Add new company visit (Admin only)
exports.addCompanyVisit = async (req, res) => {
  try {
    const { companyName, location, rolesOffered, packageRange, eligibilityCriteria, jobDescription, batch, minCgpa, eligibleBranches } = req.body;
    const adminId = req.user.userId;

    const companyVisit = new CompanyVisit({
      companyName,
      location,
      rolesOffered,
      packageRange,
      eligibilityCriteria,
      jobDescription,
      batch,
      minCgpa,
      eligibleBranches,
      addedBy: adminId
    });

    await companyVisit.save();
    await fanOutEligibilityNotifications(companyVisit);

    res.status(201).json({
      message: 'Company visit added successfully',
      companyVisit
    });

  } catch (error) {
    console.error('Error adding company visit:', error);
    res.status(500).json({ message: 'Error adding company visit' });
  }
};

// Get eligible company visits for logged-in student
exports.getEligibleNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const companyVisits = await CompanyVisit.find({ status: 'active' })
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });

    const eligibleVisits = companyVisits.filter((companyVisit) =>
      typeof companyVisit.minCgpa === 'number' &&
      Array.isArray(companyVisit.eligibleBranches) &&
      companyVisit.minCgpa <= user.cgpa &&
      companyVisit.eligibleBranches.includes(user.branch)
    );

    const existingNotificationVisitIds = new Set(
      (user.notifications || []).map((notification) => notification.companyVisit?.toString())
    );

    const newNotifications = eligibleVisits
      .filter((companyVisit) => !existingNotificationVisitIds.has(companyVisit._id.toString()))
      .map((companyVisit) => ({
        companyVisit: companyVisit._id,
        companyName: companyVisit.companyName,
        message: `You're eligible for ${companyVisit.companyName}`,
        isRead: false,
      }));

    if (newNotifications.length > 0) {
      user.notifications = [...(user.notifications || []), ...newNotifications];
      await user.save();
    }

    const notifications = (user.notifications || []).sort(
      (first, second) => new Date(second.createdAt) - new Date(first.createdAt)
    );

    res.json({ eligibleVisits, notifications });

  } catch (error) {
    console.error('Error fetching eligible notifications:', error);
    res.status(500).json({ message: 'Error fetching eligible notifications' });
  }
};

exports.dismissNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = user.notifications.id(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isDismissed = true;
    await user.save();

    res.json({ message: 'Notification dismissed successfully' });

  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ message: 'Error dismissing notification' });
  }
};

exports.applyForCompanyVisit = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const companyVisit = await CompanyVisit.findById(req.params.id);

    if (!companyVisit) {
      return res.status(404).json({ message: 'Company visit not found' });
    }

    if (
      typeof companyVisit.minCgpa !== 'number' ||
      !Array.isArray(companyVisit.eligibleBranches) ||
      companyVisit.minCgpa > user.cgpa ||
      !companyVisit.eligibleBranches.includes(user.branch)
    ) {
      return res.status(400).json({ message: 'You are not eligible for this company visit' });
    }

    const existingApplication = await CompanyApplication.findOne({
      user: user._id,
      companyVisit: companyVisit._id,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this company visit' });
    }

    const application = new CompanyApplication({
      user: user._id,
      companyVisit: companyVisit._id,
      companyName: companyVisit.companyName,
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber,
      batch: user.batch,
      cgpa: user.cgpa,
      branch: user.branch,
      // Keep a snapshot for audit, while admin views can still populate live user data.
      profilePhoto: user.profilePhoto || null,
      linkedin: user.linkedin || '',
      github: user.github || '',
      portfolio: user.portfolio || '',
      skills: user.skills || '',
      bio: user.bio || '',
    });

    await application.save();

    const notification = (user.notifications || []).find(
      (userNotification) => userNotification.companyVisit?.toString() === companyVisit._id.toString()
    );

    if (notification) {
      notification.isRead = true;
      await user.save();
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });

  } catch (error) {
    console.error('Error applying for company visit:', error);
    res.status(500).json({ message: 'Error applying for company visit' });
  }
};

// Get company applications for admin / superadmin
exports.getCompanyApplications = async (req, res) => {
  try {
    const applications = await CompanyApplication.find()
      .populate('companyVisit', 'companyName location batch minCgpa eligibleBranches status')
      .populate('user', 'name email rollNumber batch cgpa branch profilePhoto linkedin github portfolio skills bio')
      .sort({ createdAt: -1 });

    const grouped = applications.reduce((acc, application) => {
      const companyVisit = application.companyVisit;
      const companyKey = companyVisit?._id?.toString() || application.companyName;

      if (!acc[companyKey]) {
        acc[companyKey] = {
          companyVisit,
          companyName: application.companyName,
          applications: [],
          totalApplications: 0,
        };
      }

      acc[companyKey].applications.push({
        _id: application._id,
        createdAt: application.createdAt,
        status: application.status,
        companyName: application.companyName,
        snapshot: {
          name: application.name,
          email: application.email,
          rollNumber: application.rollNumber,
          batch: application.batch,
          cgpa: application.cgpa,
          branch: application.branch,
        },
        user: application.user ? {
          _id: application.user._id,
          name: application.user.name,
          email: application.user.email,
          rollNumber: application.user.rollNumber,
          batch: application.user.batch,
          cgpa: application.user.cgpa,
          branch: application.user.branch,
          profilePhoto: application.user.profilePhoto || null,
          linkedin: application.user.linkedin || '',
          github: application.user.github || '',
          portfolio: application.user.portfolio || '',
          skills: application.user.skills || '',
          bio: application.user.bio || '',
        } : null,
      });
      acc[companyKey].totalApplications += 1;

      return acc;
    }, {});

    const companies = Object.values(grouped).sort(
      (first, second) => new Date(second.applications[0]?.createdAt || 0) - new Date(first.applications[0]?.createdAt || 0)
    );

    res.json({ companies, applications });
  } catch (error) {
    console.error('Error fetching company applications:', error);
    res.status(500).json({ message: 'Error fetching company applications' });
  }
};

// Get all active company visits (Public)
exports.getAllCompanyVisits = async (req, res) => {
  try {
    const companyVisits = await CompanyVisit.find({ status: 'active' })
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ companyVisits });

  } catch (error) {
    console.error('Error fetching company visits:', error);
    res.status(500).json({ message: 'Error fetching company visits' });
  }
};

// Update company visit (Admin only)
exports.updateCompanyVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const companyVisit = await CompanyVisit.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!companyVisit) {
      return res.status(404).json({ message: 'Company visit not found' });
    }

    await fanOutEligibilityNotifications(companyVisit);

    res.json({
      message: 'Company visit updated successfully',
      companyVisit
    });

  } catch (error) {
    console.error('Error updating company visit:', error);
    res.status(500).json({ message: 'Error updating company visit' });
  }
};

// Delete company visit (Admin only)
exports.deleteCompanyVisit = async (req, res) => {
  try {
    const { id } = req.params;

    const companyVisit = await CompanyVisit.findByIdAndDelete(id);

    if (!companyVisit) {
      return res.status(404).json({ message: 'Company visit not found' });
    }

    res.json({ message: 'Company visit deleted successfully' });

  } catch (error) {
    console.error('Error deleting company visit:', error);
    res.status(500).json({ message: 'Error deleting company visit' });
  }
};

// Archive company visit (Admin only)
exports.archiveCompanyVisit = async (req, res) => {
  try {
    const { id } = req.params;

    const companyVisit = await CompanyVisit.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );

    if (!companyVisit) {
      return res.status(404).json({ message: 'Company visit not found' });
    }

    res.json({
      message: 'Company visit archived successfully',
      companyVisit
    });

  } catch (error) {
    console.error('Error archiving company visit:', error);
    res.status(500).json({ message: 'Error archiving company visit' });
  }
};
