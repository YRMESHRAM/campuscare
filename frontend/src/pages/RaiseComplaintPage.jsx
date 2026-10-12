import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  PlusCircle,
  Upload,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building,
  Tag,
  MapPin,
  Flame,
  FileText,
  X,
} from 'lucide-react';

export default function RaiseComplaintPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    facilityId: '',
    location: '',
    categoryId: '',
    priority: 'Medium',
  });

  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState(null);
  const [selectedFacilityInfo, setSelectedFacilityInfo] = useState(null);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingInitial(true);
        const [facRes, catRes] = await Promise.all([
          api.get('/admin/facilities'),
          api.get('/admin/categories'),
        ]);
        if (facRes.data.success) setFacilities(facRes.data.facilities || []);
        if (catRes.data.success) setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Error fetching facilities/categories:', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchData();
  }, []);

  const handleFacilityChange = (e) => {
    const facId = e.target.value;
    setFormData((prev) => ({ ...prev, facilityId: facId }));
    const found = facilities.find((f) => f._id === facId);
    setSelectedFacilityInfo(found || null);
    if (found && found.floorOrBlock && !formData.location) {
      setFormData((prev) => ({ ...prev, location: found.floorOrBlock }));
    }
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setFormData((prev) => ({ ...prev, categoryId: catId }));
    const found = categories.find((c) => c._id === catId);
    setSelectedCategoryInfo(found || null);
    if (found && found.defaultPriority) {
      setFormData((prev) => ({ ...prev, priority: found.defaultPriority }));
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    // Limit to 5 files
    if (files.length + newFiles.length > 5) {
      setError('You can attach a maximum of 5 files.');
      return;
    }
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a complaint title.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a detailed description of the problem.');
      return;
    }
    if (!formData.facilityId) {
      setError('Please select a campus facility.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Please specify the exact room, floor, or location.');
      return;
    }
    if (!formData.categoryId) {
      setError('Please select an issue category.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('facilityId', formData.facilityId);
      data.append('location', formData.location.trim());
      data.append('categoryId', formData.categoryId);
      data.append('priority', formData.priority);

      files.forEach((file) => {
        data.append('attachments', file);
      });

      const res = await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSuccessTicket(res.data.complaint);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successTicket) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Complaint Submitted Successfully!</h2>
          <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto">
            Your complaint has been registered in the system with full identity protection.
          </p>

          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-center">
            <p className="text-xs text-slate-400 uppercase font-sans font-semibold">Unique Ticket ID</p>
            <p className="text-2xl font-black text-primary-700 mt-1">{successTicket.ticketId}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/complaints/${successTicket._id}`)}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Track Ticket Progress
            </button>
            <button
              onClick={() => {
                setSuccessTicket(null);
                setFormData({
                  title: '',
                  description: '',
                  facilityId: '',
                  location: '',
                  categoryId: '',
                  priority: 'Medium',
                });
                setFiles([]);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              Lodge Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Raise a Campus Complaint</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit infrastructure or facility issues for immediate resolution by campus staff.
        </p>
      </div>

      {/* Privacy Notice Card */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <p className="font-bold">Student Identity Protection Active</p>
          <p className="text-emerald-700 mt-0.5">
            Your name, email, and enrollment number are strictly hidden from ordinary faculty members and coordinators. They will see your ticket as submitted by <strong className="font-semibold">"Anonymous Student"</strong>.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Complaint Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={180}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Projector power fault in Classroom C-204"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
          />
        </div>

        {/* Facility & Specific Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Campus Facility <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={formData.facilityId}
                onChange={handleFacilityChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden bg-white"
              >
                <option value="">Select facility...</option>
                {facilities.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name} ({fac.facilityType} - {fac.building})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Specific Location / Room <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. 2nd Floor, Room 204, Desk Row 3"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Issue Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={handleCategoryChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden bg-white"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name} (SLA: {cat.resolutionTargetHours} hrs)
                </option>
              ))}
            </select>
            {selectedCategoryInfo && (
              <p className="text-[11px] text-slate-500 mt-1">
                Target Resolution Target: <strong>{selectedCategoryInfo.resolutionTargetHours} hours</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Priority Level <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden bg-white"
            >
              <option value="Low">Low - Minor issue, low academic disruption</option>
              <option value="Medium">Medium - Routine attention required</option>
              <option value="High">High - Significant disruption to campus activities</option>
              <option value="Critical">Critical - Serious facility or safety hazard</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Detailed Problem Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what is broken, error messages, when it occurred, and any safety hazards..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden leading-relaxed"
          />
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Photo / Document Evidence (Optional, max 5 files)
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50/50 transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs text-slate-600 font-medium">Click to select photos or documents</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP, PDF up to 5MB each</p>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-2.5 inline-block px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
            >
              Choose Files
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="truncate text-slate-700 max-w-xs">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting Complaint...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Submit Complaint Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
