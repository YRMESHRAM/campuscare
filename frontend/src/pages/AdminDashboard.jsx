import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import api from '../services/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Archive,
  BarChart3,
  Users,
  Download,
  Building,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Computing campus facility analytics...</p>
      </div>
    );
  }

  const {
    summary,
    priorityCounts = [],
    facilityCounts = [],
    categoryCounts = [],
    facultyWorkload = [],
    complaintsTimeline = [],
  } = data;

  const statusPieData = [
    { name: 'New/Submitted', value: summary.newComplaints },
    { name: 'Under Review', value: summary.underReview },
    { name: 'In Progress', value: summary.inProgress },
    { name: 'Escalated', value: summary.escalated },
    { name: 'Resolved', value: summary.resolved },
    { name: 'Closed', value: summary.closed },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Infrastructure & Grievance Control Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated institutional telemetry, SLA target compliance, and personnel workloads.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="/api/admin/reports/export"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <span>Master Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary Summary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard title="Total Tickets" count={summary.total} icon={FileText} color="slate" />
        <StatCard title="New" count={summary.newComplaints} icon={Clock} color="blue" />
        <StatCard title="In Progress" count={summary.inProgress} icon={Clock} color="amber" />
        <StatCard title="Escalated" count={summary.escalated} icon={Flame} color="red" />
        <StatCard title="Resolved" count={summary.resolved} icon={CheckCircle2} color="emerald" />
        <StatCard title="Closed" count={summary.closed} icon={Archive} color="slate" />
        <StatCard
          title="Overdue (SLA)"
          count={summary.overdue}
          subtitle={`${summary.overdueRate}% rate`}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Avg SLA Time"
          count={`${summary.avgResolutionHours}h`}
          subtitle={`${summary.resolutionRate}% resolved`}
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Timeline Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Complaints Lodged Over Time</h3>
          <p className="text-xs text-slate-500 mb-4">Volume trend across campus facilities</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complaintsTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Lodged Tickets"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Status Lifecycle Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Real-time status breakdown</p>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Facility */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Top Facilities by Complaint Volume</h3>
          <p className="text-xs text-slate-500 mb-4">Incidents reported per campus location</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" name="Tickets" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Category */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">Complaints by Issue Category</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown by technical domain</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" name="Tickets" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Faculty Workload and Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Faculty & Personnel Workload Distribution</h3>
            <p className="text-xs text-slate-500">Assignment loads and resolution efficiency</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Total Assigned</th>
                <th className="py-3 px-4 text-center">Active Queue</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4 text-right">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facultyWorkload.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No faculty assignment data recorded yet.
                  </td>
                </tr>
              ) : (
                facultyWorkload.map((fw, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{fw.facultyName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{fw.facultyEmail}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {fw.totalAssigned}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-amber-600">
                      {fw.activeCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                      {fw.resolvedCount}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-primary-600">
                        {Math.round(fw.resolutionRate)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
