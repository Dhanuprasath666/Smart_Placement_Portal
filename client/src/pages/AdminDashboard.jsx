import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getPendingPlacements, getAllPlacementsAdmin, approvePlacement, rejectPlacement } from '../utils/api';

function NewAdminDashboard() {
  const [pendingPlacements, setPendingPlacements] = useState([]);
  const [allPlacements, setAllPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, pending, all
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingData, allData] = await Promise.all([
        getPendingPlacements(),
        getAllPlacementsAdmin()
      ]);
      setPendingPlacements(pendingData.placements);
      setAllPlacements(allData.placements);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this placement?')) return;
    
    try {
      await approvePlacement(id);
      fetchData();
    } catch (error) {
      alert('Error approving placement');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this placement?')) return;
    
    try {
      await rejectPlacement(id);
      fetchData();
    } catch (error) {
      alert('Error rejecting placement');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Calculate stats
  const approvedPlacements = allPlacements.filter(p => p.status === 'approved');
  const rejectedPlacements = allPlacements.filter(p => p.status === 'rejected');
  const avgPackage = approvedPlacements.length > 0
    ? (approvedPlacements.reduce((sum, p) => sum + p.package, 0) / approvedPlacements.length).toFixed(2)
    : 0;
  const maxPackage = approvedPlacements.length > 0
    ? Math.max(...approvedPlacements.map(p => p.package))
    : 0;

  // Company breakdown
  const companyStats = {};
  approvedPlacements.forEach(p => {
    companyStats[p.company] = (companyStats[p.company] || 0) + 1;
  });
  const topCompanies = Object.entries(companyStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Filter placements based on search
  const filteredPending = pendingPlacements.filter(p =>
    p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-white font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Control Center</h1>
                <p className="text-gray-400 text-sm">Welcome back, {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/admin/company-visits">
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition">
                  🏢 Manage Companies
                </button>
              </Link>
              <Link to="/admin/company-applications">
                <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg transition">
                  📄 Company Applications
                </button>
              </Link>
              <button 
                onClick={handleLogout}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl font-semibold transition relative ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            ⏳ Pending ({pendingPlacements.length})
            {pendingPlacements.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {pendingPlacements.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            📋 All Placements ({allPlacements.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Total Placements</p>
                  <p className="text-5xl font-bold text-white mt-2">{allPlacements.length}</p>
                  <p className="text-blue-200 text-sm mt-2">All time</p>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <p className="text-green-200 text-sm font-semibold uppercase tracking-wide">Approved</p>
                  <p className="text-5xl font-bold text-white mt-2">{approvedPlacements.length}</p>
                  <p className="text-green-200 text-sm mt-2">
                    {allPlacements.length > 0 ? Math.round((approvedPlacements.length / allPlacements.length) * 100) : 0}% approval rate
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <p className="text-orange-200 text-sm font-semibold uppercase tracking-wide">Pending Review</p>
                  <p className="text-5xl font-bold text-white mt-2">{pendingPlacements.length}</p>
                  <p className="text-orange-200 text-sm mt-2">Needs attention</p>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <p className="text-purple-200 text-sm font-semibold uppercase tracking-wide">Avg Package</p>
                  <p className="text-5xl font-bold text-white mt-2">₹{avgPackage}</p>
                  <p className="text-purple-200 text-sm mt-2">LPA</p>
                </div>
              </div>
            </div>

            {/* Insights Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Companies */}
              <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  🏆 Top Recruiting Companies
                </h3>
                {topCompanies.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No data yet</p>
                ) : (
                  <div className="space-y-4">
                    {topCompanies.map(([company, count], index) => (
                      <div key={company} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white' :
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                          index === 2 ? 'bg-gradient-to-br from-orange-700 to-orange-800 text-white' :
                          'bg-slate-700 text-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{company}</p>
                          <p className="text-sm text-gray-400">{count} placement{count > 1 ? 's' : ''}</p>
                        </div>
                        <div className="w-24 bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${(count / topCompanies[0][1]) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  ⚡ Quick Insights
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-700 rounded-xl">
                    <span className="text-gray-300">Highest Package</span>
                    <span className="text-2xl font-bold text-green-400">₹{maxPackage} LPA</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-700 rounded-xl">
                    <span className="text-gray-300">Average Package</span>
                    <span className="text-2xl font-bold text-blue-400">₹{avgPackage} LPA</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-700 rounded-xl">
                    <span className="text-gray-300">Rejected</span>
                    <span className="text-2xl font-bold text-red-400">{rejectedPlacements.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-700 rounded-xl">
                    <span className="text-gray-300">Unique Companies</span>
                    <span className="text-2xl font-bold text-purple-400">{Object.keys(companyStats).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div className="animate-fade-in">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="🔍 Search by company or student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {filteredPending.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-white text-lg font-semibold">All caught up!</p>
                <p className="text-gray-400 mt-2">No pending placements to review</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredPending.map((placement) => (
                  <div 
                    key={placement._id} 
                    className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-blue-500 transition shadow-xl"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-2xl font-bold text-white mb-2">{placement.company}</h4>
                            <span className="px-3 py-1 bg-yellow-500 bg-opacity-20 text-yellow-400 rounded-full text-sm font-semibold border border-yellow-500">
                              ⏳ Pending Review
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold text-3xl">₹{placement.package}</p>
                            <p className="text-gray-400 text-sm">LPA</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-gray-400 text-sm">Student</p>
                            <p className="text-white font-semibold">{placement.studentName}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Roll Number</p>
                            <p className="text-white font-semibold">{placement.userId?.rollNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Email</p>
                            <p className="text-white font-semibold">{placement.userId?.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Batch</p>
                            <p className="text-white font-semibold">{placement.batch}</p>
                          </div>
                        </div>

                        {placement.interviewExperience && (
                          <div className="bg-slate-700 rounded-xl p-4 mb-4">
                            <p className="text-gray-400 text-sm mb-2">💬 Interview Experience</p>
                            <p className="text-gray-300 leading-relaxed">{placement.interviewExperience}</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <a 
                            href={placement.offerLetterUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm"
                          >
                            📄 Offer Letter
                          </a>
                          <a 
                            href={placement.idCardUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold text-sm"
                          >
                            🆔 ID Card
                          </a>
                        </div>
                      </div>

                      <div className="lg:w-48 flex lg:flex-col gap-3">
                        <button 
                          onClick={() => handleApprove(placement._id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition"
                        >
                          ✓ Approve
                        </button>
                        <button 
                          onClick={() => handleReject(placement._id)}
                          className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Placements Tab */}
        {activeTab === 'all' && (
          <div className="animate-fade-in">
            <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Package</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Batch</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {allPlacements.map((placement) => (
                      <tr key={placement._id} className="hover:bg-slate-700 transition">
                        <td className="px-6 py-4 text-white font-semibold">{placement.company}</td>
                        <td className="px-6 py-4 text-gray-300">{placement.studentName}</td>
                        <td className="px-6 py-4 text-green-400 font-bold">₹{placement.package} LPA</td>
                        <td className="px-6 py-4 text-gray-300">{placement.batch}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            placement.status === 'approved' ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500' :
                            placement.status === 'rejected' ? 'bg-red-500 bg-opacity-20 text-red-400 border border-red-500' :
                            'bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500'
                          }`}>
                            {placement.status === 'approved' ? '✓' : placement.status === 'rejected' ? '✗' : '⏳'} {placement.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(placement.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewAdminDashboard;
