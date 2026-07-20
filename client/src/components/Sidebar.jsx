import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Overview' },
    { path: '/dashboard/notifications', icon: '🔔', label: 'Notifications' },
    { path: '/dashboard/submit', icon: '📝', label: 'Submit Placement' },
    { path: '/dashboard/my-placements', icon: '📊', label: 'My Placements' },
    { path: '/dashboard/profile', icon: '👤', label: 'My Profile' },
    { path: '/placements', icon: '🎯', label: 'Explore Placements' },
    { path: '/company-visits', icon: '🏢', label: 'Companies' },
    { path: '/mentors', icon: '🎓', label: 'Find Mentors' },
    { path: '/dashboard/mentor-requests', icon: '📨', label: 'My Requests' },
    ...(user?.isMentor
      ? [
          { path: '/dashboard/incoming-requests', icon: '📥', label: 'Incoming Requests' },
          { path: '/dashboard/mentor-settings', icon: '⚙️', label: 'Mentor Settings' },
        ]
      : []),
  ];

  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-slate-200 bg-slate-950 px-5 py-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-slate-950 shadow-lg">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">PlacementHub</h1>
            <p className="text-xs text-slate-400">Student Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-white/10 text-white ring-1 ring-white/10'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition-all duration-200 hover:bg-rose-500/15 hover:text-white"
      >
        <span className="text-xl">🚪</span>
        <span className="font-medium">Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;
