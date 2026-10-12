import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, getDashboardRoute } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building,
  ArrowRight,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-primary-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black shadow-lg shadow-primary-500/30">
            CC
          </div>
          <div>
            <span className="font-extrabold text-white text-lg tracking-tight">CampusCare</span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-950 text-primary-300 border border-primary-800">
              Smart Facility System
            </span>
          </div>
        </div>

        <div>
          {user ? (
            <Link
              to={getDashboardRoute(user.role)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-xs transition-colors shadow-md shadow-primary-600/30"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-xs transition-colors shadow-md shadow-primary-600/30"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-6 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-primary-300 font-medium mx-auto mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Identity-Protected Student Complaint Management</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Next-Generation Campus Facility & Problem Resolution Platform
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Centralized infrastructure management for classrooms, laboratories, hostels, networks,
          and utilities with strict student anonymity, SLA tracking, and multi-tier department
          escalations.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm shadow-xl shadow-primary-600/40 transition-all hover:scale-[1.02]"
          >
            <span>Launch CampusCare Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Student Identity Masking</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Ordinary faculty and coordinators handle complaints marked as "Anonymous Student". Submitter details can only be unlocked with explicit administrative permission and audit logging.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">SLA & Status Timelines</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Every ticket follows an atomic lifecycle (Submitted, Under Review, Assigned, In Progress, Resolved) with automatic target SLA calculations and chronological action history.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Hierarchical RBAC Scope</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Strict database query scoping for Students, Faculty, Department Coordinators, Facility Managers, HODs, and Central Administrators. Zero horizontal privilege leakage.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        CampusCare – Smart Campus Facility Management System &copy; {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
