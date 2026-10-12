import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Tag, Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultPriority: 'Medium',
    resolutionTargetHours: 24,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/admin/categories', formData);
      if (res.data.success) {
        setCreateModal(false);
        setFormData({
          name: '',
          description: '',
          defaultPriority: 'Medium',
          resolutionTargetHours: 24,
        });
        fetchCategories();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Complaint Categories & SLAs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure technical problem classification, default priority, and maximum resolution deadlines.
          </p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500">No categories configured yet.</div>
        ) : (
          categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <PriorityBadge priority={cat.defaultPriority} />
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>

                <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary-600" />
                    <span>Resolution SLA:</span>
                  </span>
                  <span className="font-bold text-slate-800">
                    {cat.resolutionTargetHours} Hours
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Department: {cat.defaultDepartmentId?.name || 'Central Facility'}
              </div>
            </div>
          ))
        )}
      </div>

      {createModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-2">Create Issue Category</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elevators & Lifts"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Scope of complaints under this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Default Priority</label>
                  <select
                    value={formData.defaultPriority}
                    onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Hours (SLA)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.resolutionTargetHours}
                    onChange={(e) =>
                      setFormData({ ...formData, resolutionTargetHours: parseInt(e.target.value, 10) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl bg-primary-600 text-white font-bold text-xs"
                >
                  {submitting ? 'Saving...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
