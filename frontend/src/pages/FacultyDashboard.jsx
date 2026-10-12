import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ComplaintBadge from '../components/ComplaintBadge';
import PriorityBadge from '../components/PriorityBadge';
import api from '../services/api';
import {
  CheckSquare,
  Clock,
  Flame,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    highPriority: 0,
    critical: 0,
    overdue: 0,
    resolved: 0,
  });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashRes, compRes] = await Promise.all([
          api.get('/faculty/dashboard'),
          api.get('/complaints?limit=8'),
        ]);

        if (dashRes.data.success) {
          setStats(dashRes.data.stats);
        }
        if (compRes.data.success) {
          setComplaints(compRes.data.complaints || []);
        }
      } catch (err) {
        console.error('Error fetching faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2.5 border border-indigo-400/20">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Faculty Resolution Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {user?.name || 'Faculty Member'}
          </h2>
          <p className="mt-1.5 text-xs text-slate-300">
            Department: <strong>{user?.departmentId?.name || 'Academic Dept'}</strong> &bull; Employee ID: <strong>{user?.collegeId}</strong>
          </p>
        </div>

        <Link
          to="/faculty/complaints"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-md transition-colors self-start md:self-center"
        >
          <CheckSquare className="w-4 h-4" />
          <span>View Assigned Queue</span>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <StatCard
          title="Assigned"
          count={stats.totalAssigned}
          icon={CheckSquare}
          color="indigo"
        />
        <StatCard
          title="Pending"
          count={stats.pending}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="In Progress"
          count={stats.inProgress}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="High Priority"
          count={stats.highPriority}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Critical Hazards"
          count={stats.critical}
          icon={Flame}
          color="red"
        />
        <StatCard
          title="Overdue (SLA)"
          count={stats.overdue}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Resolved"
          count={stats.resolved}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Assigned Complaints Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Assigned Complaints Queue</h3>
            <p className="text-xs text-slate-500">Student submitter identities remain masked by default</p>
          </div>
          <Link
            to="/faculty/complaints"
            className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            <span>Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading assigned complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No complaints currently assigned to you.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Issue & Facility</th>
                  <th className="py-3 px-4">Submitter Identity</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {c.ticketId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.facilityId?.name || 'Facility'} &bull; {c.location}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        {c.submitterInfo?.name || 'Anonymous Student'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <ComplaintBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-semibold transition-colors"
                      >
                        <span>Inspect & Update</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
