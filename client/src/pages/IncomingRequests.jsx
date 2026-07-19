import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { getReceivedRequests, updateRequestStatus } from '../utils/api';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  accepted: 'bg-green-100 text-green-700 border-green-300',
  declined: 'bg-red-100 text-red-700 border-red-300',
};

function IncomingRequests() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    if (!user?.isMentor) {
      setLoading(false);
      return;
    }
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const data = await getReceivedRequests();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching incoming requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    setActioningId(id);
    try {
      await updateRequestStatus(id, status);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating request');
    } finally {
      setActioningId(null);
    }
  };

  if (!loading && !user?.isMentor) {
    return (
      <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="rounded-2xl bg-white p-10 shadow-lg text-center max-w-md">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-gray-800 text-lg font-semibold">Verified alumni only</p>
            <p className="text-gray-600 mt-2">
              You'll get access to incoming mentor requests once one of your placements is approved by an admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-semibold">Loading incoming requests...</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Incoming Requests</h1>
          <p className="text-gray-600">
            Students who'd like your mentorship, referral, or interview guidance
            {pendingCount > 0 && (
              <span className="ml-2 text-blue-600 font-semibold">({pendingCount} pending)</span>
            )}
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 shadow-lg text-center">
            <p className="text-gray-600 text-lg">
              No requests yet. Once students discover you in the mentor directory, requests will show up here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <div key={request._id} className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">
                      {request.fromStudent?.profilePhoto ? (
                        <img
                          src={request.fromStudent.profilePhoto}
                          alt={request.fromStudent?.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        request.fromStudent?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${STATUS_STYLES[request.status]}`}>
                        {request.status}
                      </span>
                      <h2 className="mt-2 text-xl font-bold text-gray-800">{request.fromStudent?.name}</h2>
                      <p className="text-gray-500 text-sm">{request.fromStudent?.branch}</p>
                      <p className="mt-2 text-blue-600 font-semibold text-sm">{request.requestType}</p>
                      {request.message && <p className="mt-1 text-gray-600">{request.message}</p>}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => handleAction(request._id, 'declined')}
                        disabled={actioningId === request._id}
                        className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:opacity-60 text-gray-700 font-semibold rounded-xl transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAction(request._id, 'accepted')}
                        disabled={actioningId === request._id}
                        className="px-5 py-2.5 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg transition"
                      >
                        Accept
                      </button>
                    </div>
                  )}

                  {request.status === 'accepted' && (
                    <Link
                      to={`/messages/${request._id}`}
                      className="shrink-0 px-5 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition text-center"
                    >
                      💬 Message
                    </Link>
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

export default IncomingRequests;
