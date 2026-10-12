import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout({ title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/student/dashboard')) return 'Student Portal';
    if (path.includes('/raise-complaint')) return 'Submit Complaint';
    if (path.includes('/my-complaints')) return 'My Complaints';
    if (path.includes('/faculty/dashboard')) return 'Faculty Workspace';
    if (path.includes('/faculty/complaints')) return 'Assigned Queue';
    if (path.includes('/admin/dashboard')) return 'Campus Administration';
    if (path.includes('/admin/analytics')) return 'Analytics & Reports';
    if (path.includes('/admin/users')) return 'User Management';
    if (path.includes('/admin/complaints')) return 'Complaint Master Table';
    if (path.includes('/admin/departments')) return 'Department Hierarchy';
    if (path.includes('/admin/facilities')) return 'Campus Facilities';
    if (path.includes('/admin/categories')) return 'Categories & SLAs';
    if (path.includes('/admin/audit-logs')) return 'Security Audit Trail';
    if (path.includes('/profile')) return 'Account Profile';
    if (path.includes('/notifications')) return 'Notification Center';
    return title || 'CampusCare';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle()} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
