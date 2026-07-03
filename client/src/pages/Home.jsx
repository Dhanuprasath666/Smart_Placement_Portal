import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-indigo-100 to-emerald-100 text-slate-900">
      <header className="border-b border-blue-200 bg-blue-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Placement Portal</h1>
            <p className="text-sm text-slate-500">Student and admin dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/placements" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Placements
            </Link>
            <Link to="/company-visits" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Company Visits
            </Link>
            {!user ? (
              <Link to="/login" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Login
              </Link>
            ) : (
              <Link
                to={user.role === "admin" ? "/admin" : user.role === "superadmin" ? "/superadmin/admins" : "/dashboard"}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-100 via-white to-emerald-100 p-8 shadow-sm backdrop-blur lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                Placement Portal
              </span>

              <h2 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                A simple place for placements, company visits, and student applications.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Students get alerts and one-click apply. Admins can view applications by company without re-entering student details.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {!user ? (
                  <>
                    <Link to="/register" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                      Register
                    </Link>
                    <Link to="/admin-register" className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                      Admin Sign Up
                    </Link>
                  </>
                ) : (
                  <Link
                    to={user.role === "admin" ? "/admin" : user.role === "superadmin" ? "/superadmin/admins" : "/dashboard"}
                    className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-sky-100 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Quick overview</h3>
              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-white/80 p-4 border border-blue-200">
                  <p className="text-sm text-slate-500">Students</p>
                  <p className="mt-1 text-lg font-semibold">Profile sync and apply flow</p>
                </div>
                <div className="rounded-xl bg-white/80 p-4 border border-blue-200">
                  <p className="text-sm text-slate-500">Admins</p>
                  <p className="mt-1 text-lg font-semibold">Company-wise applications</p>
                </div>
                <div className="rounded-xl bg-white/80 p-4 border border-blue-200">
                  <p className="text-sm text-slate-500">Super admins</p>
                  <p className="mt-1 text-lg font-semibold">User and company control</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-200 bg-sky-100 p-5">
              <h4 className="font-semibold text-slate-900">Verified placements</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                See approved placement records with package and company details.
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-100 p-5">
              <h4 className="font-semibold text-slate-900">Company visits</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Check eligibility, notifications, and application status in one place.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-100 p-5">
              <h4 className="font-semibold text-slate-900">One-click apply</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Eligible students can apply using stored profile data.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
