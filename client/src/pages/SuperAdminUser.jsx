import { useState, useEffect } from 'react';
import { getAllUsers, getUserStats, blockUser, unblockUser, deleteUser } from '../utils/api';
import SuperAdminSidebar from '../components/SuperAdminSidebar';

function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // all, student, admin
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, blocked

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getUserStats()
      ]);
      setUsers(usersData.users);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching users. Make sure you are logged in as Super Admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, userName) => {
    if (!window.confirm(`Block ${userName}? They won't be able to login.`)) return;
    
    try {
      await blockUser(userId);
      alert('🚫 User blocked successfully!');
      fetchData();
    } catch (error) {
      alert('Error blocking user: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleUnblockUser = async (userId, userName) => {
    if (!window.confirm(`Unblock ${userName}? They will be able to login again.`)) return;
    
    try {
      await unblockUser(userId);
      alert('✅ User unblocked successfully!');
      fetchData();
    } catch (error) {
      alert('Error unblocking user: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`DELETE ${userName}? This will permanently delete their account and all placements. This action CANNOT be undone!`)) return;
    
    const confirmText = window.prompt(`Type "DELETE" to confirm deletion of ${userName}:`);
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled.');
      return;
    }
    
    try {
      await deleteUser(userId);
      alert('🗑️ User deleted successfully!');
      fetchData();
    } catch (error) {
      alert('Error deleting user: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchRole = filterRole === 'all' || user.role === filterRole;
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && !user.isBlocked) ||
      (filterStatus === 'blocked' && user.isBlocked);

    return matchSearch && matchRole && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
        <SuperAdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
            <p className="mt-4 text-white font-semibold">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <SuperAdminSidebar />
      
      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            👥 User Management
          </h1>
          <p className="text-purple-200">Monitor students. <span className="text-yellow-300 font-semibold">Admins (TPO) are registered via secret code only - students cannot become admins</span></p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-indigo-700 bg-opacity-95 backdrop-blur-lg rounded-xl p-4 border border-indigo-400 shadow-md">
              <p className="text-indigo-100 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-extrabold text-white">{stats.totalUsers}</p>
            </div>
            <div className="bg-green-600 bg-opacity-30 backdrop-blur-lg rounded-xl p-4 border border-green-400">
              <p className="text-green-200 text-sm mb-1">Students</p>
              <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
            </div>
            <div className="bg-blue-600 bg-opacity-30 backdrop-blur-lg rounded-xl p-4 border border-blue-400">
              <p className="text-blue-200 text-sm mb-1">Admins</p>
              <p className="text-3xl font-bold text-white">{stats.totalAdmins}</p>
            </div>
            <div className="bg-yellow-600 bg-opacity-30 backdrop-blur-lg rounded-xl p-4 border border-yellow-400">
              <p className="text-yellow-200 text-sm mb-1">Super Admins</p>
              <p className="text-3xl font-bold text-white">{stats.totalSuperAdmins}</p>
            </div>
            <div className="bg-emerald-600 bg-opacity-30 backdrop-blur-lg rounded-xl p-4 border border-emerald-400">
              <p className="text-emerald-200 text-sm mb-1">Active</p>
              <p className="text-3xl font-bold text-white">{stats.activeUsers}</p>
            </div>
            <div className="bg-red-600 bg-opacity-30 backdrop-blur-lg rounded-xl p-4 border border-red-400">
              <p className="text-red-200 text-sm mb-1">Blocked</p>
              <p className="text-3xl font-bold text-white">{stats.blockedUsers}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white bg-opacity-95 rounded-2xl p-6 mb-6 border border-gray-200">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="🔍 Name, Email, or Roll Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option value="all">All Roles</option>
                <option value="student">Students Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-indigo-400 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            Showing <span className="text-indigo-600 font-bold">{filteredUsers.length}</span> of <span className="text-indigo-600 font-bold">{users.length}</span> users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl overflow-hidden border border-purple-400">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Roll Number</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Batch</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Placements</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-purple-800 hover:bg-opacity-30 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-purple-300">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-purple-200">{user.rollNumber}</td>
                    <td className="px-6 py-4 text-purple-200">{user.batch}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'superadmin' ? 'bg-yellow-500 text-yellow-900' :
                        user.role === 'admin' ? 'bg-blue-500 text-blue-900' :
                        'bg-green-500 text-green-900'
                      }`}>
                        {user.role === 'superadmin' ? '👑 Super Admin' :
                         user.role === 'admin' ? '🛡️ Admin' :
                         '🎓 Student'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isBlocked ? 'bg-red-500 text-red-900' : 'bg-green-500 text-green-900'
                      }`}>
                        {user.isBlocked ? '🚫 Blocked' : '✅ Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-purple-200 font-semibold">{user.placementCount || 0}</td>
                    <td className="px-6 py-4">
                      {user.role !== 'superadmin' && (
                        <div className="flex gap-2">
                          {user.isBlocked ? (
                            <button
                              onClick={() => handleUnblockUser(user._id, user.name)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition"
                              title="Unblock"
                            >
                              ✅ Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockUser(user._id, user.name)}
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-lg transition"
                              title="Block"
                            >
                              🚫 Block
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition"
                            title="Delete"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                      {user.role === 'superadmin' && (
                        <span className="text-purple-400 text-xs">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-purple-300 text-lg">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminUsers;