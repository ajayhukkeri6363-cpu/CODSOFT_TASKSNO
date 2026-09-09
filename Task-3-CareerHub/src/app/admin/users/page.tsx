'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { formatDate, timeAgo } from '@/lib/utils';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  Briefcase,
  Building2,
  Mail,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { success, error } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (roleFilter !== 'ALL') params.set('role', roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // Handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          isActive: !currentActive,
        }),
      });

      if (res.ok) {
        success(`User status updated to ${!currentActive ? 'Active' : 'Disabled'}`);
        await fetchUsers();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to update user');
      }
    } catch {
      error('Network error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Account Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage candidates, recruiters, and platform administrators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'CANDIDATE', 'RECRUITER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                roleFilter === r
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r.charAt(0) + r.slice(1).toLowerCase() + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-3">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:bg-slate-50"
          />
        </div>
        <Button variant="secondary" size="sm" onClick={fetchUsers}>
          Filter
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="h-64 animate-pulse bg-slate-50 rounded-2xl" />
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Organization / Details</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Joined</th>
                <th className="pb-3 px-3 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-100 text-rose-800'
                          : u.role === 'RECRUITER'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-slate-600">
                    {u.recruiterProfile?.company?.name ? (
                      <span className="font-semibold text-slate-800">
                        {u.recruiterProfile.company.name}
                      </span>
                    ) : (
                      <span>{u._count?.applications || 0} applications submitted</span>
                    )}
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{u.isActive ? 'Active' : 'Disabled'}</span>
                    </span>
                  </td>
                  <td className="py-4 px-3 text-slate-400">{formatDate(u.createdAt)}</td>
                  <td className="py-4 px-3 text-right">
                    <button
                      onClick={() => handleToggleActive(u.id, u.isActive)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                        u.isActive
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.isActive ? 'Disable Account' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
