import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ComplaintBadge from '../components/ComplaintBadge';
import PriorityBadge from '../components/PriorityBadge';
import ComplaintTimeline from '../components/ComplaintTimeline';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Building,
  Tag,
  User,
  MessageSquare,
  Paperclip,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Star,
  Send,
  Lock,
  Eye,
  ArrowLeft,
  Calendar,
  Layers,
} from 'lucide-react';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submitter identity reveal state (Admin / explicit permission)
  const [revealedIdentity, setRevealedIdentity] = useState(null);
  const [revealing, setRevealing] = useState(false);

  // Status transition state
  const [statusModal, setStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Assign faculty state
  const [assignModal, setAssignModal] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [commentVisibility, setCommentVisibility] = useState('student-visible');
  const [sendingComment, setSendingComment] = useState(false);

  // Student Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Student Reopen state
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setHistory(res.data.history || []);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  // Load faculty list if user has assignment permission
  useEffect(() => {
    const fetchFaculty = async () => {
      if (['admin', 'coordinator', 'facility_manager', 'hod'].includes(user?.role)) {
        try {
          const res = await api.get('/admin/users?role=faculty&limit=100');
          if (res.data.success) {
            setFacultyList(res.data.users || []);
          }
        } catch (e) {
          // ignore
        }
      }
    };
    fetchFaculty();
  }, [user]);

  // Handle Identity Reveal (Audit logged)
  const handleRevealIdentity = async () => {
    try {
      setRevealing(true);
      const res = await api.get(`/complaints/${id}/submitter-identity`);
      if (res.data.success) {
        setRevealedIdentity(res.data.submitter);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Access denied. You do not have identity reveal privileges.');
    } finally {
      setRevealing(false);
    }
  };

  // Handle Status Update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    try {
      setUpdatingStatus(true);
      const payload = {
        status: newStatus,
        remarks: statusRemarks,
      };
      if (newStatus === 'On Hold') payload.holdReason = statusRemarks;
      if (newStatus === 'Escalated') payload.escalationReason = statusRemarks;
      if (newStatus === 'Resolved') payload.resolutionNotes = statusRemarks;
      if (newStatus === 'Rejected') payload.rejectionReason = statusRemarks;

      const res = await api.patch(`/complaints/${id}/status`, payload);
      if (res.data.success) {
        setStatusModal(false);
        setStatusRemarks('');
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Assign Faculty
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacultyId) return;

    try {
      setAssigning(true);
      const res = await api.patch(`/complaints/${id}/assign`, {
        assignedToId: selectedFacultyId,
        remarks: assignRemarks,
      });
      if (res.data.success) {
        setAssignModal(false);
        setAssignRemarks('');
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setAssigning(false);
    }
  };

  // Handle Comment Submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSendingComment(true);
      const res = await api.post(`/complaints/${id}/comments`, {
        message: commentText.trim(),
        visibility: user?.role === 'student' ? 'student-visible' : commentVisibility,
      });
      if (res.data.success) {
        setCommentText('');
        setComments((prev) => [...prev, res.data.comment]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSendingComment(false);
    }
  };

  // Handle Student Feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      const res = await api.post(`/complaints/${id}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment,
      });
      if (res.data.success) {
        alert('Thank you for submitting feedback!');
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Handle Reopen
  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;

    try {
      setReopening(true);
      const res = await api.post(`/complaints/${id}/reopen`, {
        reason: reopenReason.trim(),
      });
      if (res.data.success) {
        alert('Complaint has been reopened for technician review.');
        setReopenReason('');
        fetchComplaintDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reopen complaint.');
    } finally {
      setReopening(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Loading complaint ticket details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="py-12 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Unable to load ticket</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'Complaint not found or unauthorized.'}</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const isStudentOwner =
    user?.role === 'student' &&
    complaint.submitterInfo &&
    !complaint.submitterInfo.isMasked;

  const canManageStatus = ['admin', 'faculty', 'coordinator', 'facility_manager', 'hod'].includes(
    user?.role
  );
  const canAssign = ['admin', 'coordinator', 'facility_manager', 'hod'].includes(user?.role);
  const canViewIdentityPermission =
    user?.permissions && user?.permissions.includes('complaints.viewSubmitterIdentity');

  const isOverdue =
    complaint.resolutionDeadline &&
    new Date(complaint.resolutionDeadline) < new Date() &&
    !['Resolved', 'Closed', 'Rejected'].includes(complaint.status);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={
            user?.role === 'student'
              ? '/my-complaints'
              : user?.role === 'faculty'
              ? '/faculty/complaints'
              : '/admin/complaints'
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Complaints
        </Link>

        <div className="flex items-center gap-2">
          {canManageStatus && (
            <button
              onClick={() => {
                setNewStatus(complaint.status);
                setStatusRemarks('');
                setStatusModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Update Status
            </button>
          )}

          {canAssign && (
            <button
              onClick={() => setAssignModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              Assign Faculty
            </button>
          )}
        </div>
      </div>

      {/* Main Ticket Card Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-black text-primary-700 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">
              {complaint.ticketId}
            </span>
            <ComplaintBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            {isOverdue && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> SLA OVERDUE
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Submitted on {new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
            {complaint.title}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </p>
        </div>

        {/* Submitter Privacy Box */}
        <div className="mt-6 p-4 rounded-xl border border-slate-200/80 bg-slate-50/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                  complaint.submitterInfo?.isMasked
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {complaint.submitterInfo?.isMasked ? <Lock className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Lodged by Submitter</p>
                <p className="text-sm font-bold text-slate-900">
                  {revealedIdentity
                    ? `${revealedIdentity.name} (${revealedIdentity.collegeId})`
                    : complaint.submitterInfo?.name || 'Anonymous Student'}
                </p>
                {complaint.submitterInfo?.isMasked && !revealedIdentity && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" /> Student identity masked for fair grievance handling
                  </p>
                )}
                {revealedIdentity && (
                  <p className="text-[11px] text-purple-700 font-semibold mt-0.5">
                    Email: {revealedIdentity.email} &bull; Dept: {revealedIdentity.department} &bull; Security Logged
                  </p>
                )}
              </div>
            </div>

            {/* Admin reveal button */}
            {canViewIdentityPermission && complaint.submitterInfo?.isMasked && !revealedIdentity && (
              <button
                onClick={handleRevealIdentity}
                disabled={revealing}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{revealing ? 'Authorizing...' : 'Reveal Submitter Identity (Audit Logged)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Location & Routing Details Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Campus Facility</span>
            <span className="font-semibold text-slate-800 mt-0.5 block truncate">
              {complaint.facilityId?.name || 'Facility'}
            </span>
            <span className="text-slate-500 text-[11px] block">{complaint.facilityId?.building}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Exact Location</span>
            <span className="font-semibold text-slate-800 mt-0.5 block truncate">
              {complaint.location}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Category & SLA</span>
            <span className="font-semibold text-slate-800 mt-0.5 block truncate">
              {complaint.categoryId?.name || 'Category'}
            </span>
            <span className="text-slate-500 text-[11px] block">
              Target: {complaint.categoryId?.resolutionTargetHours || 48} hrs
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Faculty</span>
            <span className="font-semibold text-slate-800 mt-0.5 block truncate">
              {complaint.assignedTo?.name || 'Unassigned'}
            </span>
            <span className="text-slate-500 text-[11px] block">
              {complaint.assignedTo ? complaint.assignedTo.email : 'Pending assignment'}
            </span>
          </div>
        </div>

        {/* Attachments Section */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>Evidence Attachments ({complaint.attachments.length})</span>
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {complaint.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary-400 text-xs font-medium text-slate-700 hover:text-primary-700 flex items-center gap-2 transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-xs">{att.filename}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resolution Notes Banner */}
      {complaint.resolutionNotes && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Official Resolution Remarks</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed pl-6">
            "{complaint.resolutionNotes}"
          </p>
        </div>
      )}

      {/* Student Feedback & Reopen Controls */}
      {user?.role === 'student' && ['Resolved', 'Closed'].includes(complaint.status) && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Student Satisfaction Feedback</h3>
          {complaint.feedback?.rating ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                {[...Array(complaint.feedback.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
                <span className="text-xs text-slate-700 font-bold ml-2">
                  {complaint.feedback.rating} / 5 Stars
                </span>
              </div>
              {complaint.feedback.comment && (
                <p className="text-xs text-slate-600 mt-1">"{complaint.feedback.comment}"</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Your Rating:</span>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={2}
                placeholder="How was the resolution quality? Any remarks..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Satisfaction Rating'}
              </button>
            </form>
          )}

          {/* Reopen Request */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-1">Issue Still Not Fixed?</h4>
            <p className="text-xs text-slate-500 mb-2">
              If the reported issue recurs or was not properly addressed, you can request reopening.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Explain why issue needs reopening..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleReopenSubmit}
                disabled={reopening || !reopenReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50"
              >
                {reopening ? 'Reopening...' : 'Request Reopen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section: Progress Timeline & Discussion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-600" />
            <span>Progress Timeline & Audit</span>
          </h3>
          <ComplaintTimeline history={history} />
        </div>

        {/* Discussion / Progress Updates */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary-600" />
            <span>Discussion & Progress Notes</span>
          </h3>

          {/* Comments List */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-96 pr-1">
            {comments.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                No discussion notes recorded yet.
              </p>
            ) : (
              comments.map((cm) => (
                <div
                  key={cm._id}
                  className={`p-3 rounded-xl border text-xs ${
                    cm.visibility === 'internal'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-slate-50 border-slate-200/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">
                      {cm.authorId?.name || 'Staff Member'} ({cm.authorId?.role})
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      {cm.visibility === 'internal' && (
                        <span className="bg-amber-200 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          STAFF INTERNAL
                        </span>
                      )}
                      <span>
                        {new Date(cm.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed mt-1">{cm.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mt-4 pt-3 border-t border-slate-100">
            {user?.role !== 'student' && (
              <div className="flex items-center gap-3 mb-2 text-xs">
                <label className="flex items-center gap-1 text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={commentVisibility === 'student-visible'}
                    onChange={() => setCommentVisibility('student-visible')}
                    className="text-primary-600"
                  />
                  <span>Student Visible</span>
                </label>
                <label className="flex items-center gap-1 text-amber-800 font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={commentVisibility === 'internal'}
                    onChange={() => setCommentVisibility('internal')}
                    className="text-amber-600"
                  />
                  <span>Internal Staff Only</span>
                </label>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a progress update or inquiry..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={sendingComment || !commentText.trim()}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs disabled:opacity-50 flex items-center gap-1 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-1">Update Complaint Status</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select a new lifecycle status and provide required reason notes.
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold (requires reason)</option>
                  <option value="Escalated">Escalated (requires reason)</option>
                  <option value="Resolved">Resolved (requires resolution notes)</option>
                  <option value="Closed">Closed</option>
                  <option value="Rejected">Rejected (requires explanation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Remarks / Explanations <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Detail what action was taken, hold reason, or technician resolution..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs"
                >
                  {updatingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-1">Assign Complaint to Faculty</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select an authorized faculty or facility officer to handle this ticket.
            </p>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Member</label>
                <select
                  required
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden"
                >
                  <option value="">Select faculty...</option>
                  {facultyList.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.collegeId}) - {f.departmentId?.name || 'Faculty'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Note</label>
                <input
                  type="text"
                  placeholder="e.g. Please inspect HDMI wiring today"
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
