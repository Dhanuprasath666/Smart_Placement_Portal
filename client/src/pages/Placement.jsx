import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPlacements } from '../utils/api';

function Placements() {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    company: '',
    batch: '',
    minPackage: '',
    maxPackage: ''
  });

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      const data = await getAllPlacements();
      setPlacements(data.placements);
    } catch (error) {
      console.error('Error fetching placements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      company: '',
      batch: '',
      minPackage: '',
      maxPackage: ''
    });
  };

  const filteredPlacements = placements.filter(placement => {
    const matchCompany = filters.company === '' || 
      placement.company.toLowerCase().includes(filters.company.toLowerCase());
    
    const matchBatch = filters.batch === '' || 
      placement.batch.includes(filters.batch);
    
    const matchMinPackage = filters.minPackage === '' || 
      placement.package >= parseFloat(filters.minPackage);
    
    const matchMaxPackage = filters.maxPackage === '' || 
      placement.package <= parseFloat(filters.maxPackage);

    return matchCompany && matchBatch && matchMinPackage && matchMaxPackage;
  });

  const uniqueCompanies = [...new Set(placements.map(p => p.company))];
  const uniqueBatches = [...new Set(placements.map(p => p.batch))].sort().reverse();

  // Calculate stats
  const avgPackage = placements.length > 0 
    ? (placements.reduce((sum, p) => sum + p.package, 0) / placements.length).toFixed(2)
    : 0;
  const maxPackage = placements.length > 0 
    ? Math.max(...placements.map(p => p.package))
    : 0;
  const minPackage = placements.length > 0 
    ? Math.min(...placements.map(p => p.package))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-white font-semibold">Loading placements...</p>
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
              <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">📊</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">All Placements</h1>
                <p className="text-gray-400 text-sm">Explore verified placement records from our college</p>
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
          <div className="relative overflow-hidden bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide">Total Placements</p>
              <p className="text-5xl font-bold text-white mt-2">{placements.length}</p>
              <p className="text-blue-200 text-sm mt-2">verified records</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-linear-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wide">Average Package</p>
              <p className="text-5xl font-bold text-white mt-2">₹{avgPackage}</p>
              <p className="text-emerald-200 text-sm mt-2">LPA</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-purple-200 text-sm font-semibold uppercase tracking-wide">Highest Package</p>
              <p className="text-5xl font-bold text-white mt-2">₹{maxPackage}</p>
              <p className="text-purple-200 text-sm mt-2">LPA</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-linear-to-br from-orange-600 to-red-600 rounded-2xl p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <p className="text-orange-200 text-sm font-semibold uppercase tracking-wide">Lowest Package</p>
              <p className="text-5xl font-bold text-white mt-2">₹{minPackage}</p>
              <p className="text-orange-200 text-sm mt-2">LPA</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-8 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              🔍 Filter Placements
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
                Batch
              </label>
              <select
                name="batch"
                value={filters.batch}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="">All Batches</option>
                {uniqueBatches.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
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
            Showing <span className="text-blue-400 font-bold">{filteredPlacements.length}</span> of <span className="text-blue-400 font-bold">{placements.length}</span> placements
          </div>
        </div>

        {/* Placements List */}
        {filteredPlacements.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-12 text-center border border-slate-700">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-white text-lg font-semibold">No placements found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPlacements.map((placement) => (
              <div 
                key={placement._id} 
                className="bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 p-6 border border-slate-700"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    {/* Company Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-3">
                            {placement.company}
                          </h3>
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-green-600 bg-opacity-30 text-green-300 rounded-full text-sm font-semibold border border-green-600 flex items-center gap-1">
                              ✓ Verified
                            </span>
                            <span className="px-3 py-1 bg-blue-600 bg-opacity-30 text-blue-300 rounded-full text-sm font-semibold border border-blue-600">
                              📅 {placement.batch}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-2xl">₹{placement.package}</p>
                          <p className="text-gray-400 text-sm">LPA</p>
                        </div>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-700 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-1">👤 Student</p>
                        <p className="text-white font-semibold">
                          {placement.isAnonymous ? '🔒 Anonymous' : placement.studentName}
                        </p>
                      </div>
                      <div className="bg-slate-700 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-1">📌 Posted On</p>
                        <p className="text-white font-semibold">
                          {new Date(placement.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Interview Experience Preview */}
                    {placement.interviewExperience && (
                      <div className="bg-slate-700 rounded-xl p-4 border border-slate-600 mb-4">
                        <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                          💡 Interview Experience
                        </p>
                        <p className="text-gray-300 leading-relaxed line-clamp-3">
                          {placement.interviewExperience}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Read More Button */}
                  <div className="lg:w-40">
                    <Link to={`/placement/${placement._id}`}>
                      <button className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition">
                        📖 Read More
                      </button>
                    </Link>
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

export default Placements;