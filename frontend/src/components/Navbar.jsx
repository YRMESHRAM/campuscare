import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { Menu, ShieldCheck, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ onMenuToggle, title }) {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hod':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'coordinator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'facility_manager':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'faculty':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            {title || 'CampusCare'}
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Identity Protection Enabled</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {user && (
          <div className="flex items-center gap-2.5">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-lg transition-colors group text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                  {user.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(
                      user.role
                    )}`}
                  >
                    {user.role?.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {user.collegeId}
                  </span>
                </div>
              </div>
            </Link>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
