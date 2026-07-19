import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { applyForCompanyVisit, getAllCompanyVisits } from '../utils/api';

function CompanyVisitApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [companyVisit, setCompanyVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const data = await getAllCompanyVisits();
        setCompanyVisit(data.companyVisits.find((visit) => visit._id === id) || null);
      } catch (error) {
        console.error('Error fetching company visit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisit();
  }, [id]);

  const handleApply = async () => {
    setSubmitting(true);
    try {
      await applyForCompanyVisit(id);
      alert('Application submitted successfully');
      navigate('/dashboard/notifications');
    } catch (error) {
      alert(error.response?.data?.message || 'Error applying for company visit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!companyVisit) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-gray-700 text-xl font-semibold">
          Company visit not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Apply for {companyVisit.companyName}</h1>
            <p className="mt-2 text-gray-600">Your details are prefilled from your profile.</p>
          </div>
          <Link to="/dashboard/notifications" className="rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-800">
            Back to Notifications
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Application Preview</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Roll Number:</strong> {user?.rollNumber}</p>
              <p><strong>Batch:</strong> {user?.batch}</p>
              <p><strong>CGPA:</strong> {user?.cgpa}</p>
              <p><strong>Branch:</strong> {user?.branch}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Company Details</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>Company:</strong> {companyVisit.companyName}</p>
              <p><strong>Location:</strong> {companyVisit.location}</p>
              <p><strong>Batch:</strong> {companyVisit.batch}</p>
              <p><strong>Minimum CGPA:</strong> {companyVisit.minCgpa}</p>
              <p><strong>Eligible Branches:</strong> {companyVisit.eligibleBranches?.join(', ')}</p>
            </div>

            <button
              type="button"
              onClick={handleApply}
              disabled={submitting}
              className="mt-8 w-full rounded-xl bg-emerald-600 px-6 py-4 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : "I'm Interested to Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyVisitApply;
