import { useEffect, useMemo, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import { getCompanyApplications } from '../utils/api';

function AdminCompanyApplications() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getCompanyApplications();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error fetching company applications:', error);
      alert(error.response?.data?.message || 'Error fetching company applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredCompanies = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return companies;

    return companies.filter((companyGroup) => {
      const companyMatch = companyGroup.companyName?.toLowerCase().includes(q);
      const applicantMatch = companyGroup.applications.some((application) => {
        const student = application.user || application.snapshot;
        return [
          student?.name,
          student?.email,
          student?.rollNumber,
          student?.branch,
          student?.batch,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q));
      });

      return companyMatch || applicantMatch;
    });
  }, [companies, search]);

  const content = (
    <div className="flex-1 p-8 overflow-auto">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Company Applications</h1>
          <p className="text-purple-200">
            View every student who applied for each company, with the latest profile data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={user?.role === 'superadmin' ? '/superadmin/admins' : '/admin'}
            className="rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-600"
          >
            Back to Dashboard
          </Link>
          <Link
            to="/admin/company-visits"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Manage Companies
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-purple-700 bg-slate-800 p-6 shadow-2xl">
        <label className="mb-2 block text-sm font-semibold text-purple-200">Search by company or student</label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Company name, roll number, branch, email..."
          className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-purple-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-yellow-500"></div>
            <p className="mt-4 font-semibold text-white">Loading applications...</p>
          </div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-10 text-center text-gray-300 shadow-2xl">
          No applications found.
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCompanies.map((companyGroup) => (
            <section key={companyGroup.companyVisit?._id || companyGroup.companyName} className="rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
              <div className="border-b border-slate-700 p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{companyGroup.companyName}</h2>
                    <p className="text-sm text-gray-400">
                      {companyGroup.totalApplications} applicant{companyGroup.totalApplications === 1 ? '' : 's'}
                      {companyGroup.companyVisit?.location ? ` • ${companyGroup.companyVisit.location}` : ''}
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                    Ready for manual transfer
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900 text-left text-sm text-gray-300">
                    <tr>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Roll / Batch</th>
                      <th className="px-6 py-4">CGPA / Branch</th>
                      <th className="px-6 py-4">Contact & Links</th>
                      <th className="px-6 py-4">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {companyGroup.applications.map((application) => {
                      const student = application.user || application.snapshot;
                      return (
                        <tr key={application._id} className="align-top hover:bg-slate-700/40">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-700">
                                {student?.profilePhoto ? (
                                  <img src={student.profilePhoto} alt={student.name} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 font-bold text-white">
                                    {student?.name?.charAt(0)?.toUpperCase() || 'S'}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{student?.name}</p>
                                <p className="text-sm text-gray-400">{student?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-gray-200">
                            <p className="font-semibold">{student?.rollNumber}</p>
                            <p className="text-sm text-gray-400">Batch {student?.batch}</p>
                          </td>
                          <td className="px-6 py-5 text-gray-200">
                            <p className="font-semibold">CGPA {student?.cgpa}</p>
                            <p className="text-sm text-gray-400">{student?.branch}</p>
                          </td>
                          <td className="px-6 py-5 text-gray-200">
                            <div className="space-y-1 text-sm">
                              {student?.linkedin ? <p><span className="text-purple-300">LinkedIn:</span> {student.linkedin}</p> : null}
                              {student?.github ? <p><span className="text-purple-300">GitHub:</span> {student.github}</p> : null}
                              {student?.portfolio ? <p><span className="text-purple-300">Portfolio:</span> {student.portfolio}</p> : null}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-gray-200">
                            <div className="space-y-2 text-sm">
                              <p>{student?.skills || 'No skills added'}</p>
                              <p className="text-gray-400">
                                Applied on {new Date(application.createdAt).toLocaleDateString()}
                              </p>
                              {student?.bio ? <p className="text-gray-300">{student.bio}</p> : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );

  if (user?.role === 'superadmin') {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <SuperAdminSidebar />
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {content}
    </div>
  );
}

export default AdminCompanyApplications;
