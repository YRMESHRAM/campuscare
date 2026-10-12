import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ComplaintBadge from '../components/ComplaintBadge';
import PriorityBadge from '../components/PriorityBadge';
import {
  Search,
  Download,
  Filter,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [facRes, catRes, deptRes] = await Promise.all([
          api.get('/admin/facilities'),
          api.get('/admin/categories'),
          api.get('/admin/departments'),
        ]);
        if (facRes.data.success) setFacilities(facRes.data.facilities || []);
        if (catRes.data.success) setCategories(catRes.data.categories || []);
        if (deptRes.data.success) setDepartments(deptRes.data.departments || []);
      } catch (e) {
        // quiet
      }
    };
    fetchMetadata();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 12,
      });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (selectedFacility) params.append('facilityId', selectedFacility);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedDepartment) params.append('departmentId', selectedDepartment);

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, priority, selectedFacility, selectedCategory, selectedDepartment]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Complaint Master Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized registry of all campus infrastructure grievances.
          </p>
        </div>

        <a
          href="/api/admin/reports/export"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </a>
      </div>

      {/* Filter Matrix */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Ticket ID (e.g. CC-2026-00001), problem title, or room location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
          />
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Escalated">Escalated</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Reopened">Reopened</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={selectedFacility}
            onChange={(e) => {
              setSelectedFacility(e.target.value);
              setPage(1);
            }}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden truncate"
          >
            <option value="">All Facilities</option>
            {facilities.map((fac) => (
              <option key={fac._id} value={fac._id}>
                {fac.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden truncate"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setPage(1);
            }}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden truncate"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">
            No complaints found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Title & Location</th>
                  <th className="py-3 px-4">Submitter Identity</th>
                  <th className="py-3 px-4">Facility & Dept</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Personnel</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {c.ticketId}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.location}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        {c.submitterInfo?.name || 'Anonymous Student'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800 truncate">{c.facilityId?.name || '-'}</p>
                      <p className="text-[11px] text-slate-400">{c.departmentId?.code || 'Central'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <ComplaintBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {c.assignedTo?.name || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-semibold transition-colors"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(page - 1) * 12 + 1} to {Math.min(page * 12, total)} of {total} tickets
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
