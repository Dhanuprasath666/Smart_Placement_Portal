import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getSentRequests } from '../utils/api';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  accepted: 'bg-green-100 text-green-700 border-green-300',
  declined: 'bg-red-100 text-red-700 border-red-300',
};

function MyMentorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getSentRequests();
        setRequests(data.requests || []);
      } catch (error) {
        console.error('Error fetching sent requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-semibold">Loading your requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Mentor Requests</h1>
            <p className="text-gray-600">Track the connection requests you've sent to alumni mentors</p>
          </div>
          <Link to="/mentors">
            <button className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition">
              🔍 Find Mentors
            </button>
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 shadow-lg text-center">
            <p className="text-gray-600 text-lg">You haven't sent any mentor requests yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <div key={request._id} className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${STATUS_STYLES[request.status]}`}>
                      {request.status}
                    </span>
                    <h2 className="mt-2 text-2xl font-bold text-gray-800">
                      {request.toMentor?.name || 'Mentor'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {request.toMentor?.mentorProfile?.jobRole}
                      {request.toMentor?.mentorProfile?.company ? ` @ ${request.toMentor.mentorProfile.company}` : ''}
                    </p>
                    <p className="mt-2 text-blue-600 font-semibold text-sm">{request.requestType}</p>
                    {request.message && <p className="mt-1 text-gray-600">{request.message}</p>}
                  </div>
                  {request.toMentor?._id && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {request.status === 'accepted' && (
                        <Link
                          to={`/messages/${request._id}`}
                          className="rounded-xl bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-5 py-3 text-center font-semibold text-white shadow-lg transition"
                        >
                          💬 Message
                        </Link>
                      )}
                      <Link
                        to={`/mentors/${request.toMentor._id}`}
                        className="rounded-xl bg-gray-100 hover:bg-gray-200 px-5 py-3 text-center font-semibold text-gray-700 transition"
                      >
                        View Mentor
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyMentorRequests;
