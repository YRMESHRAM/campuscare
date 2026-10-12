import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getDashboardRoute } from '../context/AuthContext';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Building,
} from 'lucide-react';
import api from '../services/api';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter your college ID, registered email, or username and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(identifier.trim(), password);
      // Redirect strictly based on the authenticated backend role
      const targetRoute = getDashboardRoute(user.role);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Invalid credentials. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoId, demoPass = 'Password@123') => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setError('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;
    try {
      const res = await api.post('/auth/forgot-password', { identifier: forgotIdentifier });
      setForgotMessage(res.data.message || 'Password reset request logged with campus administrator.');
    } catch (e) {
      setForgotMessage('Please contact your campus administrator for immediate password recovery.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-primary-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/30">
          CC
        </div>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          CampusCare Portal Sign In
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Smart Facility Management & Student Privacy Resolution System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/90 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-700/80 backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                College ID / Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 2023CSE045 or admin@campuscare.edu"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Account Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModal(true);
                    setForgotMessage('');
                  }}
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-primary-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating Account...</span>
                </>
              ) : (
                <span>Sign In to CampusCare</span>
              )}
            </button>
          </form>

          {/* Public registration note */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Notice:</span> Public student and faculty registration is disabled. Accounts are provisioned centrally by college administration.
            </p>
          </div>

          {/* Quick Demo Credentials Selector */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Demo Role Fill (Password: Password@123)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillDemoAccount('2023CSE045')}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-left text-slate-300 hover:text-white transition-colors"
              >
                <span className="font-bold text-emerald-400 block">Student 1</span>
                2023CSE045
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('FAC-101')}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-left text-slate-300 hover:text-white transition-colors"
              >
                <span className="font-bold text-amber-400 block">Faculty</span>
                FAC-101 (CSE)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('FAC-CRD-01')}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-left text-slate-300 hover:text-white transition-colors"
              >
                <span className="font-bold text-blue-400 block">Coordinator</span>
                FAC-CRD-01
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('FAC-MGR-01')}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-left text-slate-300 hover:text-white transition-colors"
              >
                <span className="font-bold text-teal-400 block">Facility Mgr</span>
                FAC-MGR-01
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('FAC-HOD-01')}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-left text-slate-300 hover:text-white transition-colors"
              >
                <span className="font-bold text-indigo-400 block">HOD</span>
                FAC-HOD-01 (CSE)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('ADM-001')}
                className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-700 border border-slate-700 text-left text-slate-300 hover:text-white transition-colors"
              >
                <span className="font-bold text-purple-400 block">Administrator</span>
                ADM-001
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-2">Password Recovery</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered college ID or email to submit a reset request.
            </p>
            {forgotMessage ? (
              <div className="p-3 bg-primary-950/60 border border-primary-800 rounded-xl text-primary-300 text-xs mb-4">
                {forgotMessage}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="College ID or email"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs"
                >
                  Send Recovery Request
                </button>
              </form>
            )}
            <button
              onClick={() => setForgotModal(false)}
              className="mt-3 w-full py-2 text-xs text-slate-400 hover:text-white font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
