import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, getDashboardRoute } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const backRoute = user ? getDashboardRoute(user.role) : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">403 – Access Denied</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        You do not possess the required organizational role or explicit permissions to view this resource.
      </p>
      <Link
        to={backRoute}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors shadow-md shadow-primary-600/30"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
