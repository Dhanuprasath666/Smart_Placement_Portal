import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAdmin } from '../utils/api';

function AdminRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    batch: '',
    cgpa: '',
    branch: '',
    adminSecret: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerAdmin(formData);
      alert('Admin account created successfully. Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-200 via-sky-100 to-blue-200 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-white via-amber-50 to-sky-100 p-8 shadow-xl backdrop-blur md:p-10">
          <div className="mb-8 text-center">
            <p className="muted-label uppercase tracking-[0.2em]">Admin registration</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Create admin account</h2>
            <p className="mt-2 text-slate-600">Authorized placement coordinators only</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="font-medium text-rose-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="muted-label mb-2 block">Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" className="field" />
              </div>
              <div>
                <label className="muted-label mb-2 block">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="admin@example.com" className="field" />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="muted-label mb-2 block">CGPA</label>
                <input type="number" name="cgpa" value={formData.cgpa} onChange={handleChange} required min="0" max="10" step="0.01" placeholder="8.5" className="field" />
              </div>
              <div>
                <label className="muted-label mb-2 block">Branch</label>
                <input name="branch" value={formData.branch} onChange={handleChange} required placeholder="CSE" className="field" />
              </div>
            </div>

            <div>
              <label className="muted-label mb-2 block">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" placeholder="Minimum 6 characters" className="field" />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="muted-label mb-2 block">Roll Number</label>
                <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} required placeholder="ADMIN001" className="field" />
              </div>
              <div>
                <label className="muted-label mb-2 block">Batch</label>
                <input name="batch" value={formData.batch} onChange={handleChange} required placeholder="2025" className="field" />
              </div>
            </div>

            <div>
              <label className="muted-label mb-2 block">Admin Secret Code</label>
              <input type="password" name="adminSecret" value={formData.adminSecret} onChange={handleChange} required placeholder="Enter admin secret code" className="field" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating admin account...' : 'Create Admin Account'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-slate-600">
              Not an admin?{' '}
              <Link to="/register" className="font-semibold text-blue-700 hover:underline">
                Register as Student
              </Link>
            </p>
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-700 hover:underline">
                Login here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
