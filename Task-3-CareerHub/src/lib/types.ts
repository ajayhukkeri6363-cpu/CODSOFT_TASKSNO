export type Role = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export type JobType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE';

export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';

export type RemoteStatus = 'ON_SITE' | 'HYBRID' | 'REMOTE';

export type ApplicationStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface UserSessionPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  avatar?: string | null;
  companyId?: string | null;
}

export interface CandidateProfileData {
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  experienceYears?: number;
  currentCompany?: string;
  currentRole?: string;
  skills?: string[];
  education?: Array<{ degree: string; school: string; year: string }>;
  experience?: Array<{ title: string; company: string; years: string; description?: string }>;
}

export interface CompanyData {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  industry: string;
  location: string;
  companySize: string;
  foundedYear?: number | null;
  verified: boolean;
}

export interface JobWithDetails {
  id: string;
  recruiterId: string;
  companyId: string;
  title: string;
  slug: string;
  description: string;
  responsibilities?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  remoteStatus: RemoteStatus;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency: string;
  category: string;
  status: JobStatus;
  deadline?: string | Date | null;
  isFeatured: boolean;
  viewsCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  company: CompanyData;
  skills: Array<{ id: string; skillName: string }>;
  _count?: {
    applications: number;
    savedJobs: number;
  };
}

export interface ApplicationWithDetails {
  id: string;
  jobId: string;
  candidateId: string;
  resumeId?: string | null;
  status: ApplicationStatus;
  coverLetter?: string | null;
  recruiterNotes?: string | null;
  rating?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  job: {
    id: string;
    title: string;
    location: string;
    jobType: JobType;
    salaryMin?: number | null;
    salaryMax?: number | null;
    company: {
      id: string;
      name: string;
      logo?: string | null;
      location: string;
    };
  };
  candidate: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    candidateProfile?: {
      headline?: string | null;
      bio?: string | null;
      location?: string | null;
      skills?: string | null;
      github?: string | null;
      linkedin?: string | null;
    } | null;
  };
  resume?: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string | Date;
  } | null;
  interview?: {
    id: string;
    scheduledDate: string | Date;
    timeSlot: string;
    meetingUrl: string;
    meetingType: string;
    notes?: string | null;
    status: InterviewStatus;
  } | null;
}
