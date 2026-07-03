import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function SuperAdminSidebar() {
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/superadmin/admins', icon: '👥', label: 'All Users & Admins' },
    { path: '/admin/company-visits', icon: '🏢', label: 'Company Visits' },
    { path: '/admin/company-applications', icon: '📄', label: 'Company Applications' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 px-5 py-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
      {/* Logo */}
      <div className="mb-8">
        <Link to="/superadmin" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-lg">
            <span className="font-bold text-xl">👑</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">Super Admin</h1>
            <p className="text-xs text-slate-400">Master Control</p>
          </div>
        </Link>
      </div>

      {/* Super Admin Info */}
      <div className="mb-8 rounded-2xl border border-slate-800 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 font-bold text-slate-950">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <span>👑</span> Super Admin
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2">
        <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider mb-3 px-3">
          Main Menu
        </p>
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
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Quick Info */}
      <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <p className="mb-2 text-xs font-semibold text-amber-300">🔒 Full Access</p>
        <p className="text-sm text-slate-200">
          You have complete control over all users and admins.
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition-all duration-200 hover:bg-rose-500/15 hover:text-white"
      >
        <span className="text-xl">🚪</span>
        <span className="font-medium">Logout</span>
      </button>
    </aside>
  );
}

export default SuperAdminSidebar;
