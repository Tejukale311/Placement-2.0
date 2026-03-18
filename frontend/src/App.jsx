import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import AdminLayout from './components/admin/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Aptitude from './pages/aptitude/Aptitude';

import Programming from './pages/programming/Programming';
import ProgrammingTopic from './pages/programming/ProgrammingTopic';
import ProgrammingDifficulty from './pages/programming/ProgrammingDifficulty';
import ProgrammingQuestions from './pages/programming/ProgrammingQuestions';
import ProgrammingSolve from './pages/programming/ProgrammingSolve';

import Companies from './pages/companies/Companies';
import MockTests from './pages/tests/MockTests';
import TakeTest from './pages/tests/TakeTest';
import Leaderboard from './pages/Leaderboard';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';
import DailyChallenge from './pages/DailyChallenge';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminCodingQuestions from './pages/admin/AdminCodingQuestions';
import AdminCompanyQuestions from './pages/admin/AdminCompanyQuestions';
import AdminMockTests from './pages/admin/AdminMockTests';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';

import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminRoutes from './pages/admin/AdminRoutes';
import AdminSettings from './pages/admin/AdminSettings';


// 🔥 Role-Based Redirect Component
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.isAdmin
    ? <Navigate to="/admin" replace />
    : <Navigate to="/dashboard" replace />;
};

// Protected Route (User Only)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // 🚫 Prevent admin from accessing user dashboard
  if (user.isAdmin) return <Navigate to="/admin" replace />;

  return children;
};

// Admin Route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // 🚫 Prevent user from accessing admin
  if (!user.isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>

            {/* Public Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* User Routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/aptitude" element={<Aptitude />} />
              <Route path="/aptitude/:category" element={<Aptitude />} />
              <Route path="/aptitude/:category/:topic" element={<Aptitude />} />


              <Route path="/programming" element={<Programming />} />
              <Route path="/programming/:section" element={<ProgrammingTopic />} />
              <Route path="/programming/:section/:topic" element={<ProgrammingDifficulty />} />
              <Route path="/programming/:section/:topic/:difficulty" element={<ProgrammingQuestions />} />
              <Route path="/programming/:section/:topic/:difficulty/:questionId" element={<ProgrammingSolve />} />


              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:name" element={<Companies />} />
              <Route path="/mock-tests" element={<MockTests />} />
              <Route path="/mock-tests/:id" element={<TakeTest />} />
              <Route path="/daily-challenge" element={<DailyChallenge />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}

            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin/*" element={<AdminRoutes />} />
            </Route>


            {/* 🔥 FIXED DEFAULT ROUTE */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Catch-all */}
            <Route path="*" element={<RoleBasedRedirect />} />

          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;