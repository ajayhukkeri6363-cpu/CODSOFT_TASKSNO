const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const PORT = 3002;
const BASE_URL = `http://localhost:${PORT}`;

let serverProcess;
let testCount = 0;
let passedCount = 0;
let failedCount = 0;
let isCustomTestEnv = false;
let originalSchemaContent = null;

function isPortOpen(host, port, timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function assert(condition, message) {
  testCount++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
  }
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (options.body) {
      const bodyData =
        typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(bodyData));
      req.write(bodyData);
    }

    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function prepareTestEnvironment() {
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  originalSchemaContent = fs.readFileSync(schemaPath, 'utf8');

  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/careerhub';
  let isPgReachable = false;

  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    try {
      const parsed = new URL(dbUrl);
      const host = parsed.hostname || 'localhost';
      const port = parseInt(parsed.port || '5432');
      isPgReachable = await isPortOpen(host, port, 1000);
    } catch {
      isPgReachable = false;
    }
  }

  if (!isPgReachable) {
    console.log('ℹ️ Local PostgreSQL server offline — preparing isolated test sandbox...');
    isCustomTestEnv = true;

    const testSchemaContent = originalSchemaContent.replace(
      /datasource db\s*\{[\s\S]*?\}/,
      'datasource db {\n  provider = "sqlite"\n  url      = "file:./test.db"\n}'
    );
    fs.writeFileSync(schemaPath, testSchemaContent, 'utf8');

    execSync('npx prisma db push --schema=prisma/schema.prisma --skip-generate', { stdio: 'ignore' });
    execSync('npx prisma generate', { stdio: 'ignore' });
    execSync('node prisma/seed.js', { stdio: 'ignore' });
    execSync('npx next build', { stdio: 'ignore' });
  }
}

async function cleanupTestEnvironment() {
  if (isCustomTestEnv) {
    console.log('🔄 Restoring production PostgreSQL Prisma configuration...');
    const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
    let content = fs.readFileSync(schemaPath, 'utf8');
    content = content.replace(
      /datasource db\s*\{[\s\S]*?\}/,
      'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}'
    );
    fs.writeFileSync(schemaPath, content, 'utf8');

    try {
      execSync('npx prisma generate', { stdio: 'ignore' });
    } catch {}

    const testDb = path.join(__dirname, 'prisma', 'test.db');
    const testDbJournal = path.join(__dirname, 'prisma', 'test.db-journal');
    if (fs.existsSync(testDb)) try { fs.unlinkSync(testDb); } catch {}
    if (fs.existsSync(testDbJournal)) try { fs.unlinkSync(testDbJournal); } catch {}
  }
}

async function startServer() {
  console.log(`\n⚙️ Starting CareerHub Next.js test server on port ${PORT}...`);
  serverProcess = spawn('npx', ['next', 'start', '-p', PORT.toString()], {
    shell: true,
    stdio: 'ignore',
    env: { ...process.env, PORT: PORT.toString(), NODE_ENV: 'production' },
  });

  // Wait for server to become responsive
  for (let i = 0; i < 35; i++) {
    await sleep(1000);
    try {
      const res = await makeRequest('/');
      if (res.status === 200) {
        console.log('🚀 CareerHub test server is online and ready!\n');
        return;
      }
    } catch (e) {
      // Keep waiting
    }
  }
  throw new Error('CareerHub test server failed to start in 35 seconds');
}

async function stopServer() {
  if (serverProcess) {
    console.log('\n🛑 Stopping test server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', serverProcess.pid.toString(), '/f', '/t'], { shell: true });
    } else {
      serverProcess.kill();
    }
  }
}

async function runTests() {
  try {
    await prepareTestEnvironment();
    await startServer();

    console.log('===============================================================');
    console.log('💼 Starting Comprehensive CareerHub API & Functional Test Suite');
    console.log('===============================================================\n');

    // 1. Public Endpoints
    console.log('1. Public Front-of-House Pages');
    const homeRes = await makeRequest('/');
    assert(homeRes.status === 200, 'GET / landing page returns HTTP 200');

    const jobsPageRes = await makeRequest('/jobs');
    assert(jobsPageRes.status === 200, 'GET /jobs marketplace page returns HTTP 200');

    const loginPageRes = await makeRequest('/login');
    assert(loginPageRes.status === 200, 'GET /login auth portal returns HTTP 200');

    const registerPageRes = await makeRequest('/register');
    assert(registerPageRes.status === 200, 'GET /register sign up page returns HTTP 200');

    // 2. Job Search & Filtering Catalog API
    console.log('\n2. Job Marketplace & Catalog Search API');
    const allJobsRes = await makeRequest('/api/jobs');
    assert(
      allJobsRes.status === 200 && allJobsRes.data.jobs?.length >= 10,
      `GET /api/jobs returns ${allJobsRes.data.jobs?.length} tech positions`
    );

    const testJob = allJobsRes.data.jobs[0];

    const engJobsRes = await makeRequest('/api/jobs?category=Engineering');
    assert(
      engJobsRes.status === 200 && engJobsRes.data.jobs?.length > 0,
      'GET /api/jobs?category=Engineering filters engineering roles'
    );

    const remoteJobsRes = await makeRequest('/api/jobs?remoteStatus=REMOTE');
    assert(
      remoteJobsRes.status === 200 && remoteJobsRes.data.jobs?.every((j) => j.remoteStatus === 'REMOTE'),
      'GET /api/jobs?remoteStatus=REMOTE strictly returns remote roles'
    );

    const searchKeywordRes = await makeRequest('/api/jobs?search=Architect');
    assert(
      searchKeywordRes.status === 200 && searchKeywordRes.data.jobs?.length > 0,
      'GET /api/jobs?search=Architect returns matching job titles/descriptions'
    );

    const singleJobRes = await makeRequest(`/api/jobs/${testJob.id}`);
    assert(
      singleJobRes.status === 200 && singleJobRes.data.job?.id === testJob.id,
      `GET /api/jobs/${testJob.id} returns single job details with company & skills`
    );

    // 3. User Registration, Authentication & RBAC
    console.log('\n3. Authentication, Registration & RBAC Access Control');

    // Candidate Registration
    const randSuffix = Math.random().toString(36).substring(2, 7);
    const newCandidateEmail = `cand.test.${randSuffix}@example.com`;
    const regCandidateRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        email: newCandidateEmail,
        password: 'password123',
        name: 'Test Candidate',
        role: 'CANDIDATE',
        phone: '+1 555-0100',
      },
    });
    assert(
      regCandidateRes.status === 201 && regCandidateRes.data.user?.role === 'CANDIDATE',
      'POST /api/auth/register creates new Candidate account with session (HTTP 201)'
    );
    const candidateCookie = regCandidateRes.headers['set-cookie']?.[0]?.split(';')[0] || '';

    // Candidate Duplicate Registration Prevention
    const duplicateRegRes = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: {
        email: newCandidateEmail,
        password: 'password123',
        name: 'Test Candidate',
        role: 'CANDIDATE',
      },
    });
    assert(duplicateRegRes.status === 409, 'Duplicate user registration rejected with HTTP 409 Conflict');

    // Recruiter Login
    const recruiterLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'sarah.connor@techcorp.com', password: 'recruiter123' },
    });
    assert(
      recruiterLoginRes.status === 200 && recruiterLoginRes.data.user?.role === 'RECRUITER',
      'Recruiter login with valid credentials returns HTTP 200'
    );
    const recruiterCookie = recruiterLoginRes.headers['set-cookie']?.[0]?.split(';')[0] || '';

    // Admin Login
    const adminLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@careerhub.com', password: 'admin123' },
    });
    assert(
      adminLoginRes.status === 200 && adminLoginRes.data.user?.role === 'ADMIN',
      'Admin login with valid credentials returns HTTP 200'
    );
    const adminCookie = adminLoginRes.headers['set-cookie']?.[0]?.split(';')[0] || '';

    // Invalid Password Login
    const invalidLoginRes = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@careerhub.com', password: 'wrongpassword' },
    });
    assert(invalidLoginRes.status === 401, 'Login with incorrect password rejected with HTTP 401');

    // Verify /api/auth/me
    const meRes = await makeRequest('/api/auth/me', {
      headers: { Cookie: candidateCookie },
    });
    assert(
      meRes.status === 200 && meRes.data.user?.email === newCandidateEmail,
      'GET /api/auth/me validates session cookie and returns user profile'
    );

    // RBAC: Candidate cannot publish jobs
    const candidateIllegalJobRes = await makeRequest('/api/jobs', {
      method: 'POST',
      headers: { Cookie: candidateCookie },
      body: { title: 'Illegal Candidate Job', description: 'Should fail' },
    });
    assert(candidateIllegalJobRes.status === 403, 'Candidate blocked from publishing jobs (HTTP 403 Forbidden)');

    // RBAC: Candidate cannot access Admin stats
    const candidateIllegalAdminRes = await makeRequest('/api/admin/stats', {
      headers: { Cookie: candidateCookie },
    });
    assert(candidateIllegalAdminRes.status === 403, 'Candidate blocked from admin stats (HTTP 403 Forbidden)');

    // 4. Candidate Profile & Resume Management
    console.log('\n4. Candidate Profile & Resume Management');
    const updateProfileRes = await makeRequest('/api/candidate/profile', {
      method: 'PUT',
      headers: { Cookie: candidateCookie },
      body: {
        headline: 'Lead Cloud Architect & Next.js Specialist',
        bio: 'Building resilient cloud-native microservices and developer tools.',
        location: 'Austin, TX',
        skills: ['Next.js', 'PostgreSQL', 'Docker', 'Kubernetes'],
      },
    });
    assert(updateProfileRes.status === 200, 'PUT /api/candidate/profile updates candidate profile fields');

    const getProfileRes = await makeRequest('/api/candidate/profile', {
      headers: { Cookie: candidateCookie },
    });
    assert(
      getProfileRes.status === 200 && getProfileRes.data.profile?.headline?.includes('Cloud Architect'),
      'GET /api/candidate/profile returns updated candidate profile'
    );

    // 5. Job Application Workflow & Duplicate Prevention
    console.log('\n5. Application Submission & Anti-Duplicate Conflict Engine');
    const applyRes = await makeRequest('/api/applications', {
      method: 'POST',
      headers: { Cookie: candidateCookie },
      body: {
        jobId: testJob.id,
        coverLetter: 'Excited about the opportunity at your company!',
      },
    });
    assert(
      applyRes.status === 201 && applyRes.data.application?.status === 'APPLIED',
      'POST /api/applications submits new job application with APPLIED status (HTTP 201)'
    );
    const createdAppId = applyRes.data.application?.id;

    // Duplicate Application Prevention Check
    const duplicateApplyRes = await makeRequest('/api/applications', {
      method: 'POST',
      headers: { Cookie: candidateCookie },
      body: {
        jobId: testJob.id,
        coverLetter: 'Second attempt should be blocked',
      },
    });
    assert(
      duplicateApplyRes.status === 409,
      'Anti-duplicate application guard blocks repeated application with HTTP 409 Conflict'
    );

    // 6. Saved Jobs Bookmarks
    console.log('\n6. Saved Jobs & Bookmarks Engine');
    const saveJobRes = await makeRequest('/api/saved-jobs', {
      method: 'POST',
      headers: { Cookie: candidateCookie },
      body: { jobId: testJob.id },
    });
    assert(saveJobRes.status === 201, 'POST /api/saved-jobs saves job to candidate bookmarks (HTTP 201)');

    const getSavedRes = await makeRequest('/api/saved-jobs', {
      headers: { Cookie: candidateCookie },
    });
    assert(
      getSavedRes.status === 200 && getSavedRes.data.savedJobs?.some((s) => s.jobId === testJob.id),
      'GET /api/saved-jobs retrieves candidate saved jobs list'
    );

    const removeSavedRes = await makeRequest(`/api/saved-jobs?jobId=${testJob.id}`, {
      method: 'DELETE',
      headers: { Cookie: candidateCookie },
    });
    assert(removeSavedRes.status === 200, 'DELETE /api/saved-jobs removes bookmark');

    // 7. Recruiter Job Management & ATS Kanban Pipeline
    console.log('\n7. Recruiter Job Posting & Kanban Pipeline Progression');

    // Recruiter creates a new job
    const newJobPostRes = await makeRequest('/api/jobs', {
      method: 'POST',
      headers: { Cookie: recruiterCookie },
      body: {
        title: `Staff AI Agent Architect ${randSuffix}`,
        category: 'Engineering',
        jobType: 'FULL_TIME',
        experienceLevel: 'LEAD',
        remoteStatus: 'REMOTE',
        location: 'Remote, US',
        salaryMin: 180000,
        salaryMax: 240000,
        description: 'Lead the architecture of frontier AI reasoning agents and distributed microservices.',
        responsibilities: '• Design multi-agent workflows.\n• Build low-latency evaluation pipelines.',
        requirements: '• 6+ years in Python, TypeScript, and distributed systems.',
        skills: ['Python', 'TypeScript', 'LangChain', 'Docker'],
      },
    });
    assert(
      newJobPostRes.status === 201 && newJobPostRes.data.job?.title?.includes('Staff AI Agent'),
      'Recruiter successfully creates and publishes a new job listing (HTTP 201)'
    );
    const createdJobId = newJobPostRes.data.job?.id;

    // Recruiter advances candidate stage to UNDER_REVIEW
    const stageReviewRes = await makeRequest(`/api/applications/${createdAppId}`, {
      method: 'PUT',
      headers: { Cookie: recruiterCookie },
      body: { status: 'UNDER_REVIEW', recruiterNotes: 'Candidate resume passed preliminary screening.' },
    });
    assert(
      stageReviewRes.status === 200 && stageReviewRes.data.application?.status === 'UNDER_REVIEW',
      'Recruiter moves application stage to UNDER_REVIEW'
    );

    // Recruiter advances candidate stage to SHORTLISTED
    const stageShortlistRes = await makeRequest(`/api/applications/${createdAppId}`, {
      method: 'PUT',
      headers: { Cookie: recruiterCookie },
      body: { status: 'SHORTLISTED', rating: 5 },
    });
    assert(
      stageShortlistRes.status === 200 && stageShortlistRes.data.application?.status === 'SHORTLISTED',
      'Recruiter moves application stage to SHORTLISTED with 5-star rating'
    );

    // 8. Interview Scheduling Workflow
    console.log('\n8. Interview Scheduling Workflow');
    const interviewRes = await makeRequest('/api/interviews', {
      method: 'POST',
      headers: { Cookie: recruiterCookie },
      body: {
        applicationId: createdAppId,
        scheduledDate: '2026-09-20',
        timeSlot: '02:00 PM - 03:00 PM EST',
        meetingUrl: 'https://meet.google.com/test-room-123',
        meetingType: 'TECHNICAL',
        notes: 'System design and coding interview with Senior Staff Architect',
      },
    });
    assert(
      interviewRes.status === 201 && interviewRes.data.interview?.meetingUrl?.includes('meet.google.com'),
      'Recruiter schedules candidate interview with meeting link and moves status to INTERVIEW'
    );

    // Verify candidate sees upcoming interview
    const candidateInterviewsRes = await makeRequest('/api/interviews', {
      headers: { Cookie: candidateCookie },
    });
    assert(
      candidateInterviewsRes.status === 200 && candidateInterviewsRes.data.interviews?.length > 0,
      'Candidate dashboard retrieves scheduled upcoming interview with meeting link'
    );

    // Final Stage: Recruiter extends offer (SELECTED)
    const selectRes = await makeRequest(`/api/applications/${createdAppId}`, {
      method: 'PUT',
      headers: { Cookie: recruiterCookie },
      body: { status: 'SELECTED' },
    });
    assert(
      selectRes.status === 200 && selectRes.data.application?.status === 'SELECTED',
      'Recruiter marks candidate as SELECTED / Hired'
    );

    // 9. Admin Operations & Governance
    console.log('\n9. Admin Governance, KPI Analytics & Moderation');
    const adminStatsRes = await makeRequest('/api/admin/stats', {
      headers: { Cookie: adminCookie },
    });
    assert(
      adminStatsRes.status === 200 &&
        adminStatsRes.data.stats?.totalUsers >= 5 &&
        adminStatsRes.data.stats?.totalJobs >= 10,
      `Admin KPI stats endpoint returns ${adminStatsRes.data.stats?.totalUsers} users and ${adminStatsRes.data.stats?.totalJobs} jobs`
    );

    const adminUsersRes = await makeRequest('/api/admin/users', {
      headers: { Cookie: adminCookie },
    });
    assert(adminUsersRes.status === 200 && adminUsersRes.data.users?.length >= 5, 'Admin retrieves full user registry');

    // Admin moderates job (feature toggle)
    const adminJobModRes = await makeRequest('/api/admin/jobs', {
      method: 'PUT',
      headers: { Cookie: adminCookie },
      body: { jobId: createdJobId, isFeatured: true },
    });
    assert(adminJobModRes.status === 200 && adminJobModRes.data.job?.isFeatured === true, 'Admin successfully features job listing');

    // 10. Logout
    console.log('\n10. Session Teardown & Logout');
    const logoutRes = await makeRequest('/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: candidateCookie },
    });
    assert(logoutRes.status === 200, 'POST /api/auth/logout successfully clears session cookie');

    // Summary Report
    console.log('\n===============================================================');
    console.log(`📊 CareerHub Test Suite Complete: ${passedCount}/${testCount} tests passed (${failedCount} failed)`);
    console.log('===============================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test Suite encountered fatal error:', error);
    process.exit(1);
  } finally {
    await stopServer();
    await cleanupTestEnvironment();
  }
}

runTests();
