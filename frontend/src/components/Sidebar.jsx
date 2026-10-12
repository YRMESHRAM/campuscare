import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Users,
  Building2,
  Layers,
  Tag,
  BarChart3,
  ShieldAlert,
  Bell,
  User,
  LogOut,
  X,
  FileSpreadsheet,
  CheckSquare,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const role = user.role;

  // Student Links
  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/raise-complaint', label: 'Raise Complaint', icon: PlusCircle },
    { to: '/my-complaints', label: 'My Complaints', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  // Faculty Links
  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/complaints', label: 'Assigned Complaints', icon: CheckSquare },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Faculty Profile', icon: User },
  ];

  // Coordinator / HOD / Facility Manager Links
  const managementLinks = [
    {
      to:
        role === 'coordinator'
          ? '/coordinator/dashboard'
          : role === 'facility_manager'
          ? '/facility/dashboard'
          : '/hod/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    { to: '/complaint-management', label: 'Manage Complaints', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  // Admin Links
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'All Complaints', icon: FileText },
    { to: '/admin/analytics', label: 'Analytics & SLA', icon: BarChart3 },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/users/import', label: 'Bulk CSV Import', icon: FileSpreadsheet },
    { to: '/admin/departments', label: 'Departments', icon: Building2 },
    { to: '/admin/facilities', label: 'Facilities', icon: Layers },
    { to: '/admin/categories', label: 'Categories', icon: Tag },
    { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: ShieldAlert },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/profile', label: 'Admin Settings', icon: User },
  ];

  let currentLinks = studentLinks;
  if (role === 'admin') currentLinks = adminLinks;
  else if (role === 'faculty') currentLinks = facultyLinks;
  else if (['coordinator', 'facility_manager', 'hod'].includes(role)) currentLinks = managementLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-black shadow-md shadow-primary-900/40">
              CC
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">CampusCare</span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Facility Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User preview header */}
        <div className="p-4 mx-3 my-2 rounded-xl bg-slate-800/60 border border-slate-750">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-900/80 text-primary-300 border border-primary-700/50">
            {role?.replace('_', ' ')}
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {currentLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout footer */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
