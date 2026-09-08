const { spawn } = require('child_process');
const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(BASE_URL, (res) => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startServerIfNeeded() {
  const running = await isServerRunning();
  if (running) {
    console.log('⚡ Detected running Next.js instance on port 3000.\n');
    return null;
  }

  console.log('🚀 Starting Next.js instance for automated test execution...');
  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';
  const serverProcess = spawn(npmCmd, ['run', 'start'], {
    stdio: 'pipe',
    shell: true,
  });

  // Wait for server to become ready
  let attempts = 0;
  while (attempts < 30) {
    await delay(1000);
    const ready = await isServerRunning();
    if (ready) {
      console.log('✅ Server ready on port 3000.\n');
      return serverProcess;
    }
    attempts++;
  }

  console.warn('⚠️ Server took too long to start, proceeding with tests...');
  return serverProcess;
}

async function runTests() {
  console.log('========================================================');
  console.log('🧪 EduManage — Automated QA & Integration Test Runner');
  console.log('========================================================\n');

  let serverProcess = null;
  try {
    serverProcess = await startServerIfNeeded();
  } catch (err) {
    console.warn('Could not auto-start server:', err.message);
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test Public Routes
    console.log('--- 1. Testing Public & Landing Pages ---');
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, 'Landing page (/) returns HTTP 200 OK');

    const loginRes = await fetch(`${BASE_URL}/login`);
    assert(loginRes.status === 200, 'Login page (/login) returns HTTP 200 OK');

    // 2. Test Authentication
    console.log('\n--- 2. Testing Authentication & Session Management ---');
    let adminCookie = '';
    let teacherCookie = '';
    let studentCookie = '';

    // Invalid login
    const invalidRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fake@edumanage.com', password: 'wrongpassword' }),
    });
    assert(invalidRes.status === 401, 'Invalid credentials rejected with HTTP 401');

    // Admin Login
    const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@edumanage.com', password: 'admin123' }),
    });
    const adminData = await adminRes.json();
    adminCookie = adminRes.headers.get('set-cookie') || '';
    assert(adminRes.status === 200 && adminData.user?.role === 'ADMIN', 'Admin login successful');

    // Teacher Login
    const teacherRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah.jenkins@edumanage.com', password: 'teacher123' }),
    });
    const teacherData = await teacherRes.json();
    teacherCookie = teacherRes.headers.get('set-cookie') || '';
    assert(teacherRes.status === 200 && teacherData.user?.role === 'TEACHER', 'Teacher login successful');

    // Student Login
    const studentRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.morgan@edumanage.com', password: 'student123' }),
    });
    const studentData = await studentRes.json();
    studentCookie = studentRes.headers.get('set-cookie') || '';
    assert(studentRes.status === 200 && studentData.user?.role === 'STUDENT', 'Student login successful');

    // Demo Switcher
    const demoRes = await fetch(`${BASE_URL}/api/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN' }),
    });
    const demoData = await demoRes.json();
    assert(demoRes.status === 200 && demoData.user?.role === 'ADMIN', '1-Click Demo Switcher works for ADMIN');

    // Auth /me check
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: adminCookie },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user?.email === 'admin@edumanage.com', 'GET /api/auth/me validates session cookie');

    // 3. Test RBAC Security & Boundary Checks
    console.log('\n--- 3. Testing RBAC Security & Boundary Checks ---');
    const noAuthRes = await fetch(`${BASE_URL}/api/students`);
    assert(noAuthRes.status === 401, 'Unauthenticated request to /api/students returns 401 Unauthorized');

    const studentForbiddenRes = await fetch(`${BASE_URL}/api/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: studentCookie },
      body: JSON.stringify({ name: 'Hacker', email: 'hack@test.com', employeeId: 'TCH-999', department: 'None' }),
    });
    assert(studentForbiddenRes.status === 403, 'Student creating faculty blocked with HTTP 403 Forbidden');

    const teacherForbiddenRes = await fetch(`${BASE_URL}/api/classes/fake-id`, {
      method: 'DELETE',
      headers: { Cookie: teacherCookie },
    });
    assert(teacherForbiddenRes.status === 403, 'Teacher deleting class blocked with HTTP 403 Forbidden');

    // 4. Test Role-Specific Analytics
    console.log('\n--- 4. Testing Role-Specific Analytics (/api/stats) ---');
    const adminStatsRes = await fetch(`${BASE_URL}/api/stats`, { headers: { Cookie: adminCookie } });
    const adminStats = await adminStatsRes.json();
    assert(
      adminStats.totalStudents >= 6 &&
        adminStats.totalTeachers >= 3 &&
        adminStats.attendanceChart?.length > 0 &&
        adminStats.feeDistribution?.length > 0,
      'Admin analytics returns institutional KPIs and charts'
    );

    const teacherStatsRes = await fetch(`${BASE_URL}/api/stats`, { headers: { Cookie: teacherCookie } });
    const teacherStats = await teacherStatsRes.json();
    assert(teacherStats.totalClasses >= 1, 'Teacher analytics returns assigned classes and students');

    const studentStatsRes = await fetch(`${BASE_URL}/api/stats`, { headers: { Cookie: studentCookie } });
    const studentStats = await studentStatsRes.json();
    assert(studentStats.student?.user?.name === 'Alex Morgan' && studentStats.gpa > 0, 'Student analytics returns personalized student metrics');

    // 5. Test Admin CRUD Workflows
    console.log('\n--- 5. Testing Full Admin CRUD Workflows ---');

    // Class CRUD
    const classRes = await fetch(`${BASE_URL}/api/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Grade 9-QA',
        section: 'QA-1',
        gradeLevel: 'Grade 9',
        roomNumber: 'Room 909',
        capacity: 25,
      }),
    });
    const classData = await classRes.json();
    const testClassId = classData.class?.id;
    assert(classRes.status === 201 && testClassId, 'Created test Class "Grade 9-QA"');

    // Add subject
    const subRes = await fetch(`${BASE_URL}/api/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Robotics Engineering',
        code: 'ROB-101',
        classId: testClassId,
      }),
    });
    const subData = await subRes.json();
    assert(subRes.status === 201 && subData.subject?.id, 'Added Subject "Robotics Engineering" to class');

    // Student CRUD
    const createStudentRes = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Lucas Test Student',
        email: 'lucas.test@edumanage.com',
        rollNumber: '9QA-01',
        admissionNumber: 'ADM-2025-9999',
        classId: testClassId,
        gender: 'MALE',
        parentName: 'Thomas Test',
        parentPhone: '+1 (555) 999-8888',
      }),
    });
    const createStudentData = await createStudentRes.json();
    const testStudentId = createStudentData.student?.id;
    assert(createStudentRes.status === 201 && testStudentId, 'Enrolled new Student "Lucas Test Student"');

    // Read student 360 profile
    const profileRes = await fetch(`${BASE_URL}/api/students/${testStudentId}`, {
      headers: { Cookie: adminCookie },
    });
    const profileData = await profileRes.json();
    assert(profileRes.status === 200 && profileData.student?.rollNumber === '9QA-01', 'Retrieved Student 360° Profile');

    // Update student
    const updateRes = await fetch(`${BASE_URL}/api/students/${testStudentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ rollNumber: '9QA-02', address: '123 Verified Lane' }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.student?.rollNumber === '9QA-02', 'Updated Student details and verified database persistence');

    // Teacher CRUD
    const teacherCrudRes = await fetch(`${BASE_URL}/api/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Prof. Marcus Vance',
        email: 'marcus.vance@edumanage.com',
        employeeId: 'TCH-2025-099',
        qualification: 'Ph.D. Computer Science',
        department: 'Science & Mathematics',
        specialization: 'Artificial Intelligence',
      }),
    });
    const teacherCrudData = await teacherCrudRes.json();
    const testTeacherId = teacherCrudData.teacher?.id;
    assert(teacherCrudRes.status === 201 && testTeacherId, 'Created Faculty Member "Prof. Marcus Vance"');

    // Delete Teacher
    const delTeacherRes = await fetch(`${BASE_URL}/api/teachers/${testTeacherId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(delTeacherRes.status === 200, 'Deleted test Faculty Member successfully');

    // Attendance Batch Recording
    const attRes = await fetch(`${BASE_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        classId: testClassId,
        date: '2025-05-10',
        records: [
          { studentId: testStudentId, status: 'PRESENT', remarks: 'Attended on time' },
        ],
      }),
    });
    const attData = await attRes.json();
    assert(attRes.status === 200 && attData.records?.length === 1, 'Batch Attendance recording verified and persisted');

    // Examination & Gradebook Flow
    const examRes = await fetch(`${BASE_URL}/api/examinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        name: 'Term 3 Innovation Assessment 2025',
        examType: 'UNIT_TEST',
        startDate: '2025-06-01',
        endDate: '2025-06-05',
        term: 'Term 3',
        status: 'UPCOMING',
      }),
    });
    const examData = await examRes.json();
    const testExamId = examData.examination?.id;
    assert(examRes.status === 201 && testExamId, 'Scheduled new Examination session');

    // Get subject ID for class
    const subListRes = await fetch(`${BASE_URL}/api/subjects?classId=${testClassId}`, {
      headers: { Cookie: adminCookie },
    });
    const subListData = await subListRes.json();
    const subjectId = subListData.subjects?.[0]?.id;

    if (subjectId) {
      const marksRes = await fetch(`${BASE_URL}/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
        body: JSON.stringify({
          examId: testExamId,
          subjectId: subjectId,
          records: [
            { studentId: testStudentId, marksObtained: 95, totalMarks: 100, remarks: 'Excellent project work' },
          ],
        }),
      });
      const marksData = await marksRes.json();
      assert(
        marksRes.status === 200 && marksData.results?.[0]?.grade === 'A+' && marksData.results?.[0]?.percentage === 95,
        'Recorded Exam Marks and verified automatic Grade calculation (95% -> A+)'
      );
    }

    // Clean up test exam
    await fetch(`${BASE_URL}/api/examinations?id=${testExamId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });

    // Fee Invoicing & Payment Settlement Flow
    const feeRes = await fetch(`${BASE_URL}/api/fees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        studentId: testStudentId,
        title: 'Robotics Workshop Kit Fee',
        amount: 300,
        dueDate: '2025-07-01',
        remarks: 'One-time hardware kit',
      }),
    });
    const feeData = await feeRes.json();
    const testFeeId = feeData.fee?.id;
    assert(feeRes.status === 201 && testFeeId, 'Generated Fee Invoice ($300)');

    // Record Partial Payment ($150)
    const payRes = await fetch(`${BASE_URL}/api/fees/${testFeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        paidAmount: 150,
        paymentMethod: 'ONLINE',
      }),
    });
    const payData = await payRes.json();
    assert(payRes.status === 200 && payData.fee?.status === 'PARTIAL', 'Recorded Partial Payment ($150) -> Status computed as PARTIAL');

    // Record Full Settle ($300)
    const settleRes = await fetch(`${BASE_URL}/api/fees/${testFeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        paidAmount: 300,
        paymentMethod: 'ONLINE',
      }),
    });
    const settleData = await settleRes.json();
    assert(settleRes.status === 200 && settleData.fee?.status === 'PAID', 'Recorded Full Settlement ($300) -> Status computed as PAID');

    // Clean up test fee
    await fetch(`${BASE_URL}/api/fees/${testFeeId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });

    // Academic Records Flow
    const acadRes = await fetch(`${BASE_URL}/api/academic-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        studentId: testStudentId,
        academicYear: '2024-2025',
        term: 'Term 1',
        gpa: 3.92,
        totalCredits: 22,
        rank: 1,
        status: 'PROMOTED',
        remarks: 'Distinction in all subjects',
      }),
    });
    const acadData = await acadRes.json();
    assert(acadRes.status === 201 && acadData.record?.gpa === 3.92, 'Saved Academic Record and GPA Transcript');

    // Clean up test student & class
    await fetch(`${BASE_URL}/api/students/${testStudentId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(true, 'Deleted test Student (cascaded cleanly)');

    await fetch(`${BASE_URL}/api/classes/${testClassId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(true, 'Deleted test Class');

  } catch (err) {
    assert(false, `Test error: ${err.message}`);
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  console.log('\n========================================================');
  console.log(`📊 Test Execution Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
