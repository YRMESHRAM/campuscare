import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Layers, Plus, CheckCircle2, Building, UserCheck } from 'lucide-react';

export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    facilityType: 'Classroom',
    building: '',
    floorOrBlock: '',
    departmentIds: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const [facRes, deptRes] = await Promise.all([
        api.get('/admin/facilities'),
        api.get('/admin/departments'),
      ]);
      if (facRes.data.success) setFacilities(facRes.data.facilities || []);
      if (deptRes.data.success) setDepartments(deptRes.data.departments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/admin/facilities', formData);
      if (res.data.success) {
        setCreateModal(false);
        setFormData({
          name: '',
          facilityType: 'Classroom',
          building: '',
          floorOrBlock: '',
          departmentIds: [],
        });
        fetchFacilities();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to create facility.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campus Facilities Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage classrooms, computing laboratories, libraries, hostels, dining, and campus amenities.
          </p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Facility</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Loading facilities...</div>
        ) : facilities.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500">No facilities registered yet.</div>
        ) : (
          facilities.map((fac) => (
            <div key={fac._id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {fac.facilityType}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{fac.name}</h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Building: <strong className="text-slate-800">{fac.building}</strong></span>
                  </div>
                  {fac.floorOrBlock && (
                    <div className="text-[11px] text-slate-500 pl-5.5">
                      {fac.floorOrBlock}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Responsible Personnel:{' '}
                      <strong className="text-slate-800">
                        {fac.responsibleUserIds?.length || 0} assigned
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Associated Depts: {fac.departmentIds?.length || 0}</span>
                <span>ID: {fac._id.slice(-6)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {createModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-2">Register Campus Facility</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Quantum Lab"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Facility Type</label>
                  <select
                    value={formData.facilityType}
                    onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Library">Library</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Cafeteria">Cafeteria</option>
                    <option value="Washroom">Washroom</option>
                    <option value="Auditorium">Auditorium</option>
                    <option value="Sports Facility">Sports Facility</option>
                    <option value="Wi-Fi/Network">Wi-Fi/Network</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Building</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Block B"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Floor / Block / Room</label>
                <input
                  type="text"
                  placeholder="e.g. 1st Floor, Room 102"
                  value={formData.floorOrBlock}
                  onChange={(e) => setFormData({ ...formData, floorOrBlock: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
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
                  {submitting ? 'Saving...' : 'Register Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
