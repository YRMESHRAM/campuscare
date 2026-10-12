import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Plus, CheckCircle2, Layers, UserCheck } from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/departments');
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/admin/departments', formData);
      if (res.data.success) {
        setCreateModal(false);
        setFormData({ name: '', code: '' });
        fetchDepartments();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create department.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Department Hierarchy</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure academic and administrative branches, HOD leadership, and assigned facility associations.
          </p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500">No departments configured yet.</div>
        ) : (
          departments.map((dept) => (
            <div key={dept._id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                    {dept.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>HOD: <strong className="text-slate-800">{dept.hodId?.name || 'Unassigned'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Associated Facilities: <strong className="text-slate-800">{dept.facilityIds?.length || 0}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Created: {new Date(dept.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {createModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-2">Add New Department</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Civil Engineering"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CIVIL"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase"
                />
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
                  {submitting ? 'Saving...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
