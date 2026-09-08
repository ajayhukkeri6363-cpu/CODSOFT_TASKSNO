'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  DollarSign,
  Clock,
  AlertCircle,
  Receipt,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { FeeWithDetails, StudentWithDetails } from '@/lib/types';
import { formatCurrency, formatDate, getFeeStatusColor } from '@/lib/utils';

export default function FeesManagementPage() {
  const { toast } = useToast();
  const [fees, setFees] = useState<FeeWithDetails[]>([]);
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    amount: 1500,
    dueDate: '',
    remarks: '',
  });

  const [paymentData, setPaymentData] = useState({
    paidAmount: 0,
    paymentMethod: 'ONLINE',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: 'Payment settled via student portal',
  });

  const fetchFees = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await fetch(`/api/fees?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setFees(data.fees);
    } catch (err) {
      toast.error('Failed to load fee invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (res.ok) setStudents(data.students);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFees();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedStatus]);

  const handleOpenAdd = () => {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    setFormData({
      studentId: students[0]?.id || '',
      title: 'Term 2 Tuition & Academic Fee',
      amount: 1500,
      dueDate: nextMonth.toISOString().split('T')[0],
      remarks: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenPay = (fee: FeeWithDetails) => {
    setSelectedFee(fee);
    setPaymentData({
      paidAmount: fee.amount - fee.paidAmount,
      paymentMethod: 'ONLINE',
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: 'Payment received in full',
    });
    setIsPayModalOpen(true);
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Fee invoice generated successfully!');
        setIsAddModalOpen(false);
        fetchFees();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to generate invoice');
      }
    } catch (err) {
      toast.error('Failed to create fee invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    setIsSubmitting(true);

    const totalPaidSoFar = (selectedFee.paidAmount || 0) + Number(paymentData.paidAmount);

    try {
      const res = await fetch(`/api/fees/${selectedFee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidAmount: totalPaidSoFar,
          paymentMethod: paymentData.paymentMethod,
          paymentDate: paymentData.paymentDate,
          remarks: paymentData.remarks,
        }),
      });

      if (res.ok) {
        toast.success('Payment recorded successfully!');
        setIsPayModalOpen(false);
        fetchFees();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to record payment');
      }
    } catch (err) {
      toast.error('Failed to update fee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFee = async () => {
    if (!selectedFee) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/fees/${selectedFee.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Fee invoice cancelled');
        setIsDeleteModalOpen(false);
        fetchFees();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete fee invoice');
      }
    } catch (err) {
      toast.error('Failed to delete invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute metrics
  const totalBilled = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalOutstanding = totalBilled - totalCollected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fee Billing & Invoices</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage tuition billing, track settlements, record payments, and audit revenue.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Billed</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalBilled)}</p>
          <p className="text-[11px] text-slate-500 mt-1">{fees.length} Total Invoices</p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Total Collected</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(totalCollected)}</p>
          <p className="text-[11px] text-emerald-600 mt-1">Reconciled funds</p>
        </div>

        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Outstanding Balance</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{formatCurrency(totalOutstanding)}</p>
          <p className="text-[11px] text-rose-600 mt-1">Pending & Overdue dues</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice #, student name, roll number, or fee title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
        >
          <option value="">All Payment Statuses</option>
          <option value="PAID">Paid in Full</option>
          <option value="PARTIAL">Partially Paid</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    Loading fee invoices...
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{fee.invoiceNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {fee.student?.user?.name}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Roll: {fee.student?.rollNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {fee.student?.class?.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{fee.title}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(fee.amount)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{formatCurrency(fee.paidAmount)}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(fee.dueDate)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${getFeeStatusColor(
                          fee.status
                        )}`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {fee.status !== 'PAID' && (
                          <button
                            onClick={() => handleOpenPay(fee)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1"
                          >
                            <DollarSign className="w-3 h-3" /> Record Pay
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedFee(fee);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Fee Invoice Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Generate New Fee Invoice"
        subtitle="Create tuition or special fee billing voucher"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateFee} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Student *</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.name} ({s.rollNumber} - {s.class.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Fee Description *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Term 2 Tuition & Science Lab Fee"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Amount ($) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Billing Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="e.g. Standard quarterly instalment"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Generating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Record Payment for ${selectedFee?.invoiceNumber}`}
        subtitle={`Student: ${selectedFee?.student?.user?.name} • Balance: ${formatCurrency(
          (selectedFee?.amount || 0) - (selectedFee?.paidAmount || 0)
        )}`}
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount ($) *</label>
            <input
              type="number"
              required
              min="1"
              max={(selectedFee?.amount || 0) - (selectedFee?.paidAmount || 0)}
              value={paymentData.paidAmount}
              onChange={(e) => setPaymentData({ ...paymentData, paidAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ONLINE">Online Portal</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="CASH">Cash Deposit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Receipt Notes</label>
            <input
              type="text"
              value={paymentData.remarks}
              onChange={(e) => setPaymentData({ ...paymentData, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteFee}
        title="Delete Fee Invoice"
        message={`Are you sure you want to permanently delete invoice "${selectedFee?.invoiceNumber}" for ${selectedFee?.student?.user?.name}?`}
        confirmLabel="Delete Invoice"
        isLoading={isSubmitting}
      />
    </div>
  );
}
