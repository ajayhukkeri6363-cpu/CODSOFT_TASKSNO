'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  Download,
  Lock,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDate, getFeeStatusColor } from '@/lib/utils';

export default function StudentFeesPage() {
  const { toast } = useToast();
  const [fees, setFees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pay Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStudentFees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/fees');
      const data = await res.json();
      if (res.ok) setFees(data.fees);
    } catch (err) {
      toast.error('Failed to load fee invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentFees();
  }, []);

  const handleOpenPay = (fee: any) => {
    setSelectedFee(fee);
    setPayAmount(fee.amount - fee.paidAmount);
    setIsPayModalOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    setIsProcessing(true);

    const newTotal = (selectedFee.paidAmount || 0) + Number(payAmount);

    try {
      const res = await fetch(`/api/fees/${selectedFee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidAmount: newTotal,
          paymentMethod: payMethod,
          paymentDate: new Date().toISOString(),
          remarks: 'Student portal online payment',
        }),
      });

      if (res.ok) {
        toast.success('Payment completed successfully! Receipt generated.');
        setIsPayModalOpen(false);
        fetchStudentFees();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Payment failed');
      }
    } catch (err) {
      toast.error('Payment processing error');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalBilled = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const outstanding = totalBilled - totalPaid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fee Invoices & Receipts</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View tuition invoices, due dates, payment history, and download digital vouchers.
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Billed</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalBilled)}</p>
          <span className="text-[11px] text-slate-500">Academic Year 2024-25</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Paid to Date</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(totalPaid)}</p>
          <span className="text-[11px] text-emerald-600">Reconciled payments</span>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Due Balance</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{formatCurrency(outstanding)}</p>
          <span className="text-[11px] text-rose-600">{outstanding === 0 ? 'No pending balance' : 'Pending settlement'}</span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Tuition & Academic Fee Vouchers
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No fee invoices found.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{fee.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{fee.title}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(fee.amount)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{formatCurrency(fee.paidAmount)}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(fee.dueDate)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${getFeeStatusColor(
                          fee.status
                        )}`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {fee.status !== 'PAID' ? (
                        <button
                          onClick={() => handleOpenPay(fee)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                        >
                          Pay Online
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Online Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title={`Settle ${selectedFee?.invoiceNumber}`}
        subtitle={`Amount: ${formatCurrency(selectedFee?.amount || 0)} • Due: ${formatDate(selectedFee?.dueDate)}`}
        maxWidth="md"
      >
        <form onSubmit={handleProcessPayment} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <p className="font-bold text-slate-900">{selectedFee?.title}</p>
            <p className="text-slate-500 mt-0.5">Remaining Balance: {formatCurrency(payAmount)}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Amount ($) *</label>
            <input
              type="number"
              required
              min="1"
              max={(selectedFee?.amount || 0) - (selectedFee?.paidAmount || 0)}
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ONLINE">EduManage Instant Online Checkout</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="BANK_TRANSFER">Direct Net Banking</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/70 text-xs flex items-center gap-2 text-emerald-800">
            <Lock className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>256-Bit SSL Encrypted Mock Education Payment Portal</span>
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
              disabled={isProcessing}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Processing Payment...' : `Pay ${formatCurrency(payAmount)} Now`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
