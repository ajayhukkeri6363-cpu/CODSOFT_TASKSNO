'use client';

import React, { useState } from 'react';
import { Modal } from '@/ui/Modal';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { useToast } from '@/context/ToastContext';
import { Calendar, Clock, Video, FileText } from 'lucide-react';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  onSuccess?: () => void;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  jobTitle,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState<string>('02:00 PM - 03:00 PM EST');
  const [meetingUrl, setMeetingUrl] = useState<string>('https://meet.google.com/');
  const [meetingType, setMeetingType] = useState<string>('TECHNICAL');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingUrl || !meetingUrl.startsWith('http')) {
      error('Please provide a valid meeting link (e.g. Google Meet, Zoom, Teams)');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          scheduledDate,
          timeSlot,
          meetingUrl,
          meetingType,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || 'Failed to schedule interview');
        return;
      }

      success(`Interview scheduled with ${candidateName}! Candidate status updated to INTERVIEW.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Network error scheduling interview');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Candidate Interview"
      description={`Set up an interview with ${candidateName} for ${jobTitle}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Interview Date"
            type="date"
            required
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Time Slot & Timezone"
            required
            placeholder="e.g. 02:00 PM - 03:00 PM EST"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            leftIcon={<Clock className="w-4 h-4" />}
          />
        </div>

        <Select
          label="Interview Stage / Round"
          value={meetingType}
          onChange={(e) => setMeetingType(e.target.value)}
          options={[
            { value: 'SCREENING', label: 'Initial Recruiter Screening' },
            { value: 'TECHNICAL', label: 'Technical Assessment & Live Coding' },
            { value: 'SYSTEM_DESIGN', label: 'System Architecture & Design' },
            { value: 'BEHAVIORAL', label: 'Behavioral & Leadership' },
            { value: 'FINAL_ROUND', label: 'Final Executive / Panel Round' },
          ]}
        />

        <Input
          label="Meeting URL (Google Meet / Zoom / Teams)"
          type="url"
          required
          placeholder="https://meet.google.com/abc-defg-hij"
          value={meetingUrl}
          onChange={(e) => setMeetingUrl(e.target.value)}
          leftIcon={<Video className="w-4 h-4" />}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Interview Agenda & Preparation Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide discussion points, expectations, or panelist names..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
          <strong>Note:</strong> Submitting will automatically transition this application to the <strong>INTERVIEW</strong> stage and notify the candidate.
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={submitting}>
            Confirm & Schedule Interview
          </Button>
        </div>
      </form>
    </Modal>
  );
};
