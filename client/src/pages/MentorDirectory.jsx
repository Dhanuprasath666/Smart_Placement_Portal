import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getAllMentors, sendMentorRequest } from '../utils/api';

const REQUEST_TYPES = ['Resume Review', 'Interview Guidance', 'Career Advice', 'Referral Request'];

function MentorDirectory() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ company: '', branch: '', jobRole: '', skills: '' });
  const [filterOptions, setFilterOptions] = useState({ companies: [], branches: [], jobRoles: [] });

  const [openRequestId, setOpenRequestId] = useState(null);
  const [requestForm, setRequestForm] = useState({ requestType: REQUEST_TYPES[0], message: '' });
  const [sending, setSending] = useState(false);
  const [sentIds, setSentIds] = useState([]);
  const [requestError, setRequestError] = useState('');

  // Load the full unfiltered mentor list once, just to build the filter dropdown options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await getAllMentors();
        const list = (data.mentors || []).filter((m) => m._id !== user?.id);
        setFilterOptions({
          companies: [...new Set(list.map((m) => m.mentorProfile?.company).filter(Boolean))],
          branches: [...new Set(list.map((m) => m.branch).filter(Boolean))],
          jobRoles: [...new Set(list.map((m) => m.mentorProfile?.jobRole).filter(Boolean))],
        });
      } catch (error) {
        console.error('Error fetching mentor filter options:', error);
      }
    };
    loadOptions();
  }, [user?.id]);

  // Fetch mentors from the server whenever filters change (debounced)
  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const data = await getAllMentors(filters);
        // A mentor shouldn't see their own card in the directory they browse
        setMentors((data.mentors || []).filter((m) => m._id !== user?.id));
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [filters, user?.id]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ company: '', branch: '', jobRole: '', skills: '' });
  };

  const handleSendRequestClick = (mentorId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setRequestError('');
    setRequestForm({ requestType: REQUEST_TYPES[0], message: '' });
    setOpenRequestId(openRequestId === mentorId ? null : mentorId);
  };

  const handleRequestFormChange = (e) => {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  };

  const handleSubmitRequest = async (mentorId) => {
    setSending(true);
    setRequestError('');
    try {
      await sendMentorRequest({
        toMentor: mentorId,
        requestType: requestForm.requestType,
        message: requestForm.message,
      });
      setSentIds([...sentIds, mentorId]);
      setOpenRequestId(null);
    } catch (error) {
      setRequestError(error.response?.data?.message || 'Error sending request');
    } finally {
      setSending(false);
    }
  };

  if (loading && mentors.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-white font-semibold">Loading mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🎓</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Verified Alumni Mentors</h1>
                <p className="text-gray-400 text-sm">Connect with alumni for guidance, referrals, and mentorship</p>
              </div>
            </div>
            <Link to="/">
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition">
                ← Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-8 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              🔍 Filter Mentors
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Company</label>
              <select
                name="company"
                value={filters.company}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="">All Companies</option>
                {filterOptions.companies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Branch</label>
              <select
                name="branch"
                value={filters.branch}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="">All Branches</option>
                {filterOptions.branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Job Role</label>
              <select
                name="jobRole"
                value={filters.jobRole}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="">All Job Roles</option>
                {filterOptions.jobRoles.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Skills</label>
              <input
                type="text"
                name="skills"
                value={filters.skills}
                onChange={handleFilterChange}
                placeholder="e.g., React"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing <span className="text-blue-400 font-bold">{mentors.length}</span> verified mentor{mentors.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Mentor Cards */}
        {mentors.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-12 text-center border border-slate-700">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-white text-lg font-semibold">No mentors found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {mentors.map((mentor) => {
              const skillsList = (mentor.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
              return (
                <div
                  key={mentor._id}
                  className="bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 p-6 border border-slate-700"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                      {mentor.profilePhoto ? (
                        <img src={mentor.profilePhoto} alt={mentor.name} className="h-full w-full object-cover" />
                      ) : (
                        mentor.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white truncate">{mentor.name}</h3>
                      <p className="text-blue-400 font-semibold">
                        {mentor.mentorProfile?.jobRole || 'Alumni'}
                        {mentor.mentorProfile?.company ? ` @ ${mentor.mentorProfile.company}` : ''}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {mentor.branch}
                        {mentor.mentorProfile?.graduationYear ? ` · Class of ${mentor.mentorProfile.graduationYear}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap mb-4">
                    {mentor.mentorProfile?.willingToMentor && (
                      <span className="px-3 py-1 bg-emerald-600 bg-opacity-30 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-600">
                        🤝 Willing to Mentor
                      </span>
                    )}
                    {mentor.mentorProfile?.willingToRefer && (
                      <span className="px-3 py-1 bg-purple-600 bg-opacity-30 text-purple-300 rounded-full text-xs font-semibold border border-purple-600">
                        📨 Willing to Refer
                      </span>
                    )}
                  </div>

                  {skillsList.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {skillsList.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 bg-slate-700 text-gray-300 rounded-lg text-xs font-medium border border-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {mentor.mentorProfile?.shortBio && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{mentor.mentorProfile.shortBio}</p>
                  )}

                  <div className="flex gap-3">
                    <Link to={`/mentors/${mentor._id}`} className="flex-1">
                      <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm">
                        View Profile
                      </button>
                    </Link>
                    <button
                      onClick={() => handleSendRequestClick(mentor._id)}
                      disabled={sentIds.includes(mentor._id)}
                      className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg transition text-sm"
                    >
                      {sentIds.includes(mentor._id) ? '✓ Sent' : 'Send Request'}
                    </button>
                  </div>

                  {openRequestId === mentor._id && (
                    <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Request Type</label>
                        <select
                          name="requestType"
                          value={requestForm.requestType}
                          onChange={handleRequestFormChange}
                          className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        >
                          {REQUEST_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Message (optional)</label>
                        <textarea
                          name="message"
                          value={requestForm.message}
                          onChange={handleRequestFormChange}
                          rows="2"
                          placeholder="Introduce yourself and what you'd like help with..."
                          className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                      </div>
                      {requestError && <p className="text-red-400 text-sm">{requestError}</p>}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setOpenRequestId(null)}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 rounded-xl transition text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitRequest(mentor._id)}
                          disabled={sending}
                          className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl shadow-lg transition text-sm"
                        >
                          {sending ? 'Sending...' : 'Confirm Request'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MentorDirectory;
