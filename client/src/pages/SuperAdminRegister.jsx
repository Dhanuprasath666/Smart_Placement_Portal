import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerSuperAdmin } from "../utils/api";

function SuperAdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    batch: "",
    cgpa: "",
    branch: "",
    superSecretCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerSuperAdmin(formData);
      alert("Super admin account created successfully. Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-300 via-sky-100 to-amber-200 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50 to-amber-100 p-8 shadow-xl backdrop-blur md:p-10">
          <div className="mb-8 text-center">
            <p className="muted-label uppercase tracking-[0.2em]">Super admin registration</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Create super admin</h2>
            <p className="mt-2 text-slate-600">Highest level access for trusted personnel</p>
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
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="admin@college.edu" className="field" />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="muted-label mb-2 block">Roll Number</label>
                <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} required placeholder="2022CS001" className="field" />
              </div>
              <div>
                <label className="muted-label mb-2 block">Batch</label>
                <input name="batch" value={formData.batch} onChange={handleChange} required placeholder="2026" className="field" />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="muted-label mb-2 block">CGPA</label>
                <input type="number" name="cgpa" value={formData.cgpa} onChange={handleChange} required min="0" max="10" step="0.01" placeholder="8.8" className="field" />
              </div>
              <div>
                <label className="muted-label mb-2 block">Branch</label>
                <input name="branch" value={formData.branch} onChange={handleChange} required placeholder="CSE" className="field" />
              </div>
            </div>

            <div>
              <label className="muted-label mb-2 block">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="Minimum 6 characters" className="field" />
            </div>

            <div>
              <label className="muted-label mb-2 block">Super Admin Secret Code</label>
              <input type="password" name="superSecretCode" value={formData.superSecretCode} onChange={handleChange} required placeholder="Enter the master secret code" className="field" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Creating super admin..." : "Create Super Admin"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminRegister;
