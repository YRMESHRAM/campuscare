import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, ShieldCheck, Key, Building, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        setMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account Profile & Security</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          View your institutional identity details and update account security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="md:col-span-1 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 mb-3">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="font-bold text-base text-slate-900">{user.name}</h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{user.collegeId}</p>

          <span className="mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 text-primary-700 border border-primary-200">
            {user.role.replace('_', ' ')}
          </span>

          <div className="mt-6 w-full pt-5 border-t border-slate-100 text-left space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
              <span className="font-semibold text-slate-800 break-all">{user.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
              <span className="font-semibold text-slate-800">
                {user.departmentId?.name || 'Central Administration'}
              </span>
            </div>
            {user.academicYear && (
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Year</span>
                <span className="font-semibold text-slate-800">{user.academicYear}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Institutional Account
              </span>
            </div>
          </div>
        </div>

        {/* Password Security Form */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Key className="w-5 h-5 text-primary-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Update Password</h3>
              <p className="text-xs text-slate-400">Keep your account secure with a strong password</p>
            </div>
          </div>

          {message && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
