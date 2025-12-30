import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './components/layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ExplorePage } from './pages/ExplorePage';
import { TripDetailsPage } from './pages/TripDetailsPage';
import { UpcomingTripPage } from './pages/UpcomingTripPage';
import { LiveTripPage } from './pages/LiveTripPage';
import { SOSPage } from './pages/SOSPage';
import { TripReportPage } from './pages/TripReportPage';
import { CommunityFeedPage } from './pages/CommunityFeedPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { LoginPage, SignupPage, ForgotPasswordPage } from './pages/auth';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes - Short paths */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Public routes - Long paths (redirect to short paths) */}
          <Route path="/auth/login" element={<Navigate to="/login" replace />} />
          <Route path="/auth/signup" element={<Navigate to="/signup" replace />} />
          <Route path="/auth/forgot-password" element={<Navigate to="/forgot-password" replace />} />
          
          {/* Protected routes with layout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trips" element={<DashboardPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/trips/:id" element={<TripDetailsPage />} />
                        <Route path="/trips/:id/prepare" element={<UpcomingTripPage />} />
                        <Route path="/trips/:id/live" element={<LiveTripPage />} />
                        <Route path="/trips/:id/sos" element={<SOSPage />} />
                        <Route path="/trips/:id/report" element={<TripReportPage />} />
                        <Route path="/community" element={<CommunityFeedPage />} />
                        <Route path="/feed" element={<CommunityFeedPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/settings" element={<ProfilePage />} />
                      </Route>

                      {/* Admin routes with AdminLayout */}
                      <Route
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route path="/admin" element={<AdminDashboardPage />} />
                      </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
