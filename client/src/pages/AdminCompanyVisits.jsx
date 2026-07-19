import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import {
  getAllCompanyVisits,
  addCompanyVisit,
  deleteCompanyVisit,
  updateCompanyVisit,
} from "../utils/api";

function AdminCompanyVisits() {
  const [companyVisits, setCompanyVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [formErrors, setFormErrors] = useState({});
  
  const [formData, setFormData] = useState({
    companyName: "",
    location: "",
    rolesOffered: "",
    minPackage: "",
    maxPackage: "",
    minCgpa: "",
    eligibleBranches: "",
    eligibilityCriteria: "",
    jobDescription: "",
    batch: "",
  });

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanyVisits();
  }, []);

  const fetchCompanyVisits = async () => {
    try {
      setLoading(true);
      const data = await getAllCompanyVisits();
      setCompanyVisits(data.companyVisits);
    } catch (error) {
      console.error("Error fetching company visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.companyName.trim()) errors.companyName = "Company name is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.rolesOffered.trim()) errors.rolesOffered = "Roles are required";
    if (!formData.minPackage) errors.minPackage = "Min package is required";
    if (!formData.maxPackage) errors.maxPackage = "Max package is required";
    if (parseFloat(formData.minPackage) > parseFloat(formData.maxPackage)) {
      errors.maxPackage = "Max package must be greater than min package";
    }
    if (formData.minCgpa === "") errors.minCgpa = "Minimum CGPA is required";
    if (formData.minCgpa !== "" && (parseFloat(formData.minCgpa) < 0 || parseFloat(formData.minCgpa) > 10)) {
      errors.minCgpa = "Minimum CGPA must be between 0 and 10";
    }
    if (!formData.eligibleBranches.trim()) errors.eligibleBranches = "Eligible branches are required";
    if (!formData.eligibilityCriteria.trim()) errors.eligibilityCriteria = "Eligibility criteria is required";
    if (!formData.jobDescription.trim()) errors.jobDescription = "Job description is required";
    if (!formData.batch.trim()) errors.batch = "Batch is required";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const rolesArray = formData.rolesOffered
        .split(",")
        .map((role) => role.trim())
        .filter(Boolean);
      const eligibleBranchesArray = formData.eligibleBranches
        .split(",")
        .map((branch) => branch.trim())
        .filter(Boolean);

      const visitData = {
        companyName: formData.companyName,
        location: formData.location,
        rolesOffered: rolesArray,
        packageRange: {
          min: parseFloat(formData.minPackage),
          max: parseFloat(formData.maxPackage),
        },
        minCgpa: parseFloat(formData.minCgpa),
        eligibleBranches: eligibleBranchesArray,
        eligibilityCriteria: formData.eligibilityCriteria,
        jobDescription: formData.jobDescription,
        batch: formData.batch,
      };
      
      if (editingId) {
        await updateCompanyVisit(editingId, visitData);
        alert("✅ Company visit updated successfully!");
        setEditingId(null);
      } else {
        await addCompanyVisit(visitData);
        alert("✅ Company visit added successfully!");
      }
      
      setShowForm(false);
      fetchCompanyVisits();
      resetForm();
    } catch (error) {
      alert(
        "Error: " +
          (error.response?.data?.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      location: "",
      rolesOffered: "",
      minPackage: "",
      maxPackage: "",
      minCgpa: "",
      eligibleBranches: "",
      eligibilityCriteria: "",
      jobDescription: "",
      batch: "",
    });
    setFormErrors({});
  };

  const handleEdit = (visit) => {
    setEditingId(visit._id);
    setFormData({
      companyName: visit.companyName,
      location: visit.location,
      rolesOffered: visit.rolesOffered.join(", "),
      minPackage: visit.packageRange.min,
      maxPackage: visit.packageRange.max,
      minCgpa: visit.minCgpa ?? "",
      eligibleBranches: Array.isArray(visit.eligibleBranches) ? visit.eligibleBranches.join(", ") : "",
      eligibilityCriteria: visit.eligibilityCriteria,
      jobDescription: visit.jobDescription,
      batch: visit.batch,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, companyName) => {
    if (!window.confirm(`Are you sure you want to delete ${companyName}?`))
      return;

    try {
      await deleteCompanyVisit(id);
      alert("✅ Company visit deleted successfully!");
      fetchCompanyVisits();
    } catch (error) {
      alert("Error deleting company visit");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Calculate stats
  const uniqueBatches = [...new Set(companyVisits.map(v => v.batch))].sort().reverse();
  const avgPackage = companyVisits.length > 0
    ? (companyVisits.reduce((sum, v) => sum + (v.packageRange.min + v.packageRange.max) / 2, 0) / companyVisits.length).toFixed(2)
    : 0;
  const maxPackage = companyVisits.length > 0
    ? Math.max(...companyVisits.map(v => v.packageRange.max))
    : 0;
  const totalRoles = [...new Set(companyVisits.flatMap(v => v.rolesOffered))].length;

  // Filter and sort companies
  let filtered = companyVisits.filter(v => {
    const matchesSearch = v.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = filterBatch === "all" || v.batch === filterBatch;
    return matchesSearch && matchesBatch;
  });

  if (sortBy === "package-high") {
    filtered.sort((a, b) => b.packageRange.max - a.packageRange.max);
  } else if (sortBy === "package-low") {
    filtered.sort((a, b) => a.packageRange.min - b.packageRange.min);
  } else if (sortBy === "company") {
    filtered.sort((a, b) => a.companyName.localeCompare(b.companyName));
  }

  if (loading && companyVisits.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-white font-semibold">Loading company visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🏢</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Company Recruitment Management</h1>
                <p className="text-gray-400 text-sm">Welcome back, {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to={user?.role === 'superadmin' ? '/superadmin/admins' : '/admin'}>
                <button className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl shadow-lg transition">
                  ← Dashboard
                </button>
              </Link>
              <Link to="/admin/company-applications">
                <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg transition">
                  📄 Applications
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
        
        {/* Stats Grid */}
        {companyVisits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Total Companies</p>
                <p className="text-5xl font-bold text-white mt-2">{companyVisits.length}</p>
                <p className="text-blue-200 text-sm mt-2">visiting campus</p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">Avg Package</p>
                <p className="text-5xl font-bold text-white mt-2">₹{avgPackage}</p>
                <p className="text-emerald-200 text-sm mt-2">LPA</p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <p className="text-purple-200 text-sm font-semibold uppercase tracking-wide">Max Package</p>
                <p className="text-5xl font-bold text-white mt-2">₹{maxPackage}</p>
                <p className="text-purple-200 text-sm mt-2">LPA</p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <p className="text-orange-200 text-sm font-semibold uppercase tracking-wide">Total Roles</p>
                <p className="text-5xl font-bold text-white mt-2">{totalRoles}</p>
                <p className="text-orange-200 text-sm mt-2">positions offered</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Company Button */}
        <button
          onClick={() => {
            if (!showForm) {
              setEditingId(null);
              resetForm();
            }
            setShowForm(!showForm);
          }}
          className="mb-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 flex items-center gap-2"
        >
          {showForm ? "✕ Cancel" : "+ Add Company Visit"}
        </button>

        {/* Add/Edit Company Form */}
        {showForm && (
          <div className="mb-10 bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              {editingId ? "✏️ Edit Company Visit" : "🏢 Add Company Visit Information"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g., Google, Microsoft"
                    className={`w-full px-4 py-3 bg-slate-700 border-2 ${formErrors.companyName ? 'border-red-500' : 'border-slate-600'} text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition`}
                  />
                  {formErrors.companyName && <p className="text-red-400 text-sm mt-1">{formErrors.companyName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Job Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Bangalore, Remote, Hybrid"
                    className={`w-full px-4 py-3 bg-slate-700 border-2 ${formErrors.location ? 'border-red-500' : 'border-slate-600'} text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition`}
                  />
                  {formErrors.location && <p className="text-red-400 text-sm mt-1">{formErrors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Batch (Year) *
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    placeholder="e.g., 2025"
                    className={`w-full px-4 py-3 bg-slate-700 border-2 ${formErrors.batch ? 'border-red-500' : 'border-slate-600'} text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition`}
                  />
                  {formErrors.batch && <p className="text-red-400 text-sm mt-1">{formErrors.batch}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Roles Offered (comma-separated) *
                </label>
                <input
                  type="text"
                  name="rolesOffered"
                  value={formData.rolesOffered}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer, Data Analyst, Product Manager"
                  className={`w-full px-4 py-3 bg-slate-700 border-2 ${formErrors.rolesOffered ? 'border-red-500' : 'border-slate-600'} text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition`}
                />
                {formErrors.rolesOffered && <p className="text-red-400 text-sm mt-1">{formErrors.rolesOffered}</p>}
                <p className="text-sm text-gray-400 mt-1">Separate multiple roles with commas</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Min Package (LPA) *
                  </label>
                  <input
                    type="number"
                    name="minPackage"
                    value={formData.minPackage}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="e.g., 8"
                    className={`w-full px-4 py-3 bg-slate-700 border-2 ${formErrors.minPackage ? 'border-red-500' : 'border-slate-600'} text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition`}
                  />
                  {formErrors.minPackage && <p className="text-red-400 text-sm mt-1">{formErrors.minPackage}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Max Package (LPA) *
                  </label>
                  <input
                    type="number"
                    name="maxPackage"
                    value={formData.maxPackage}
                    onChange={handleChange}
                    step="0.01"
                    placeholder="e.g., 12"
                    className={`w-full px-4 py-3 bg-slate-700 border-2 ${formErrors.maxPackage ? 'border-red-500' : 'border-slate-600'} text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition`}
                  />
                  {formErrors.maxPackage && <p className="text-red-400 text-sm mt-1">{formErrors.maxPackage}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Minimum CGPA *
                  </label>
                  <input
                    type="number"
                    name="minCgpa"
                    value={formData.minCgpa}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g., 7.5"
                    className={`w-full px-4 py-3 bg-slate-700 border-2 ${formErrors.minCgpa ? 'border-red-500' : 'border-slate-600'} text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition`}
                  />
                  {formErrors.minCgpa && <p className="text-red-400 text-sm mt-1">{formErrors.minCgpa}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Eligible Branches (comma-separated) *
                  </label>
                  <input
                    type="text"
                    name="eligibleBranches"
                    value={formData.eligibleBranches}
                    onChange={handleChange}
                    placeholder="e.g., CSE, IT, ECE"
                    className={`w-full px-4 py-3 bg-slate-700 border-2 ${formErrors.eligibleBranches ? 'border-red-500' : 'border-slate-600'} text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition`}
                  />
                  {formErrors.eligibleBranches && <p className="text-red-400 text-sm mt-1">{formErrors.eligibleBranches}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Eligibility Criteria *
                </label>
                <textarea
                  name="eligibilityCriteria"
                  value={formData.eligibilityCriteria}
                  onChange={handleChange}
                  rows="3"
                  placeholder="e.g., CGPA >= 7.0, All branches eligible, No backlogs"
                  className={`w-full px-4 py-3 bg-slate-700 border-2 ${formErrors.eligibilityCriteria ? 'border-red-500' : 'border-slate-600'} text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition`}
                />
                {formErrors.eligibilityCriteria && <p className="text-red-400 text-sm mt-1">{formErrors.eligibilityCriteria}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Detailed job description, responsibilities, required skills, etc."
                  className={`w-full px-4 py-3 bg-slate-700 border-2 ${formErrors.jobDescription ? 'border-red-500' : 'border-slate-600'} text-white placeholder-gray-500 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition`}
                />
                {formErrors.jobDescription && <p className="text-red-400 text-sm mt-1">{formErrors.jobDescription}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                    ? "✓ Update Company Visit"
                    : "✓ Add Company Visit"}
              </button>
            </form>
          </div>
        )}

        {/* Search, Filter, and Sort */}
        {companyVisits.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">🔍 Search</label>
              <input
                type="text"
                placeholder="Search companies or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">📅 Filter by Batch</label>
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="all">All Batches</option>
                {uniqueBatches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">↕️ Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="recent">Recent</option>
                <option value="company">Company Name</option>
                <option value="package-high">Highest Package</option>
                <option value="package-low">Lowest Package</option>
              </select>
            </div>
          </div>
        )}

        {/* Company Visits List */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">
            📊 {editingId ? "All" : filtered.length === companyVisits.length ? "All" : "Filtered"} Company Visits ({filtered.length})
          </h3>

          {filtered.length === 0 ? (
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-12 text-center border border-slate-700">
              <div className="text-6xl mb-4">🏢</div>
              <p className="text-white text-lg font-semibold">
                {searchQuery || filterBatch !== "all" ? "No companies match your filters" : "No company visits added yet"}
              </p>
              <p className="text-gray-400 mt-2">
                {!searchQuery && filterBatch === "all" && "Click the button above to add your first company!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filtered.map((visit) => (
                <div
                  key={visit._id}
                  className="bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl hover:border-blue-500 transition duration-300 p-6 border border-slate-700"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      {/* Company Header */}
                      <div className="mb-4">
                        <h4 className="text-2xl font-bold text-white mb-2">{visit.companyName}</h4>
                        <div className="flex gap-2 mb-4">
                          <span className="px-3 py-1 bg-blue-600 bg-opacity-30 text-blue-300 rounded-full text-sm font-semibold border border-blue-600">
                            📍 {visit.location}
                          </span>
                          <span className="px-3 py-1 bg-purple-600 bg-opacity-30 text-purple-300 rounded-full text-sm font-semibold border border-purple-600">
                            📅 {visit.batch}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">Posted by: <span className="text-white font-semibold">{visit.addedBy?.name || 'Unknown'}</span> <span className="text-gray-300">({visit.addedBy?.email || '—'})</span></p>
                      </div>

                      {/* Package and Info */}
                      <div className="space-y-3 mb-4">
                        <p className="text-gray-300">
                          <strong className="text-gray-400">Package Range:</strong>{" "}
                          <span className="text-green-400 font-bold">
                            ₹{visit.packageRange.min} - ₹{visit.packageRange.max} LPA
                          </span>
                        </p>
                        <p className="text-gray-300">
                          <strong className="text-gray-400">Minimum CGPA:</strong> {visit.minCgpa ?? "Not set"}
                        </p>
                        <p className="text-gray-300">
                          <strong className="text-gray-400">Eligible Branches:</strong> {Array.isArray(visit.eligibleBranches) ? visit.eligibleBranches.join(", ") : "Not set"}
                        </p>
                      </div>

                      {/* Roles */}
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">💼 Roles Offered</p>
                        <div className="flex flex-wrap gap-2">
                          {visit.rolesOffered.map((role, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-indigo-600 bg-opacity-30 text-indigo-300 rounded-full text-sm font-semibold border border-indigo-600"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Eligibility */}
                      <div className="mb-4 bg-slate-700 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-2">✓ Eligibility Criteria</p>
                        <p className="text-gray-300 leading-relaxed text-sm">{visit.eligibilityCriteria}</p>
                      </div>

                      {/* Job Description */}
                      <div className="bg-slate-700 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-2">📝 Job Description</p>
                        <p className="text-gray-300 leading-relaxed text-sm line-clamp-3">{visit.jobDescription}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:w-48 flex lg:flex-col gap-3">
                      <button
                        onClick={() => handleEdit(visit)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(visit._id, visit.companyName)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition"
                      >
                        🗑️ Delete
                      </button>
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

export default AdminCompanyVisits;
