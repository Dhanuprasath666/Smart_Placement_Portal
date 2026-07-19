import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { dismissNotification, getEligibleNotifications, getMyPlacements, getAllPlacements, getAllCompanyVisits } from '../utils/api';
import Sidebar from '../components/Sidebar';

function DashboardOverview() {
  const { user } = useContext(AuthContext);
  const [myPlacements, setMyPlacements] = useState([]);
  const [allPlacements, setAllPlacements] = useState([]);
  const [companyVisits, setCompanyVisits] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [myData, allData, companiesData] = await Promise.all([
        getMyPlacements(),
        getAllPlacements(),
        getAllCompanyVisits()
      ]);
      
      setMyPlacements(myData.placements);
      setAllPlacements(allData.placements);
      setCompanyVisits(companiesData.companyVisits);
      const notificationsData = await getEligibleNotifications();
      setNotifications(notificationsData.notifications || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const myBatchPlacements = allPlacements.filter(p => p.batch === user?.batch);
  const avgPackage = myBatchPlacements.length > 0
    ? (myBatchPlacements.reduce((sum, p) => sum + p.package, 0) / myBatchPlacements.length).toFixed(2)
    : 0;
  const approvedCount = myPlacements.filter(p => p.status === 'approved').length;
  const pendingCount = myPlacements.filter(p => p.status === 'pending').length;

  const quickActions = [
    {
      title: 'Submit Placement',
      description: 'Share your success story',
      icon: '🎉',
      color: 'from-green-500 to-emerald-600',
      link: '/dashboard/submit'
    },
    {
      title: 'Explore Companies',
      description: 'Research opportunities',
      icon: '🏢',
      color: 'from-blue-500 to-cyan-600',
      link: '/company-visits'
    },
    {
      title: 'View Placements',
      description: 'Get inspired by peers',
      icon: '🎯',
      color: 'from-purple-500 to-pink-600',
      link: '/placements'
    },
    {
      title: 'My Profile',
      description: 'Update your information',
      icon: '👤',
      color: 'from-orange-500 to-red-600',
      link: '/dashboard/profile'
    }
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-semibold">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 p-8 overflow-auto">
        {showNotifications && notifications.some((notification) => !notification.isDismissed && !notification.isRead) && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-emerald-900">Eligibility Notifications</h2>
                <p className="mt-2 text-emerald-700">
                  You're eligible for: {notifications.filter((notification) => !notification.isDismissed && !notification.isRead).map((notification) => notification.companyName).join(', ')}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {notifications
                    .filter((notification) => !notification.isDismissed && !notification.isRead)
                    .map((notification) => (
                      <Link
                        key={notification._id}
                        to={`/company-visit/${notification.companyVisit}/apply`}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Apply to {notification.companyName}
                      </Link>
                    ))}
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await Promise.all(
                    notifications
                      .filter((notification) => !notification.isDismissed && !notification.isRead)
                      .map((notification) => dismissNotification(notification._id))
                  );
                  setNotifications((prevNotifications) =>
                    prevNotifications.map((notification) => ({
                      ...notification,
                      isDismissed: true,
                    }))
                  );
                  setShowNotifications(false);
                }}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Hey {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to take the next step in your career journey?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <span className="text-3xl">✅</span>
              </div>
              <span className="text-green-600 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full">
                Approved
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Your Approved</p>
            <p className="text-4xl font-bold text-gray-800">{approvedCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <span className="text-3xl">⏳</span>
              </div>
              <span className="text-yellow-600 text-sm font-semibold bg-yellow-100 px-3 py-1 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Awaiting Review</p>
            <p className="text-4xl font-bold text-gray-800">{pendingCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <span className="text-3xl">💰</span>
              </div>
              <span className="text-blue-600 text-sm font-semibold bg-blue-100 px-3 py-1 rounded-full">
                Batch {user?.batch}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Avg Package</p>
            <p className="text-4xl font-bold text-gray-800">₹{avgPackage}</p>
            <p className="text-gray-500 text-xs mt-1">LPA</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <span className="text-3xl">🏢</span>
              </div>
              <span className="text-purple-600 text-sm font-semibold bg-purple-100 px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Companies Visiting</p>
            <p className="text-4xl font-bold text-gray-800">{companyVisits.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group"
              >
                <div className={`bg-linear-to-br ${action.color} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer`}>
                  <div className="text-5xl mb-4">{action.icon}</div>
                  <h3 className="text-white font-bold text-xl mb-2">{action.title}</h3>
                  <p className="text-white text-opacity-90 text-sm">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Placements</h2>
            <Link to="/placements" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
              View All →
            </Link>
          </div>

          {allPlacements.slice(0, 5).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent placements yet</p>
          ) : (
            <div className="space-y-4">
              {allPlacements.slice(0, 5).map((placement) => (
                <div
                  key={placement._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {placement.company.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{placement.company}</p>
                      <p className="text-sm text-gray-600">
                        {placement.isAnonymous ? 'Anonymous' : placement.studentName} • Batch {placement.batch}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">₹{placement.package} LPA</p>
                    <p className="text-xs text-gray-500">
                      {new Date(placement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
