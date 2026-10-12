import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  Key,
  Building,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [departments, setDepartments] = useState([]);
  const [facilities, setFacilities] = useState([]);

  // Create User Modal
  const [createModal, setCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    collegeId: '',
    password: '',
    role: 'student',
    departmentId: '',
    academicYear: '',
    permissions: [],
  });
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (role) params.append('role', role);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [deptRes, facRes] = await Promise.all([
          api.get('/admin/departments'),
          api.get('/admin/facilities'),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.departments || []);
        if (facRes.data.success) setFacilities(facRes.data.facilities || []);
      } catch (e) {
        // quiet
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleActive = async (userObj) => {
    try {
      await api.patch(`/admin/users/${userObj._id}`, { isActive: !userObj.isActive });
      fetchUsers();
    } catch (e) {
      alert('Failed to update account status.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      setCreating(true);
      const payload = { ...newUserData };
      if (!payload.departmentId) delete payload.departmentId;

      const res = await api.post('/admin/users', payload);
      if (res.data.success) {
        setCreateModal(false);
        setNewUserData({
          name: '',
          email: '',
          collegeId: '',
          password: '',
          role: 'student',
          departmentId: '',
          academicYear: '',
          permissions: [],
        });
        fetchUsers();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setCreating(false);
    }
  };

  const handlePermissionToggle = (perm) => {
    setNewUserData((prev) => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists ? prev.permissions.filter((p) => p !== perm) : [...prev.permissions, perm],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campus User Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Provision, authorize, and audit student and faculty accounts. Public registration is disabled.
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or College/Employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
          />
        </form>

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-hidden"
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="coordinator">Department Coordinator</option>
          <option value="facility_manager">Facility Manager</option>
          <option value="hod">Head of Department (HOD)</option>
          <option value="admin">Campus Administrator</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">No user accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">College/Emp ID</th>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Explicit Permissions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {u.collegeId}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.departmentId?.name || (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.permissions && u.permissions.length > 0 ? (
                        <span className="text-[10px] bg-purple-50 text-purple-700 font-mono px-1.5 py-0.5 rounded border border-purple-200">
                          {u.permissions.length} granted
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, total)} of {total} accounts
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

      {/* Provision User Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl my-8">
            <h3 className="font-bold text-base text-slate-900 mb-1">Provision New Campus Account</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter user credentials and assign department permissions.
            </p>

            {modalError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="e.g. Dr. Alok Nath"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College/Emp ID</label>
                  <input
                    type="text"
                    required
                    value={newUserData.collegeId}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, collegeId: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. FAC-204 or 2024CSE099"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="email@campuscare.edu"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="Secure password"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="coordinator">Department Coordinator</option>
                    <option value="facility_manager">Facility Manager</option>
                    <option value="hod">Head of Department (HOD)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newUserData.departmentId}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, departmentId: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="">Select department...</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Explicit Permissions Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Explicit Permissions
                </label>
                <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserData.permissions.includes('complaints.viewSubmitterIdentity')}
                      onChange={() =>
                        handlePermissionToggle('complaints.viewSubmitterIdentity')
                      }
                    />
                    <span>complaints.viewSubmitterIdentity (Reveal student identity)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserData.permissions.includes('complaints.assign')}
                      onChange={() => handlePermissionToggle('complaints.assign')}
                    />
                    <span>complaints.assign (Assign tickets to faculty)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserData.permissions.includes('reports.export')}
                      onChange={() => handlePermissionToggle('reports.export')}
                    />
                    <span>reports.export (Export CSV records)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs"
                >
                  {creating ? 'Creating...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
