'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  LayoutGrid,
  Users,
  MapPin,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { getTableStatusBadge } from '@/lib/utils';

const LOCATIONS = [
  { id: 'MAIN_HALL', label: 'Main Dining Hall' },
  { id: 'WINDOW_SIDE', label: 'Window View' },
  { id: 'PATIO', label: 'Garden Patio' },
  { id: 'VIP_LOUNGE', label: 'Private VIP Lounge' },
  { id: 'ROOFTOP', label: 'Rooftop Terrace' },
];

export default function AdminTableConfiguration() {
  const { success, error } = useToast();
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<any>(null);

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '4',
    location: 'MAIN_HALL',
    status: 'AVAILABLE',
  });

  const fetchTables = () => {
    setIsLoading(true);
    fetch('/api/tables')
      .then((r) => (r.ok ? r.json() : { tables: [] }))
      .then((data) => {
        setTables(data.tables);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedTable(null);
    setFormData({
      tableNumber: `Table ${tables.length + 1}`,
      capacity: '4',
      location: 'MAIN_HALL',
      status: 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (table: any) => {
    setIsEditing(true);
    setSelectedTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity.toString(),
      location: table.location,
      status: table.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tableNumber || !formData.capacity) {
      error('Table number and capacity are required');
      return;
    }

    try {
      const url = isEditing ? `/api/tables/${selectedTable.id}` : '/api/tables';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        success(data.message || 'Table saved!');
        setIsModalOpen(false);
        fetchTables();
      } else {
        error(data.error || 'Failed to save table');
      }
    } catch {
      error('Error saving table configuration');
    }
  };

  const handleDelete = async () => {
    if (!tableToDelete) return;
    try {
      const res = await fetch(`/api/tables/${tableToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        success('Table deleted successfully');
        setIsDeleteDialogOpen(false);
        setTableToDelete(null);
        fetchTables();
      } else {
        error(data.error || 'Failed to delete table');
      }
    } catch {
      error('Error deleting table');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Dining Room Floor Planning
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Table Architecture & Capacities
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dining tables, seat sizes, and floor zones.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Table Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map((table) => {
          const badge = getTableStatusBadge(table.status);
          return (
            <div
              key={table.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">{table.tableNumber}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Capacity: <strong className="text-slate-900">{table.capacity} Guests</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Zone: <strong className="text-slate-900">{table.location.replace('_', ' ')}</strong></span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(table)}
                  className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                  title="Edit Table"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setTableToDelete(table);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Table"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Table Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Table Settings' : 'Configure New Dining Table'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Table Number / Label *</label>
            <input
              type="text"
              required
              placeholder="e.g. Table 11 or VIP Booth 3"
              value={formData.tableNumber}
              onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Guest Capacity (Seats) *</label>
            <input
              type="number"
              min="1"
              max="24"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Floor Location Zone</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Initial State</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="OCCUPIED">OCCUPIED</option>
              <option value="RESERVED">RESERVED</option>
              <option value="CLEANING">CLEANING</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Create Table'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Dining Table"
        message={`Are you sure you want to delete "${tableToDelete?.tableNumber}"?`}
        confirmLabel="Delete Table"
      />
    </div>
  );
}
