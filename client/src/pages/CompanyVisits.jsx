import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllCompanyVisits } from "../utils/api";

function CompanyVisits() {
  const [companyVisits, setCompanyVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    company: "",
    role: "",
    batch: "",
    minPackage: "",
    maxPackage: "",
  });

  useEffect(() => {
    fetchCompanyVisits();
  }, []);

  const fetchCompanyVisits = async () => {
    try {
      const data = await getAllCompanyVisits();
      setCompanyVisits(data.companyVisits);
    } catch (error) {
      console.error("Error fetching company visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      company: "",
      role: "",
      batch: "",
      minPackage: "",
      maxPackage: "",
    });
  };

  const filteredVisits = companyVisits.filter((visit) => {
    const matchCompany =
      filters.company === "" ||
      visit.companyName.toLowerCase().includes(filters.company.toLowerCase());

    const matchRole =
      filters.role === "" ||
      visit.rolesOffered.some((role) =>
        role.toLowerCase().includes(filters.role.toLowerCase()),
      );

    const matchBatch =
      filters.batch === "" || visit.batch.includes(filters.batch);

    const matchMinPackage =
      filters.minPackage === "" ||
      visit.packageRange.max >= parseFloat(filters.minPackage);

    const matchMaxPackage =
      filters.maxPackage === "" ||
      visit.packageRange.min <= parseFloat(filters.maxPackage);

    return (
      matchCompany &&
      matchRole &&
      matchBatch &&
      matchMinPackage &&
      matchMaxPackage
    );
  });

  const uniqueCompanies = [...new Set(companyVisits.map((v) => v.companyName))];
  const uniqueBatches = [...new Set(companyVisits.map((v) => v.batch))].sort().reverse();
  const maxPackageOverall = companyVisits.length > 0 ? Math.max(...companyVisits.map(v => v.packageRange.max)) : 0;
  const avgPackageOverall = companyVisits.length > 0 ? (companyVisits.reduce((sum, v) => sum + (v.packageRange.min + v.packageRange.max) / 2, 0) / companyVisits.length).toFixed(2) : 0;

  if (loading) {
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🏢</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Company Visits</h1>
                <p className="text-gray-400 text-sm">Explore recruitment opportunities at our college</p>
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
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Total Companies</p>
              <p className="text-5xl font-bold text-white mt-2">{uniqueCompanies.length}</p>
              <p className="text-blue-200 text-sm mt-2">visiting campus</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">Total Opportunities</p>
              <p className="text-5xl font-bold text-white mt-2">{companyVisits.length}</p>
              <p className="text-emerald-200 text-sm mt-2">positions available</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-purple-200 text-sm font-semibold uppercase tracking-wide">Max Package</p>
              <p className="text-5xl font-bold text-white mt-2">₹{maxPackageOverall}</p>
              <p className="text-purple-200 text-sm mt-2">LPA</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-orange-200 text-sm font-semibold uppercase tracking-wide">Avg Package</p>
              <p className="text-5xl font-bold text-white mt-2">₹{avgPackageOverall}</p>
              <p className="text-orange-200 text-sm mt-2">LPA</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-8 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              🔍 Filter Companies
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={filters.company}
                onChange={handleFilterChange}
                placeholder="Search company..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Role
              </label>
              <input
                type="text"
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                placeholder="Search role..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Batch
              </label>
              <select
                name="batch"
                value={filters.batch}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="">All Batches</option>
                {uniqueBatches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Min Package (LPA)
              </label>
              <input
                type="number"
                name="minPackage"
                value={filters.minPackage}
                onChange={handleFilterChange}
                placeholder="Min"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Max Package (LPA)
              </label>
              <input
                type="number"
                name="maxPackage"
                value={filters.maxPackage}
                onChange={handleFilterChange}
                placeholder="Max"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Showing <span className="text-blue-400 font-bold">{filteredVisits.length}</span> of{" "}
            <span className="text-blue-400 font-bold">{companyVisits.length}</span> companies
          </div>
        </div>

        {/* Company Visits List */}
        {filteredVisits.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-12 text-center border border-slate-700">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-white text-lg font-semibold">No companies found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredVisits.map((visit) => (
              <div
                key={visit._id}
                className="bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl hover:border-blue-500 transition duration-300 p-6 border border-slate-700"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    {/* Company Header */}
                    <div className="mb-4">
                      <h3 className="text-3xl font-bold text-white mb-3">
                        {visit.companyName}
                      </h3>
                      <div className="flex gap-2 flex-wrap mb-4">
                        <div className="px-3 py-1 bg-blue-600 bg-opacity-30 text-blue-300 rounded-full text-sm font-semibold border border-blue-600">
                          📅 {visit.batch}
                        </div>
                        <div className="px-3 py-1 bg-emerald-600 bg-opacity-30 text-emerald-300 rounded-full text-sm font-semibold border border-emerald-600">
                          📍 {visit.location}
                        </div>
                      </div>
                    </div>

                    {/* Package Info */}
                    <div className="mb-4 bg-slate-700 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-2">💼 Package Range</p>
                      <p className="text-2xl font-bold text-green-400">
                        ₹{visit.packageRange.min} - ₹{visit.packageRange.max} LPA
                      </p>
                    </div>

                    {/* Roles */}
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">🎯 Roles Offered ({visit.rolesOffered.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {visit.rolesOffered.map((role, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-600 bg-opacity-30 text-purple-300 rounded-full text-sm font-semibold border border-purple-600"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Eligibility */}
                    <div className="mb-4 bg-slate-700 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-2">✅ Eligibility Criteria</p>
                      <p className="text-gray-300 leading-relaxed">{visit.eligibilityCriteria}</p>
                    </div>

                    {/* Job Description */}
                    <div className="mb-4 bg-slate-700 rounded-xl p-4">
                      <p className="text-gray-400 text-sm mb-2">📋 Job Description</p>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line line-clamp-4">
                        {visit.jobDescription}
                      </p>
                    </div>

                    <div className="text-xs text-gray-500">
                      📌 Added on:{" "}
                      {new Date(visit.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    {/* Read More Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Link to={`/company-visit/${visit._id}`}>
                        <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition">
                          📖 Read Full Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyVisits;