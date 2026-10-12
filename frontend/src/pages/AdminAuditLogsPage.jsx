import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, Clock, User, Eye, Terminal, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/audit-logs?page=${page}&limit=25`);
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getActionBadge = (action) => {
    if (action.includes('IDENTITY')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (action.includes('LOGIN')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (action.includes('USER')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Security Audit Trail</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit log of all privileged security events, including student identity access and administrative operations.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading audit events...</div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">No audit log records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Audit Metadata</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <p className="font-semibold text-slate-900">{log.performedBy?.name || 'System'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{log.performedBy?.collegeId || '-'}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.resourceType} {log.resourceId ? `(${log.resourceId})` : ''}
                    </td>
                    <td className="py-3 px-4 max-w-xs font-sans text-slate-600 truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 25 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Showing page {page}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded border disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={logs.length < 25}
                onClick={() => setPage((p) => p + 1)}
                className="p-1 rounded border disabled:opacity-40"
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
