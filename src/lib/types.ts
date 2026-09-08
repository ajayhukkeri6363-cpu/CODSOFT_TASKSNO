export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface UserSummary {
  id: string;
  email: string;
  role: Role;
  name: string;
  avatar?: string | null;
  phone?: string | null;
}

export interface TeacherWithDetails {
  id: string;
  userId: string;
  employeeId: string;
  qualification: string;
  specialization: string;
  department: string;
  joiningDate: string;
  phone?: string | null;
  address?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
  };
  managedClasses?: Array<{
    id: string;
    name: string;
    section: string;
  }>;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
    classId: string;
    class?: {
      name: string;
    };
  }>;
}

export interface StudentWithDetails {
  id: string;
  userId: string;
  rollNumber: string;
  admissionNumber: string;
  admissionDate: string;
  dateOfBirth?: string | null;
  gender: string;
  bloodGroup?: string | null;
  address?: string | null;
  parentName?: string | null;
  parentPhone?: string | null;
  parentEmail?: string | null;
  classId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
  };
  class: {
    id: string;
    name: string;
    section: string;
    gradeLevel: string;
  };
  attendances?: Array<{
    id: string;
    date: string;
    status: string;
    remarks?: string | null;
  }>;
  results?: Array<{
    id: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    subject: {
      name: string;
      code: string;
    };
    exam: {
      name: string;
      term: string;
    };
  }>;
  fees?: Array<{
    id: string;
    invoiceNumber: string;
    title: string;
    amount: number;
    paidAmount: number;
    status: string;
    dueDate: string;
  }>;
  academicRecords?: Array<{
    id: string;
    academicYear: string;
    term: string;
    gpa: number;
    rank?: number | null;
    status: string;
  }>;
}

export interface ClassWithDetails {
  id: string;
  name: string;
  section: string;
  gradeLevel: string;
  roomNumber?: string | null;
  capacity: number;
  classTeacherId?: string | null;
  classTeacher?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
  _count?: {
    students: number;
    subjects: number;
  };
  students?: Array<{
    id: string;
    rollNumber: string;
    user: {
      name: string;
      email: string;
      avatar?: string | null;
    };
  }>;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
    teacher?: {
      user: {
        name: string;
      };
    } | null;
  }>;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string | null;
  student: {
    id: string;
    rollNumber: string;
    user: {
      name: string;
      avatar?: string | null;
    };
  };
}

export interface ExaminationWithStats {
  id: string;
  name: string;
  examType: string;
  startDate: string;
  endDate: string;
  term: string;
  academicYear: string;
  status: string;
  _count?: {
    results: number;
  };
}

export interface FeeWithDetails {
  id: string;
  studentId: string;
  invoiceNumber: string;
  title: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  status: 'PAID' | 'PENDING' | 'PARTIAL' | 'OVERDUE';
  remarks?: string | null;
  student: {
    id: string;
    rollNumber: string;
    user: {
      name: string;
      email: string;
    };
    class: {
      name: string;
    };
  };
}
