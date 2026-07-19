import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { getMyPlacements, updateCurrentUser } from "../utils/api";

function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    batch: "",
    linkedin: "",
    github: "",
    portfolio: "",
    skills: "",
    bio: "",
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [totalPlacements, setTotalPlacements] = useState(0);
  const [approvedPlacements, setApprovedPlacements] = useState(0);

  useEffect(() => {
    fetchPlacementStats();
  }, []);

  const fetchPlacementStats = async () => {
    try {
      const data = await getMyPlacements();
      const placements = data.placements || [];

      setTotalPlacements(placements.length);

      const approved = placements.filter((p) => p.status === "approved").length;

      setApprovedPlacements(approved);
    } catch (err) {
      console.error("Error fetching placement stats", err);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        rollNumber: user.rollNumber || "",
        batch: user.batch || "",
        linkedin: user.linkedin || "",
        github: user.github || "",
        portfolio: user.portfolio || "",
        skills: user.skills || "",
        bio: user.bio || "",
      });
      setPhotoPreview(user.profilePhoto || "");
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfilePhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : (user?.profilePhoto || ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("linkedin", formData.linkedin);
      payload.append("github", formData.github);
      payload.append("portfolio", formData.portfolio);
      payload.append("skills", formData.skills);
      payload.append("bio", formData.bio);

      if (profilePhotoFile) {
        payload.append("profilePhoto", profilePhotoFile);
      }

      const data = await updateCurrentUser(payload);
      updateUser(data.user);
      setIsEditing(false);
      setProfilePhotoFile(null);
      setPhotoPreview(data.user.profilePhoto || "");
      alert("Profile updated successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              My Profile
            </h1>
            <p className="text-gray-600">
              Manage your personal information and preferences
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
              isEditing
                ? "bg-gray-500 hover:bg-gray-600 text-white"
                : "bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            }`}
          >
            {isEditing ? "✕ Cancel" : "✏️ Edit Profile"}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center sticky top-8">
              {/* Avatar */}
              <div className="w-32 h-32 mx-auto mb-6 overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                {photoPreview ? (
                  <img src={photoPreview} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>

              {isEditing && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                  />
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {user?.name}
              </h2>
              <p className="text-gray-600 mb-1">{user?.email}</p>
              <p className="text-sm text-gray-500 mb-4">
                Batch of {user?.batch}
              </p>

              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                🎓 Student
              </div>

              {/* Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalPlacements}
                    </p>
                    <p className="text-sm text-gray-600">Placements</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {approvedPlacements}
                    </p>
                    <p className="text-sm text-gray-600">Approved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  📋 Basic Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition ${
                        isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600"
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
                      disabled
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  🔗 Social Links
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition ${
                        isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="https://github.com/yourusername"
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition ${
                        isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Portfolio Website
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="https://yourportfolio.com"
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition ${
                        isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* About & Skills */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  💼 About & Skills
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows="4"
                      placeholder="Tell us about yourself..."
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition ${
                        isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g., React, Node.js, Python, Data Analysis"
                      className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition ${
                        isEditing
                          ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "💾 Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
