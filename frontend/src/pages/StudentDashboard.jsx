import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ComplaintBadge from '../components/ComplaintBadge';
import PriorityBadge from '../components/PriorityBadge';
import api from '../services/api';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  useEffect(() => {
    const fetchStudentComplaints = async () => {
      try {
        setLoading(true);
        const res = await api.get('/complaints?limit=20');
        if (res.data.success) {
          const list = res.data.complaints || [];
          setComplaints(list);

          // Calculate summary counts
          const newStats = {
            total: list.length,
            submitted: list.filter((c) => c.status === 'Submitted').length,
            underReview: list.filter((c) => c.status === 'Under Review').length,
            inProgress: list.filter((c) => c.status === 'In Progress').length,
            resolved: list.filter((c) => c.status === 'Resolved').length,
            closed: list.filter((c) => c.status === 'Closed').length,
          };
          setStats(newStats);
        }
      } catch (err) {
        console.error('Error fetching student complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentComplaints();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-300 mb-3 border border-white/10">
            <ShieldCheck className="w-4 h-4" />
            <span>Student Privacy Protected</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-primary-100 leading-relaxed">
            Report classroom, lab, library, hostel, Wi-Fi, or equipment issues. Your personal identity remains confidential to complaint handlers.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/raise-complaint"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-900 hover:bg-primary-50 font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 text-primary-700" />
              <span>Raise a New Complaint</span>
            </Link>
            <Link
              to="/my-complaints"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-700/60 hover:bg-primary-700 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Track All ({stats.total})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Lodged"
          count={stats.total}
          icon={FileText}
          color="slate"
        />
        <StatCard
          title="Submitted"
          count={stats.submitted}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Under Review"
          count={stats.underReview}
          icon={AlertCircle}
          color="purple"
        />
        <StatCard
          title="In Progress"
          count={stats.inProgress}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Resolved"
          count={stats.resolved}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Closed"
          count={stats.closed}
          icon={Archive}
          color="slate"
        />
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Recent Complaints</h3>
            <p className="text-xs text-slate-500">Track real-time progress and technician status</p>
          </div>
          <Link
            to="/my-complaints"
            className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your tickets...</div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm text-slate-800">No complaints lodged yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Everything in campus functioning well? If you spot a broken projector, tap leak, or Wi-Fi glitch, report it here.
            </p>
            <Link
              to="/raise-complaint"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-semibold text-xs shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Raise First Complaint</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Title & Facility</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.slice(0, 6).map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {c.ticketId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900 line-clamp-1">{c.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {c.facilityId?.name || 'Campus Facility'} &bull; {c.location}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.categoryId?.name || 'General'}
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
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 font-semibold transition-colors"
                      >
                        <span>Details</span>
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
