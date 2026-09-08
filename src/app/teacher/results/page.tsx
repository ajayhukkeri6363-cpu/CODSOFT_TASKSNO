'use client';

import React, { useEffect, useState } from 'react';
import { Award, Save, Users, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { calculateGrade } from '@/lib/utils';

export default function TeacherResultsPage() {
  const { toast } = useToast();

  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [students, setStudents] = useState<any[]>([]);
  const [marksMap, setMarksMap] = useState<
    Record<string, { marks: number; total: number; remarks: string }>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/examinations').then((r) => r.json()),
      fetch('/api/classes').then((r) => r.json()),
    ]).then(([examData, classData]) => {
      if (examData.examinations?.length > 0) {
        setExams(examData.examinations);
        setSelectedExamId(examData.examinations[0].id);
      }
      if (classData.classes?.length > 0) {
        setClasses(classData.classes);
        setSelectedClassId(classData.classes[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;
    const currentClass = classes.find((c) => c.id === selectedClassId);
    if (currentClass?.subjects?.length > 0) {
      setSubjects(currentClass.subjects);
      setSelectedSubjectId(currentClass.subjects[0].id);
    } else {
      setSubjects([]);
      setSelectedSubjectId('');
    }
  }, [selectedClassId, classes]);

  useEffect(() => {
    if (!selectedClassId || !selectedExamId || !selectedSubjectId) return;

    setIsLoading(true);

    Promise.all([
      fetch(`/api/classes/${selectedClassId}`).then((r) => r.json()),
      fetch(
        `/api/results?examId=${selectedExamId}&classId=${selectedClassId}&subjectId=${selectedSubjectId}`
      ).then((r) => r.json()),
    ])
      .then(([classRes, resultsRes]) => {
        const studentList = classRes.class?.students || [];
        setStudents(studentList);

        const existingResults = resultsRes.results || [];
        const map: Record<string, { marks: number; total: number; remarks: string }> = {};

        studentList.forEach((st: any) => {
          const match = existingResults.find((r: any) => r.studentId === st.id);
          map[st.id] = {
            marks: match ? match.marksObtained : 85,
            total: match ? match.totalMarks : 100,
            remarks: match ? match.remarks || '' : '',
          };
        });

        setMarksMap(map);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load marks');
        setIsLoading(false);
      });
  }, [selectedExamId, selectedClassId, selectedSubjectId]);

  const handleMarkChange = (studentId: string, value: string) => {
    const num = Math.min(100, Math.max(0, Number(value) || 0));
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: num,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId || !selectedSubjectId || students.length === 0) return;
    setIsSaving(true);

    const records = Object.entries(marksMap).map(([studentId, item]) => ({
      studentId,
      marksObtained: item.marks,
      totalMarks: item.total || 100,
      remarks: item.remarks || null,
    }));

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExamId,
          subjectId: selectedSubjectId,
          records,
        }),
      });

      if (res.ok) {
        toast.success(`Marks published for ${records.length} students!`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save marks');
      }
    } catch (err) {
      toast.error('Network error saving marks');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gradebook Marks Entry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grade examination papers and submit official scores for your classes.
          </p>
        </div>

        <button
          onClick={handleSaveMarks}
          disabled={isSaving || students.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Submitting...' : 'Save & Publish Marks'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">1. Select Exam</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.term})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">2. Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">3. Select Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Marks (0-100)</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Letter Grade</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading student grade records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No students in this class.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentMarks = marksMap[student.id]?.marks ?? 80;
                  const currentRemarks = marksMap[student.id]?.remarks ?? '';
                  const percentage = currentMarks;
                  const gradeInfo = calculateGrade(percentage);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{student.rollNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <img
                          src={
                            student.user?.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                              student.user?.name || 'Student'
                            )}`
                          }
                          alt={student.user?.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span>{student.user?.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentMarks}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{percentage}%</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-md font-black text-xs bg-emerald-50 text-emerald-700">
                          {gradeInfo.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder={gradeInfo.remark}
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
