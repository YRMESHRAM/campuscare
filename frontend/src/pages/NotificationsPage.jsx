import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Bell, Check, ExternalLink, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingle = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notification Center</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates regarding complaint statuses, assignments, and resolution deadlines.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-primary-600 font-bold text-xs shadow-2xs transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">
            You have no notifications at this time.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                !notif.isRead ? 'bg-primary-50/30' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    !notif.isRead
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                    {notif.ticketId && (
                      <span className="font-mono font-bold text-primary-700 bg-primary-50 px-1.5 py-0.2 rounded border border-primary-200">
                        {notif.ticketId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.complaintId && (
                  <Link
                    to={`/complaints/${notif.complaintId}`}
                    onClick={() => handleMarkSingle(notif._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-semibold text-xs transition-colors"
                  >
                    <span>View Ticket</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkSingle(notif._id)}
                    title="Mark read"
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
