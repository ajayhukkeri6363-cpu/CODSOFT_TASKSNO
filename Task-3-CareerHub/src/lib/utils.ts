import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min?: number | null, max?: number | null, currency: string = 'USD'): string {
  if (!min && !max) return 'Competitive';
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}k`;
    }
    return `$${num.toLocaleString()}`;
  };

  if (min && max) {
    if (min === max) return `${formatNumber(min)}/yr`;
    return `${formatNumber(min)} - ${formatNumber(max)}/yr`;
  }
  if (min) return `From ${formatNumber(min)}/yr`;
  if (max) return `Up to ${formatNumber(max)}/yr`;
  return 'Competitive';
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function timeAgo(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function getStatusBadgeVariant(status: string): { bg: string; text: string; border: string; label: string } {
  switch (status) {
    case 'APPLIED':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Applied' };
    case 'UNDER_REVIEW':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Under Review' };
    case 'SHORTLISTED':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Shortlisted' };
    case 'INTERVIEW':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Interview Scheduled' };
    case 'SELECTED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Selected / Hired' };
    case 'REJECTED':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Rejected' };
    case 'WITHDRAWN':
      return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', label: 'Withdrawn' };
    case 'PUBLISHED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Published' };
    case 'DRAFT':
      return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', label: 'Draft' };
    case 'CLOSED':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Closed' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: status };
  }
}

export function formatJobType(type: string): string {
  switch (type) {
    case 'FULL_TIME': return 'Full-time';
    case 'PART_TIME': return 'Part-time';
    case 'CONTRACT': return 'Contract';
    case 'INTERNSHIP': return 'Internship';
    case 'FREELANCE': return 'Freelance';
    default: return type;
  }
}

export function formatExperience(level: string): string {
  switch (level) {
    case 'ENTRY': return 'Entry Level';
    case 'MID': return 'Mid Level (2-4 yrs)';
    case 'SENIOR': return 'Senior (5+ yrs)';
    case 'LEAD': return 'Lead / Principal';
    case 'EXECUTIVE': return 'Executive / Director';
    default: return level;
  }
}

export function formatRemote(remote: string): string {
  switch (remote) {
    case 'REMOTE': return 'Remote';
    case 'HYBRID': return 'Hybrid';
    case 'ON_SITE': return 'On-site';
    default: return remote;
  }
}
