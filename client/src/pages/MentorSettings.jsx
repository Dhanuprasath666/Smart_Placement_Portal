import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { updateMentorProfile } from '../utils/api';

function MentorSettings() {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    jobRole: '',
    graduationYear: '',
    willingToMentor: false,
    willingToRefer: false,
    shortBio: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.mentorProfile) {
      setFormData({
        jobRole: user.mentorProfile.jobRole || '',
        graduationYear: user.mentorProfile.graduationYear || '',
        willingToMentor: user.mentorProfile.willingToMentor || false,
        willingToRefer: user.mentorProfile.willingToRefer || false,
        shortBio: user.mentorProfile.shortBio || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const data = await updateMentorProfile(formData);
      updateUser({ ...user, mentorProfile: data.mentorProfile });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating mentor settings');
    } finally {
      setSaving(false);
    }
  };

  if (!user?.isMentor) {
    return (
      <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="rounded-2xl bg-white p-10 shadow-lg text-center max-w-md">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-gray-800 text-lg font-semibold">Verified alumni only</p>
            <p className="text-gray-600 mt-2">
              Mentor settings unlock automatically once one of your placements is approved by an admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mentor Settings</h1>
          <p className="text-gray-600">Control how you appear in the alumni mentor directory</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">🎯 Availability</h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 cursor-pointer">
                <div>
                  <p className="font-semibold text-gray-800">Willing to Mentor</p>
                  <p className="text-sm text-gray-500">Show up as open to mentorship conversations</p>
                </div>
                <input
                  type="checkbox"
                  name="willingToMentor"
                  checked={formData.willingToMentor}
                  onChange={handleChange}
                  className="w-5 h-5 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 cursor-pointer">
                <div>
                  <p className="font-semibold text-gray-800">Willing to Refer</p>
                  <p className="text-sm text-gray-500">Show up as open to giving referrals at your company</p>
                </div>
                <input
                  type="checkbox"
                  name="willingToRefer"
                  checked={formData.willingToRefer}
                  onChange={handleChange}
                  className="w-5 h-5 accent-blue-600"
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">💼 Mentor Profile</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Role</label>
                <input
                  type="text"
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleChange}
                  placeholder="e.g., SDE-1"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Graduation Year</label>
                <input
                  type="text"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  placeholder="e.g., 2025"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Short Bio</label>
                <textarea
                  name="shortBio"
                  value={formData.shortBio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="A short note shown on your mentor profile..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Want to update your name, skills, or LinkedIn/GitHub links?{' '}
              <Link to="/dashboard/profile" className="text-blue-600 font-semibold hover:underline">
                Edit your profile
              </Link>
            </p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {saved && <p className="text-green-600 text-sm font-semibold">✓ Mentor settings saved</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MentorSettings;
