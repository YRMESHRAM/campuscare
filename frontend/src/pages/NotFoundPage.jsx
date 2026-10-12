import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-slate-300">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The requested address does not exist or has been moved in the CampusCare directory.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors shadow-md"
      >
        <Home className="w-4 h-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
}
