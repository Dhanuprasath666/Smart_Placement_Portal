import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getMentorById, sendMentorRequest } from '../utils/api';

const REQUEST_TYPES = ['Resume Review', 'Interview Guidance', 'Career Advice', 'Referral Request'];

function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestForm, setRequestForm] = useState({ requestType: REQUEST_TYPES[0], message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMentor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMentor = async () => {
    setLoading(true);
    try {
      const data = await getMentorById(id);
      setMentor(data.mentor);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      setMentor(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSending(true);
    setError('');
    try {
      await sendMentorRequest({
        toMentor: id,
        requestType: requestForm.requestType,
        message: requestForm.message,
      });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending request');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-white font-semibold">Loading mentor profile...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-white text-xl font-semibold mb-4">Mentor not found</p>
          <Link to="/mentors">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
              ← Back to Mentors
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const skillsList = (mentor.skills || '').split(',').map((s) => s.trim()).filter(Boolean);
  const firstName = mentor.name?.split(' ')[0] || 'this mentor';
  const isOwnProfile = user?.id === mentor._id;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with breadcrumbs */}
      <div className="bg-slate-800 border-b border-slate-700 shadow-2xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-400 hover:text-white transition">Home</Link>
              <span className="text-gray-600">/</span>
              <Link to="/mentors" className="text-gray-400 hover:text-white transition">Mentors</Link>
              <span className="text-gray-600">/</span>
              <span className="text-white font-semibold">{mentor.name}</span>
            </div>
            <button
              onClick={() => navigate('/mentors')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="bg-linear-to-br from-blue-600 to-purple-700 rounded-3xl p-12 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-white text-4xl font-bold shadow-lg shrink-0">
              {mentor.profilePhoto ? (
                <img src={mentor.profilePhoto} alt={mentor.name} className="h-full w-full object-cover" />
              ) : (
                mentor.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="px-4 py-1.5 bg-green-500 bg-opacity-90 text-white rounded-full text-sm font-bold shadow-lg inline-flex items-center gap-2 mb-3">
                <span>✓</span>
                <span>Verified Alumni</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{mentor.name}</h1>
              <p className="text-blue-100 text-lg font-semibold">
                {mentor.mentorProfile?.jobRole || 'Alumni'}
                {mentor.mentorProfile?.company ? ` @ ${mentor.mentorProfile.company}` : ''}
              </p>
              <p className="text-blue-200 text-sm mt-1">
                {mentor.branch}
                {mentor.mentorProfile?.graduationYear ? ` · Class of ${mentor.mentorProfile.graduationYear}` : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">💼 About</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {mentor.mentorProfile?.shortBio || mentor.bio || 'This mentor has not added a bio yet.'}
              </p>
            </div>

            {skillsList.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">🛠️ Skills</h2>
                <div className="flex gap-2 flex-wrap">
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-slate-700 text-gray-300 rounded-lg text-sm font-medium border border-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">🔗 Links</h2>
              <div className="flex gap-4 flex-wrap">
                {mentor.linkedin && (
                  <a
                    href={mentor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-blue-300 rounded-lg transition text-sm font-semibold"
                  >
                    LinkedIn →
                  </a>
                )}
                {mentor.github && (
                  <a
                    href={mentor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition text-sm font-semibold"
                  >
                    GitHub →
                  </a>
                )}
                {!mentor.linkedin && !mentor.github && (
                  <p className="text-gray-400 text-sm">No links shared yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column - request form */}
          <div>
            <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 lg:sticky lg:top-8">
              <h3 className="text-lg font-bold text-white mb-2">Connect with {firstName}</h3>

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

              {isOwnProfile ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-3">👋</div>
                  <p className="text-gray-300 text-sm">
                    This is your own mentor profile — students will see this when they browse the directory.
                  </p>
                  <Link
                    to="/dashboard/mentor-settings"
                    className="mt-4 inline-block w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition"
                  >
                    Edit Mentor Settings
                  </Link>
                </div>
              ) : sent ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-white font-semibold">Request sent!</p>
                  <p className="text-gray-400 text-sm mt-1">You'll be notified once {firstName} responds.</p>
                </div>
              ) : !user ? (
                <div className="text-center py-4">
                  <p className="text-gray-300 text-sm mb-4">Log in to send a connection request.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transition"
                  >
                    Log In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Request Type</label>
                    <select
                      name="requestType"
                      value={requestForm.requestType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                      onChange={handleChange}
                      rows="4"
                      placeholder="Introduce yourself and what you'd like help with..."
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl shadow-lg transition"
                  >
                    {sending ? 'Sending...' : 'Send Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorProfile;
