'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Calendar,
  Award,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { ExaminationWithStats } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ExaminationsPage() {
  const { toast } = useToast();
  const [exams, setExams] = useState<ExaminationWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExaminationWithStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    examType: 'MIDTERM',
    startDate: '',
    endDate: '',
    term: 'Term 1',
    academicYear: '2024-2025',
    status: 'UPCOMING',
  });

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/examinations');
      const data = await res.json();
      if (res.ok) {
        setExams(data.examinations);
      }
    } catch (err) {
      toast.error('Failed to load examinations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      name: '',
      examType: 'MIDTERM',
      startDate: today,
      endDate: today,
      term: 'Term 1',
      academicYear: '2024-2025',
      status: 'UPCOMING',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exam: ExaminationWithStats) => {
    setSelectedExam(exam);
    setFormData({
      name: exam.name,
      examType: exam.examType,
      startDate: new Date(exam.startDate).toISOString().split('T')[0],
      endDate: new Date(exam.endDate).toISOString().split('T')[0],
      term: exam.term,
      academicYear: exam.academicYear,
      status: exam.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditModalOpen && selectedExam) {
        const res = await fetch('/api/examinations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: selectedExam.id }),
        });
        if (res.ok) {
          toast.success('Examination updated!');
          setIsEditModalOpen(false);
          fetchExams();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Failed to update exam');
        }
      } else {
        const res = await fetch('/api/examinations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success('Examination created!');
          setIsAddModalOpen(false);
          fetchExams();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Failed to create exam');
        }
      }
    } catch (err) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedExam) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/examinations?id=${selectedExam.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Examination deleted');
        setIsDeleteModalOpen(false);
        fetchExams();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete exam');
      }
    } catch (err) {
      toast.error('Failed to delete exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Examinations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule institution exams, academic terms, and publish gradebook records.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule New Exam
        </button>
      </div>

      {/* Examinations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-52 bg-slate-200 rounded-2xl animate-pulse" />)
        ) : exams.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No examinations scheduled.
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {exam.term} • {exam.academicYear}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      exam.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : exam.status === 'ONGOING'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {exam.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">{exam.name}</h3>
                <p className="text-xs text-slate-500 mb-4 capitalize">Exam Type: {exam.examType.toLowerCase()}</p>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Date Duration
                    </span>
                    <span className="font-medium text-slate-800">
                      {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" /> Graded Entries
                    </span>
                    <span className="font-bold text-indigo-600">{exam._count?.results || 0} scores</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Link
                  href={`/admin/results?examId=${exam.id}`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Enter Grades <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(exam)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Exam Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Examination' : 'Schedule New Examination'}
        subtitle="Specify examination term, date ranges, and status"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Examination Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Mid-Term Examination 2024"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Exam Type *</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final Examination</option>
                <option value="UNIT_TEST">Unit Test</option>
                <option value="QUIZ">Quiz / Assessment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Term *</label>
              <input
                type="text"
                required
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                placeholder="e.g. Term 1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2024-2025"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditModalOpen ? 'Save Changes' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteExam}
        title="Delete Examination"
        message={`Are you sure you want to delete "${selectedExam?.name}"? All associated scores and results will be permanently removed.`}
        confirmLabel="Delete Examination"
        isLoading={isSubmitting}
      />
    </div>
  );
}
