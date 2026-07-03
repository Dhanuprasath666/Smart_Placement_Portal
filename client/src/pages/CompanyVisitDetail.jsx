import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAllCompanyVisits } from '../utils/api';

function CompanyVisitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyVisit, setCompanyVisit] = useState(null);
  const [relatedVisits, setRelatedVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyVisitDetail();
  }, [id]);

  const fetchCompanyVisitDetail = async () => {
    try {
      const data = await getAllCompanyVisits();
      const currentVisit = data.companyVisits.find(v => v._id === id);
      setCompanyVisit(currentVisit);

      if (currentVisit) {
        // Find related company visits (same company or similar package)
        const related = data.companyVisits
          .filter(v => 
            v._id !== id && 
            (v.companyName === currentVisit.companyName || 
             Math.abs(v.packageRange.max - currentVisit.packageRange.max) <= 5)
          )
          .slice(0, 3);
        setRelatedVisits(related);
      }
    } catch (error) {
      console.error('Error fetching company visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const estimateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-white font-semibold">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!companyVisit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-white text-xl font-semibold mb-4">Company visit not found</p>
          <Link to="/company-visits">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
              ← Back to Companies
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Breadcrumbs */}
      <div className="bg-slate-800 border-b border-slate-700 shadow-2xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-400 hover:text-white transition">Home</Link>
              <span className="text-gray-600">/</span>
              <Link to="/company-visits" className="text-gray-400 hover:text-white transition">Companies</Link>
              <span className="text-gray-600">/</span>
              <span className="text-white font-semibold">{companyVisit.companyName}</span>
            </div>
            <button 
              onClick={() => navigate('/company-visits')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-12 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm font-semibold border border-white border-opacity-30">
                🏢 Recruiting
              </span>
              <span className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm font-semibold border border-white border-opacity-30">
                Batch {companyVisit.batch}
              </span>
            </div>

            <h1 className="text-5xl font-bold text-white mb-6">
              {companyVisit.companyName}
            </h1>

            <div className="flex items-center gap-8 mb-6">
              <div>
                <p className="text-cyan-200 text-sm mb-1">Package Range</p>
                <p className="text-5xl font-bold text-white">₹{companyVisit.packageRange.min} - {companyVisit.packageRange.max}</p>
                <p className="text-cyan-200 text-lg">LPA</p>
              </div>

              <div className="h-20 w-px bg-white bg-opacity-30"></div>

              <div>
                <p className="text-cyan-200 text-sm mb-1">Job Location </p>
                <p className="text-2xl font-bold text-white flex items-center gap-2">
                  📍 {companyVisit.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-cyan-200 text-sm">Roles Offered:</p>
              {companyVisit.rolesOffered.map((role, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-xl text-sm font-semibold border border-white border-opacity-30"
                >
                  {role}
                </span>
              ))}
            </div>
            <Link to={`/company-visit/${companyVisit._id}/apply`} className="inline-block mt-6">
              <button className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition">
                I'm Interested to Apply
              </button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Eligibility Criteria */}
            <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                ✅ Eligibility Criteria
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                  {companyVisit.eligibilityCriteria}
                </p>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  📋 Job Description
                </h2>
                <span className="text-sm text-gray-400">
                  📖 {estimateReadingTime(companyVisit.jobDescription)} min read
                </span>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                  {companyVisit.jobDescription}
                </p>
              </div>
            </div>

            {/* What They're Looking For */}
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 shadow-xl border border-purple-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                🎯 What They're Looking For
              </h2>
              
              <div className="space-y-4">
                <div className="bg-slate-800 bg-opacity-50 rounded-xl p-4">
                  <p className="text-purple-300 text-sm mb-2">💼 Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {companyVisit.rolesOffered.map((role, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-purple-600 bg-opacity-30 text-purple-200 rounded-lg text-sm font-semibold border border-purple-500"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800 bg-opacity-50 rounded-xl p-4">
                  <p className="text-purple-300 text-sm mb-2">📍 Location</p>
                  <p className="text-white text-lg font-semibold">{companyVisit.location}</p>
                </div>

                <div className="bg-slate-800 bg-opacity-50 rounded-xl p-4">
                  <p className="text-purple-300 text-sm mb-2">💰 Compensation</p>
                  <p className="text-green-400 text-2xl font-bold">
                    ₹{companyVisit.packageRange.min} - {companyVisit.packageRange.max} LPA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 lg:sticky lg:top-8">
              <h3 className="text-lg font-bold text-white mb-4">Quick Info</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Company</span>
                  <span className="text-white font-semibold">{companyVisit.companyName}</span>
                </div>
                <div className="h-px bg-slate-700"></div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Package</span>
                  <span className="text-green-400 font-bold">₹{companyVisit.packageRange.min}-{companyVisit.packageRange.max} LPA</span>
                </div>
                <div className="h-px bg-slate-700"></div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span className="text-white font-semibold">{companyVisit.location}</span>
                </div>
                <div className="h-px bg-slate-700"></div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Batch</span>
                  <span className="text-white font-semibold">{companyVisit.batch}</span>
                </div>
                <div className="h-px bg-slate-700"></div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Roles</span>
                  <span className="text-white font-semibold">{companyVisit.rolesOffered.length}</span>
                </div>
                <div className="h-px bg-slate-700"></div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Posted</span>
                  <span className="text-white font-semibold">
                    {new Date(companyVisit.createdAt).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Company Visits */}
            {relatedVisits.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">Similar Opportunities</h3>
                
                <div className="space-y-3">
                  {relatedVisits.map((related) => (
                    <Link
                      key={related._id}
                      to={`/company-visit/${related._id}`}
                      className="block p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition group"
                    >
                      <p className="text-white font-semibold mb-1 group-hover:text-cyan-400 transition">
                        {related.companyName}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{related.batch}</span>
                        <span className="text-green-400 font-bold">₹{related.packageRange.min}-{related.packageRange.max} LPA</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 flex justify-center">
          <Link to="/company-visits">
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg transition">
              ← View All Companies
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CompanyVisitDetail;
