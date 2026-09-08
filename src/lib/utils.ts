import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateGrade(percentage: number): { grade: string; gpa: number; remark: string } {
  if (percentage >= 90) return { grade: 'A+', gpa: 4.0, remark: 'Outstanding' };
  if (percentage >= 80) return { grade: 'A', gpa: 3.7, remark: 'Excellent' };
  if (percentage >= 70) return { grade: 'B', gpa: 3.0, remark: 'Very Good' };
  if (percentage >= 60) return { grade: 'C', gpa: 2.5, remark: 'Good' };
  if (percentage >= 50) return { grade: 'D', gpa: 2.0, remark: 'Pass' };
  return { grade: 'F', gpa: 0.0, remark: 'Needs Improvement' };
}

export function getAttendanceColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PRESENT':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'ABSENT':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'LATE':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'EXCUSED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export function getFeeStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PAID':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PARTIAL':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'OVERDUE':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}
