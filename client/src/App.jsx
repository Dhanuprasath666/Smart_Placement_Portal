import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Placements from './pages/Placement';
import AdminRegister from './pages/AdminRegister';
import CompanyVisits from './pages/CompanyVisits';
import AdminCompanyVisits from './pages/AdminCompanyVisits';
import AdminCompanyApplications from './pages/AdminCompanyApplications';
import DashboardOverview from './pages/DashboardOverview';
import Profile from './pages/Profile';
import PlacementDetail from './pages/PlacementDetail';
import CompanyVisitDetail from './pages/CompanyVisitDetail';
import SuperAdminUsers from './pages/SuperAdminUser';
import SuperAdminRegister from './pages/SuperAdminRegister';
import Notifications from './pages/Notifications';
import CompanyVisitApply from './pages/CompanyVisitApply';
import MentorDirectory from './pages/MentorDirectory';
import MentorProfile from './pages/MentorProfile';
import MyMentorRequests from './pages/MyMentorRequests';
import IncomingRequests from './pages/IncomingRequests';
import MentorSettings from './pages/MentorSettings';
import MentorChat from './pages/MentorChat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/superadmin-register" element={<SuperAdminRegister />} />
          <Route path="/admin-register" element={<AdminRegister />} />

          {/* Super Admin Routes */}
          <Route 
            path="/superadmin/admins" 
            element={
              <ProtectedRoute requiredRole="superadmin">
                <SuperAdminUsers />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/company-visits" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminCompanyVisits />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/company-applications" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminCompanyApplications />
              </ProtectedRoute>
            } 
          />

          {/* Student Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardOverview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/submit" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/my-placements" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/profile" 
            element={
              <ProtectedRoute requiredRole="student">
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/notifications" 
            element={
              <ProtectedRoute requiredRole="student">
                <Notifications />
              </ProtectedRoute>
            } 
          />

          {/* Public Pages */}
          <Route path="/placements" element={<Placements />} />
          <Route path="/placement/:id" element={<PlacementDetail />} />
          <Route path="/company-visits" element={<CompanyVisits />} />
          <Route path="/company-visit/:id" element={<CompanyVisitDetail />} />
          <Route 
            path="/company-visit/:id/apply" 
            element={
              <ProtectedRoute requiredRole="student">
                <CompanyVisitApply />
              </ProtectedRoute>
            } 
          />

          {/* Verified Alumni Referral & Mentorship Network */}
          <Route path="/mentors" element={<MentorDirectory />} />
          <Route path="/mentors/:id" element={<MentorProfile />} />
          <Route
            path="/dashboard/mentor-requests"
            element={
              <ProtectedRoute requiredRole="student">
                <MyMentorRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/incoming-requests"
            element={
              <ProtectedRoute requiredRole="student">
                <IncomingRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/mentor-settings"
            element={
              <ProtectedRoute requiredRole="student">
                <MentorSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:requestId"
            element={
              <ProtectedRoute requiredRole="student">
                <MentorChat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
