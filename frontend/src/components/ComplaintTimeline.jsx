import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function ComplaintTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-400">
        No progress events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((item, index) => {
        const isLatest = index === 0;
        return (
          <div key={item._id || index} className="relative group">
            {/* Timeline dot */}
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isLatest
                  ? 'bg-primary-600 border-white ring-4 ring-primary-100 text-white'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}
            >
              {isLatest ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              )}
            </div>

            <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200/60">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs mb-1">
                <span className="font-semibold text-slate-900">
                  {item.action?.replace(/_/g, ' ') || 'Status Update'}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {item.previousStatus && item.newStatus && item.previousStatus !== item.newStatus && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 my-1">
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded">{item.previousStatus}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="bg-primary-100 text-primary-800 font-medium px-1.5 py-0.5 rounded">
                    {item.newStatus}
                  </span>
                </div>
              )}

              {item.remarks && (
                <p className="text-xs text-slate-700 mt-1.5 bg-white p-2 rounded border border-slate-100">
                  "{item.remarks}"
                </p>
              )}

              {item.performedBy && (
                <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>
                    Updated by: <strong className="text-slate-700">{item.performedBy.name}</strong>{' '}
                    ({item.performedBy.role})
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
