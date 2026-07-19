import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getEligibleNotifications, getMyPlacements, submitPlacement } from '../utils/api';

function StudentDashboard() {
  const [myPlacements, setMyPlacements] = useState([]);
  const [eligibleVisits, setEligibleVisits] = useState([]);
  const [showEligibilityBanner, setShowEligibilityBanner] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    company: '',
    package: '',
    batch: '',
    interviewExperience: '',
    isAnonymous: false
  });
  const [files, setFiles] = useState({
    offerLetter: null,
    idCard: null
  });

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPlacements();
    fetchEligibleNotifications();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        studentName: user.name,
        batch: user.batch
      }));
    }
  }, [user]);

  const fetchMyPlacements = async () => {
    try {
      const data = await getMyPlacements();
      setMyPlacements(data.placements);
    } catch (error) {
      console.error('Error fetching placements:', error);
    }
  };

  const fetchEligibleNotifications = async () => {
    try {
      const data = await getEligibleNotifications();
      setEligibleVisits(data.eligibleVisits || []);
      setShowEligibilityBanner(true);
    } catch (error) {
      console.error('Error fetching eligible notifications:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('studentName', formData.studentName);
      formDataToSend.append('company', formData.company);
      formDataToSend.append('package', formData.package);
      formDataToSend.append('batch', formData.batch);
      formDataToSend.append('interviewExperience', formData.interviewExperience);
      formDataToSend.append('isAnonymous', formData.isAnonymous);
      formDataToSend.append('offerLetter', files.offerLetter);
      formDataToSend.append('idCard', files.idCard);

      await submitPlacement(formDataToSend);
      alert('🎉 Placement submitted successfully! Waiting for admin approval.');
      setShowForm(false);
      fetchMyPlacements();
      
      setFormData({
        studentName: user.name,
        company: '',
        package: '',
        batch: user.batch,
        interviewExperience: '',
        isAnonymous: false
      });
      setFiles({ offerLetter: null, idCard: null });
      
    } catch (error) {
      alert('Error submitting placement: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return '✓';
      case 'rejected': return '✗';
      default: return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}! 👋</p>
            </div>
            <div className="flex gap-3">
              <Link to="/placements">
                <button className="px-6 py-2.5 bg-linear-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition duration-200">
                  🎯 View All Placements
                </button>
              </Link>
              <button 
                onClick={handleLogout}
                className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl shadow-md hover:bg-red-700 hover:shadow-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showEligibilityBanner && eligibleVisits.length > 0 && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-emerald-800">Eligibility Notification</p>
              <p className="mt-1 text-emerald-700">
                You're eligible for: {eligibleVisits.map((visit) => visit.companyName).join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEligibilityBanner(false)}
              className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button 
          onClick={() => setShowForm(!showForm)}
          className="mb-8 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex items-center gap-2"
        >
          {showForm ? '✕ Cancel' : '+ Submit New Placement'}
        </button>

        {/* Submission Form */}
        {showForm && (
          <div className="mb-10 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📝 Submit Placement Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Google, Microsoft"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Package (in LPA)
                  </label>
                  <input
                    type="number"
                    name="package"
                    value={formData.package}
                    onChange={handleChange}
                    required
                    step="0.01"
                    placeholder="e.g., 12.5"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Batch (Passout Year)
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interview Experience (Optional)
                </label>
                <textarea
                  name="interviewExperience"
                  value={formData.interviewExperience}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Share your interview experience, tips, questions asked..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📄 Offer Letter (PDF/Image)
                  </label>
                  <input
                    type="file"
                    name="offerLetter"
                    onChange={handleFileChange}
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🆔 ID Card (Image)
                  </label>
                  <input
                    type="file"
                    name="idCard"
                    onChange={handleFileChange}
                    required
                    accept=".jpg,.jpeg,.png"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isAnonymous" className="ml-3 text-sm font-medium text-gray-700">
                  Submit anonymously (hide my name publicly)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  '✓ Submit Placement'
                )}
              </button>
            </form>
          </div>
        )}

        {/* My Submissions */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 My Submissions</h3>
          
          {myPlacements.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg">You haven't submitted any placements yet.</p>
              <p className="text-gray-500 mt-2">Click the button above to submit your first placement!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {myPlacements.map((placement) => (
                <div 
                  key={placement._id} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 p-6 border-l-4"
                  style={{
                    borderLeftColor: placement.status === 'approved' ? '#10b981' : placement.status === 'rejected' ? '#ef4444' : '#f59e0b'
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-800 mb-2">{placement.company}</h4>
                      <div className="space-y-1 text-gray-600">
                        <p><strong>Package:</strong> <span className="text-green-600 font-bold text-lg">₹{placement.package} LPA</span></p>
                        <p><strong>Batch:</strong> {placement.batch}</p>
                        <p><strong>Submitted:</strong> {new Date(placement.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className={`px-6 py-3 rounded-xl border-2 font-bold text-lg flex items-center gap-2 ${getStatusColor(placement.status)}`}>
                      <span className="text-2xl">{getStatusIcon(placement.status)}</span>
                      {placement.status.toUpperCase()}
                    </div>
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

export default StudentDashboard;
