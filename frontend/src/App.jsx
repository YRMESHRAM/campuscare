import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import RaiseComplaintPage from './pages/RaiseComplaintPage';
import MyComplaintsPage from './pages/MyComplaintsPage';

// Faculty & Manager Pages
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyComplaintsPage from './pages/FacultyComplaintsPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUserImportPage from './pages/AdminUserImportPage';
import AdminDepartmentsPage from './pages/AdminDepartmentsPage';
import AdminFacilitiesPage from './pages/AdminFacilitiesPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';

// Shared Pages
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes inside DashboardLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Shared Protected Pages */}
              <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/raise-complaint" element={<RaiseComplaintPage />} />
                <Route path="/my-complaints" element={<MyComplaintsPage />} />
              </Route>

              {/* Faculty Routes */}
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={['faculty', 'coordinator', 'facility_manager', 'hod']}
                  />
                }
              >
                <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                <Route path="/faculty/complaints" element={<FacultyComplaintsPage />} />
                <Route path="/coordinator/dashboard" element={<FacultyDashboard />} />
                <Route path="/facility/dashboard" element={<FacultyDashboard />} />
                <Route path="/hod/dashboard" element={<FacultyDashboard />} />
                <Route path="/complaint-management" element={<AdminComplaintsPage />} />
              </Route>

              {/* Admin Exclusive Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/analytics" element={<AdminDashboard />} />
                <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/users/import" element={<AdminUserImportPage />} />
                <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
                <Route path="/admin/facilities" element={<AdminFacilitiesPage />} />
                <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
