'use client';

import React, { useEffect, useState } from 'react';
import {
  School,
  Plus,
  Users,
  BookOpen,
  Edit,
  Trash2,
  UserCheck,
  DoorOpen,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { ClassWithDetails, TeacherWithDetails } from '@/lib/types';

export default function ClassesManagementPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [teachers, setTeachers] = useState<TeacherWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    gradeLevel: 'Grade 10',
    roomNumber: 'Room 101',
    capacity: 35,
    classTeacherId: '',
  });

  const [subjectData, setSubjectData] = useState({
    name: '',
    code: '',
    teacherId: '',
  });

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      if (res.ok) {
        setClasses(data.classes);
      }
    } catch (err) {
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (res.ok) {
        setTeachers(data.teachers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      section: 'A',
      gradeLevel: 'Grade 10',
      roomNumber: `Room ${Math.floor(100 + Math.random() * 300)}`,
      capacity: 35,
      classTeacherId: teachers[0]?.id || '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: ClassWithDetails) => {
    setSelectedClass(c);
    setFormData({
      name: c.name,
      section: c.section,
      gradeLevel: c.gradeLevel,
      roomNumber: c.roomNumber || '',
      capacity: c.capacity,
      classTeacherId: c.classTeacherId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditModalOpen && selectedClass) {
        const res = await fetch(`/api/classes/${selectedClass.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success('Class updated successfully!');
          setIsEditModalOpen(false);
          fetchClasses();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Failed to update class');
        }
      } else {
        const res = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          toast.success('Class created successfully!');
          setIsAddModalOpen(false);
          fetchClasses();
        } else {
          const err = await res.json();
          toast.error(err.error || 'Failed to create class');
        }
      }
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/classes/${selectedClass.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Class deleted');
        setIsDeleteModalOpen(false);
        fetchClasses();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete class');
      }
    } catch (error) {
      toast.error('Failed to delete class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subjectData.name,
          code: subjectData.code,
          classId: selectedClass.id,
          teacherId: subjectData.teacherId || null,
        }),
      });

      if (res.ok) {
        toast.success('Subject added to class!');
        setIsAddSubjectModalOpen(false);
        setSubjectData({ name: '', code: '', teacherId: '' });
        fetchClasses();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add subject');
      }
    } catch (err) {
      toast.error('Failed to add subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Classes & Courses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure academic grade cohorts, sections, room allocations, and course curriculums.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Class
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />)
        ) : classes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No classes defined yet.
          </div>
        ) : (
          classes.map((cls) => {
            const studentCount = cls._count?.students || 0;
            const occupancyPercent = Math.min(100, Math.round((studentCount / cls.capacity) * 100));

            return (
              <div
                key={cls.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {cls.gradeLevel}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">{cls.name}</h3>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                      <School className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" /> Class Teacher
                      </span>
                      <span className="font-semibold text-slate-800">
                        {cls.classTeacher?.user?.name || 'Not assigned'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5" /> Room
                      </span>
                      <span className="font-semibold text-slate-800">{cls.roomNumber || 'TBA'}</span>
                    </div>

                    {/* Student capacity progress */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Enrolled Students
                        </span>
                        <span className="font-bold text-slate-800">
                          {studentCount} / {cls.capacity} ({occupancyPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            occupancyPercent > 90 ? 'bg-amber-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Subjects list */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Curriculum Subjects ({cls.subjects?.length || 0})
                        </span>
                        <button
                          onClick={() => {
                            setSelectedClass(cls);
                            setSubjectData({
                              name: '',
                              code: `SUB-${cls.section}-01`,
                              teacherId: teachers[0]?.id || '',
                            });
                            setIsAddSubjectModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Add Subject
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                        {(cls.subjects || []).length > 0 ? (
                          cls.subjects?.map((sub) => (
                            <span
                              key={sub.id}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                            >
                              {sub.name} ({sub.code})
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No subjects added</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card footer buttons */}
                <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Edit Class"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClass(cls);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Class Details' : 'Create New Class'}
        subtitle="Configure grade level, capacity, and assign class teacher"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveClass} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Grade 10-A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section *</label>
              <input
                type="text"
                required
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="e.g. A, B, Sci-A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Grade Level *</label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. Room 101"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Capacity *</label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Class Teacher</label>
              <select
                value={formData.classTeacherId}
                onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None (Unassigned)</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user.name} ({t.department})
                  </option>
                ))}
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
              {isSubmitting ? 'Saving...' : isEditModalOpen ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
        title={`Add Subject to ${selectedClass?.name}`}
        subtitle="Define course title, syllabus code and assign teacher"
        maxWidth="md"
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={subjectData.name}
              onChange={(e) => setSubjectData({ ...subjectData, name: e.target.value })}
              placeholder="e.g. Advanced Mathematics"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code *</label>
            <input
              type="text"
              required
              value={subjectData.code}
              onChange={(e) => setSubjectData({ ...subjectData, code: e.target.value })}
              placeholder="e.g. MATH-101"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Instructor</label>
            <select
              value={subjectData.teacherId}
              onChange={(e) => setSubjectData({ ...subjectData, teacherId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">None (Unassigned)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user.name} ({t.qualification})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddSubjectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClass}
        title="Delete Class Cohort"
        message={`Are you sure you want to delete "${selectedClass?.name}"? All associated student records and course allocations will be affected.`}
        confirmLabel="Delete Class"
        isLoading={isSubmitting}
      />
    </div>
  );
}
