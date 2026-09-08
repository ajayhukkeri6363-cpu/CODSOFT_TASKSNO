const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding EduManage database with realistic demo data...');

  // Clean existing tables (in reverse relation order)
  await prisma.announcement.deleteMany();
  await prisma.academicRecord.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.result.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // 1. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@edumanage.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      name: 'Dr. Eleanor Vance',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 019-2834',
    },
  });

  // 2. Create Teachers
  const teacher1User = await prisma.user.create({
    data: {
      email: 'sarah.jenkins@edumanage.com',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      name: 'Ms. Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 234-5678',
    },
  });

  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacher1User.id,
      employeeId: 'TCH-2021-001',
      qualification: 'M.Sc. Mathematics, B.Ed.',
      specialization: 'Advanced Calculus & Computer Science',
      department: 'Science & Mathematics',
      joiningDate: new Date('2021-08-15'),
      phone: '+1 (555) 234-5678',
      address: '42 Academic Way, Suite 100, Cambridge, MA',
    },
  });

  const teacher2User = await prisma.user.create({
    data: {
      email: 'robert.vance@edumanage.com',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      name: 'Mr. Robert Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 345-6789',
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacher2User.id,
      employeeId: 'TCH-2019-004',
      qualification: 'M.A. English Literature & History',
      specialization: 'British Literature & World History',
      department: 'Humanities',
      joiningDate: new Date('2019-07-01'),
      phone: '+1 (555) 345-6789',
      address: '108 Scholar Street, Boston, MA',
    },
  });

  const teacher3User = await prisma.user.create({
    data: {
      email: 'david.chen@edumanage.com',
      passwordHash: teacherPassword,
      role: 'TEACHER',
      name: 'Dr. David Chen',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 456-7890',
    },
  });

  const teacher3 = await prisma.teacher.create({
    data: {
      userId: teacher3User.id,
      employeeId: 'TCH-2020-008',
      qualification: 'Ph.D. in Physics',
      specialization: 'Quantum Mechanics & Applied Physics',
      department: 'Physical Sciences',
      joiningDate: new Date('2020-01-10'),
      phone: '+1 (555) 456-7890',
      address: '77 Quantum Blvd, Cambridge, MA',
    },
  });

  // 3. Create Classes
  const class10A = await prisma.class.create({
    data: {
      name: 'Grade 10-A',
      section: 'A',
      gradeLevel: 'Grade 10',
      roomNumber: 'Room 101',
      capacity: 35,
      classTeacherId: teacher1.id,
    },
  });

  const class10B = await prisma.class.create({
    data: {
      name: 'Grade 10-B',
      section: 'B',
      gradeLevel: 'Grade 10',
      roomNumber: 'Room 102',
      capacity: 35,
      classTeacherId: teacher2.id,
    },
  });

  const class11Sci = await prisma.class.create({
    data: {
      name: 'Grade 11-Science',
      section: 'Sci-A',
      gradeLevel: 'Grade 11',
      roomNumber: 'Lab Block 204',
      capacity: 30,
      classTeacherId: teacher3.id,
    },
  });

  const class12Com = await prisma.class.create({
    data: {
      name: 'Grade 12-Commerce',
      section: 'Com-A',
      gradeLevel: 'Grade 12',
      roomNumber: 'Room 305',
      capacity: 32,
    },
  });

  // 4. Create Subjects for Classes
  const subMath10A = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      code: 'MATH-10',
      classId: class10A.id,
      teacherId: teacher1.id,
    },
  });

  const subPhysics10A = await prisma.subject.create({
    data: {
      name: 'Physics',
      code: 'PHYS-10',
      classId: class10A.id,
      teacherId: teacher3.id,
    },
  });

  const subEnglish10A = await prisma.subject.create({
    data: {
      name: 'English Literature',
      code: 'ENG-10',
      classId: class10A.id,
      teacherId: teacher2.id,
    },
  });

  const subCS10A = await prisma.subject.create({
    data: {
      name: 'Computer Science',
      code: 'CS-10',
      classId: class10A.id,
      teacherId: teacher1.id,
    },
  });

  const subChem11Sci = await prisma.subject.create({
    data: {
      name: 'Chemistry',
      code: 'CHEM-11',
      classId: class11Sci.id,
      teacherId: teacher3.id,
    },
  });

  const subEcon12Com = await prisma.subject.create({
    data: {
      name: 'Economics',
      code: 'ECON-12',
      classId: class12Com.id,
      teacherId: teacher2.id,
    },
  });

  // 5. Create Students
  const studentsData = [
    {
      name: 'Alex Morgan',
      email: 'alex.morgan@edumanage.com',
      rollNumber: '10A-01',
      admissionNumber: 'ADM-2023-0101',
      gender: 'MALE',
      bloodGroup: 'O+',
      dob: '2008-04-12',
      classId: class10A.id,
      parentName: 'Richard Morgan',
      parentPhone: '+1 (555) 789-0123',
      parentEmail: 'richard.morgan@example.com',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Emma Watson',
      email: 'emma.watson@edumanage.com',
      rollNumber: '10A-02',
      admissionNumber: 'ADM-2023-0102',
      gender: 'FEMALE',
      bloodGroup: 'A+',
      dob: '2008-09-24',
      classId: class10A.id,
      parentName: 'Helen Watson',
      parentPhone: '+1 (555) 890-1234',
      parentEmail: 'helen.watson@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Liam Smith',
      email: 'liam.smith@edumanage.com',
      rollNumber: '10A-03',
      admissionNumber: 'ADM-2023-0103',
      gender: 'MALE',
      bloodGroup: 'B+',
      dob: '2008-11-05',
      classId: class10A.id,
      parentName: 'Marcus Smith',
      parentPhone: '+1 (555) 901-2345',
      parentEmail: 'marcus.smith@example.com',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sophia Taylor',
      email: 'sophia.taylor@edumanage.com',
      rollNumber: '10B-01',
      admissionNumber: 'ADM-2023-0104',
      gender: 'FEMALE',
      bloodGroup: 'AB+',
      dob: '2008-02-18',
      classId: class10B.id,
      parentName: 'Catherine Taylor',
      parentPhone: '+1 (555) 012-3456',
      parentEmail: 'catherine.t@example.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Noah Brown',
      email: 'noah.brown@edumanage.com',
      rollNumber: '11S-01',
      admissionNumber: 'ADM-2022-0055',
      gender: 'MALE',
      bloodGroup: 'O-',
      dob: '2007-06-30',
      classId: class11Sci.id,
      parentName: 'Daniel Brown',
      parentPhone: '+1 (555) 123-4567',
      parentEmail: 'daniel.b@example.com',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Olivia Davis',
      email: 'olivia.davis@edumanage.com',
      rollNumber: '12C-01',
      admissionNumber: 'ADM-2021-0021',
      gender: 'FEMALE',
      bloodGroup: 'A-',
      dob: '2006-08-14',
      classId: class12Com.id,
      parentName: 'Patricia Davis',
      parentPhone: '+1 (555) 234-5670',
      parentEmail: 'patricia.d@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const createdStudents = [];

  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: studentPassword,
        role: 'STUDENT',
        name: s.name,
        avatar: s.avatar,
        phone: s.parentPhone,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        rollNumber: s.rollNumber,
        admissionNumber: s.admissionNumber,
        gender: s.gender,
        bloodGroup: s.bloodGroup,
        dateOfBirth: new Date(s.dob),
        classId: s.classId,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        parentEmail: s.parentEmail,
        address: '742 Evergreen Terrace, Springfield',
      },
      include: {
        user: true,
        class: true,
      },
    });

    createdStudents.push(student);
  }

  // 6. Create Historical Attendance (Last 15 weekdays)
  console.log('Generating attendance records...');
  const attendanceStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT', 'PRESENT', 'PRESENT'];
  const today = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    for (const student of createdStudents) {
      // Alex has high attendance, Emma has perfect, Liam occasional late/absent
      let status = 'PRESENT';
      if (student.rollNumber === '10A-03' && i % 4 === 0) status = 'ABSENT';
      else if (student.rollNumber === '10A-01' && i === 3) status = 'LATE';
      else if (student.rollNumber === '11S-01' && i === 7) status = 'EXCUSED';

      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: student.classId,
          date: new Date(d.toISOString().split('T')[0] + 'T09:00:00.000Z'),
          status: status,
          remarks: status === 'LATE' ? 'Bus delayed' : status === 'EXCUSED' ? 'Medical leave' : null,
          markedById: adminUser.id,
        },
      });
    }
  }

  // 7. Create Examinations
  const midtermExam = await prisma.examination.create({
    data: {
      name: 'Mid-Term Examination 2024',
      examType: 'MIDTERM',
      term: 'Term 1',
      academicYear: '2024-2025',
      startDate: new Date('2024-10-10'),
      endDate: new Date('2024-10-22'),
      status: 'COMPLETED',
    },
  });

  const finalExam = await prisma.examination.create({
    data: {
      name: 'Annual Final Examination 2025',
      examType: 'FINAL',
      term: 'Final Term',
      academicYear: '2024-2025',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2025-03-30'),
      status: 'UPCOMING',
    },
  });

  // 8. Create Results for Grade 10-A students in Midterm
  const grade10Students = createdStudents.filter((s) => s.classId === class10A.id);
  const class10Subjects = [subMath10A, subPhysics10A, subEnglish10A, subCS10A];

  const resultsSample = [
    // Alex Morgan
    { marks: 92, grade: 'A+', remarks: 'Outstanding performance in Mathematics' },
    { marks: 88, grade: 'A', remarks: 'Good analytical understanding' },
    { marks: 85, grade: 'A', remarks: 'Very good essay structure' },
    { marks: 95, grade: 'A+', remarks: 'Excellent coding logic and project work' },
    // Emma Watson
    { marks: 96, grade: 'A+', remarks: 'Top marks in the class, exceptional rigor' },
    { marks: 94, grade: 'A+', remarks: 'Flawless theoretical grasp' },
    { marks: 98, grade: 'A+', remarks: 'Exemplary creative writing' },
    { marks: 91, grade: 'A+', remarks: 'Great project implementation' },
    // Liam Smith
    { marks: 74, grade: 'B', remarks: 'Good effort, needs algebra practice' },
    { marks: 68, grade: 'C', remarks: 'Needs revision in kinematics' },
    { marks: 82, grade: 'A', remarks: 'Strong vocabulary and comprehension' },
    { marks: 79, grade: 'B', remarks: 'Solid foundational concepts' },
  ];

  let resIdx = 0;
  for (const st of grade10Students) {
    for (const sub of class10Subjects) {
      const sample = resultsSample[resIdx] || { marks: 80, grade: 'A', remarks: 'Satisfactory' };
      const totalMarks = 100;
      const percentage = (sample.marks / totalMarks) * 100;

      await prisma.result.create({
        data: {
          examId: midtermExam.id,
          studentId: st.id,
          subjectId: sub.id,
          marksObtained: sample.marks,
          totalMarks: totalMarks,
          percentage: percentage,
          grade: sample.grade,
          remarks: sample.remarks,
        },
      });
      resIdx++;
    }
  }

  // 9. Create Fee Invoices
  console.log('Generating fee records...');
  const feesData = [
    {
      student: createdStudents[0], // Alex
      invoiceNumber: 'INV-2024-001',
      title: 'Term 1 Tuition & Lab Fee',
      amount: 1500,
      paidAmount: 1500,
      dueDate: new Date('2024-09-01'),
      paymentDate: new Date('2024-08-28'),
      paymentMethod: 'ONLINE',
      status: 'PAID',
    },
    {
      student: createdStudents[0],
      invoiceNumber: 'INV-2024-002',
      title: 'Term 2 Tuition Fee',
      amount: 1200,
      paidAmount: 600,
      dueDate: new Date('2024-12-15'),
      paymentDate: new Date('2024-12-05'),
      paymentMethod: 'BANK_TRANSFER',
      status: 'PARTIAL',
    },
    {
      student: createdStudents[1], // Emma
      invoiceNumber: 'INV-2024-003',
      title: 'Term 1 Full Tuition & Sports Fee',
      amount: 1650,
      paidAmount: 1650,
      dueDate: new Date('2024-09-01'),
      paymentDate: new Date('2024-08-25'),
      paymentMethod: 'ONLINE',
      status: 'PAID',
    },
    {
      student: createdStudents[2], // Liam
      invoiceNumber: 'INV-2024-004',
      title: 'Term 1 Tuition Fee',
      amount: 1200,
      paidAmount: 0,
      dueDate: new Date('2024-09-01'),
      paymentDate: null,
      paymentMethod: null,
      status: 'OVERDUE',
    },
    {
      student: createdStudents[3], // Sophia
      invoiceNumber: 'INV-2024-005',
      title: 'Term 1 Tuition & Library Fee',
      amount: 1350,
      paidAmount: 0,
      dueDate: new Date('2024-12-30'),
      paymentDate: null,
      paymentMethod: null,
      status: 'PENDING',
    },
    {
      student: createdStudents[4], // Noah
      invoiceNumber: 'INV-2024-006',
      title: 'Science Stream Comprehensive Fee',
      amount: 1800,
      paidAmount: 1800,
      dueDate: new Date('2024-09-15'),
      paymentDate: new Date('2024-09-10'),
      paymentMethod: 'CARD',
      status: 'PAID',
    },
    {
      student: createdStudents[5], // Olivia
      invoiceNumber: 'INV-2024-007',
      title: 'Grade 12 Graduation & Tuition Fee',
      amount: 1950,
      paidAmount: 1950,
      dueDate: new Date('2024-09-15'),
      paymentDate: new Date('2024-09-12'),
      paymentMethod: 'ONLINE',
      status: 'PAID',
    },
  ];

  for (const fee of feesData) {
    await prisma.fee.create({
      data: {
        studentId: fee.student.id,
        invoiceNumber: fee.invoiceNumber,
        title: fee.title,
        amount: fee.amount,
        paidAmount: fee.paidAmount,
        dueDate: fee.dueDate,
        paymentDate: fee.paymentDate,
        paymentMethod: fee.paymentMethod,
        status: fee.status,
      },
    });
  }

  // 10. Create Academic Records (GPA & Transcripts)
  const academicRecords = [
    { student: createdStudents[0], term: 'Term 1', gpa: 3.82, rank: 2, status: 'PROMOTED', remarks: 'Exceptional math and computer science aptitude.' },
    { student: createdStudents[1], term: 'Term 1', gpa: 3.98, rank: 1, status: 'PROMOTED', remarks: 'Top ranking student in the batch with academic honors.' },
    { student: createdStudents[2], term: 'Term 1', gpa: 3.15, rank: 5, status: 'ONGOING', remarks: 'Steady progress, encouraged to seek math tutoring.' },
    { student: createdStudents[3], term: 'Term 1', gpa: 3.65, rank: 3, status: 'PROMOTED', remarks: 'Consistent high effort across all subjects.' },
    { student: createdStudents[4], term: 'Term 1', gpa: 3.75, rank: 2, status: 'PROMOTED', remarks: 'Excellent lab and theoretical physics performance.' },
    { student: createdStudents[5], term: 'Term 1', gpa: 3.90, rank: 1, status: 'PROMOTED', remarks: 'Exemplary leadership and economics acumen.' },
  ];

  for (const rec of academicRecords) {
    await prisma.academicRecord.create({
      data: {
        studentId: rec.student.id,
        academicYear: '2024-2025',
        term: rec.term,
        gpa: rec.gpa,
        totalCredits: 22,
        rank: rec.rank,
        status: rec.status,
        remarks: rec.remarks,
      },
    });
  }

  // 11. Create Announcements
  await prisma.announcement.create({
    data: {
      title: '🚀 Annual Science & Tech Exhibition 2025',
      content: 'We are thrilled to announce EduManage Annual Innovation Fair scheduled for November 15th. Students are invited to submit their STEM and robotics projects by the end of this month.',
      targetRole: 'ALL',
      priority: 'HIGH',
      authorId: adminUser.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: '📊 Mid-Term Examination 2024 Report Cards Available',
      content: 'Official digital report cards and subject grade sheets for the Mid-Term examinations are now published. Students and parents can view detailed score breakdowns from the Results portal.',
      targetRole: 'ALL',
      priority: 'NORMAL',
      authorId: adminUser.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: '📋 Faculty Notice: Term 2 Curriculum & Attendance Review',
      content: 'All class teachers are requested to ensure attendance records and internal assessment entries are updated by Friday 4:00 PM for administrative audit.',
      targetRole: 'TEACHER',
      priority: 'HIGH',
      authorId: adminUser.id,
    },
  });

  console.log('✅ Database seeded successfully with realistic data!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
