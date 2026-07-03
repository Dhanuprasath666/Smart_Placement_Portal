import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getEligibleNotifications } from '../utils/api';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getEligibleNotifications();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 font-semibold">Loading notifications...</p>
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Notifications</h1>
          <p className="text-gray-600 text-lg">Your stored eligibility alerts stay here.</p>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 shadow-lg text-center">
            <p className="text-gray-600 text-lg">No notifications yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {notifications.map((notification) => (
              <div key={notification._id} className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">
                      {notification.isRead ? 'Applied' : 'Eligible'}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-gray-800">{notification.companyName}</h2>
                    <p className="mt-2 text-gray-600">{notification.message}</p>
                  </div>
                  <Link
                    to={`/company-visit/${notification.companyVisit}/apply`}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
                  >
                    {notification.isRead ? 'View Application' : "I'm Interested to Apply"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
