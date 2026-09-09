const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function ensureTablesExist() {
  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'CANDIDATE',
      "name" TEXT NOT NULL,
      "phone" TEXT,
      "avatar" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "CandidateProfile" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "headline" TEXT,
      "bio" TEXT,
      "location" TEXT,
      "website" TEXT,
      "github" TEXT,
      "linkedin" TEXT,
      "experienceYears" INTEGER DEFAULT 0,
      "currentCompany" TEXT,
      "currentRole" TEXT,
      "skills" TEXT,
      "education" TEXT,
      "experience" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "Company" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT UNIQUE NOT NULL,
      "logo" TEXT,
      "website" TEXT,
      "description" TEXT,
      "industry" TEXT NOT NULL DEFAULT 'Technology',
      "location" TEXT NOT NULL DEFAULT 'San Francisco, CA',
      "companySize" TEXT NOT NULL DEFAULT '50-200',
      "foundedYear" INTEGER DEFAULT 2018,
      "verified" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "RecruiterProfile" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "position" TEXT NOT NULL DEFAULT 'Senior Talent Acquisition Lead',
      "department" TEXT NOT NULL DEFAULT 'Human Resources',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "Job" (
      "id" TEXT PRIMARY KEY,
      "recruiterId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "title" TEXT NOT NULL,
      "slug" TEXT UNIQUE NOT NULL,
      "description" TEXT NOT NULL,
      "responsibilities" TEXT,
      "requirements" TEXT,
      "benefits" TEXT,
      "jobType" TEXT NOT NULL DEFAULT 'FULL_TIME',
      "experienceLevel" TEXT NOT NULL DEFAULT 'MID',
      "remoteStatus" TEXT NOT NULL DEFAULT 'HYBRID',
      "location" TEXT NOT NULL DEFAULT 'San Francisco, CA',
      "salaryMin" DOUBLE PRECISION DEFAULT 80000,
      "salaryMax" DOUBLE PRECISION DEFAULT 130000,
      "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
      "category" TEXT NOT NULL DEFAULT 'Engineering',
      "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
      "deadline" TIMESTAMP(3),
      "isFeatured" BOOLEAN NOT NULL DEFAULT false,
      "viewsCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "JobSkill" (
      "id" TEXT PRIMARY KEY,
      "jobId" TEXT NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "skillName" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "Resume" (
      "id" TEXT PRIMARY KEY,
      "candidateId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "fileName" TEXT NOT NULL,
      "fileUrl" TEXT NOT NULL,
      "storageKey" TEXT,
      "fileSize" INTEGER NOT NULL DEFAULT 102400,
      "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
      "isDefault" BOOLEAN NOT NULL DEFAULT true,
      "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "Application" (
      "id" TEXT PRIMARY KEY,
      "jobId" TEXT NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "candidateId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "resumeId" TEXT REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "status" TEXT NOT NULL DEFAULT 'APPLIED',
      "coverLetter" TEXT,
      "recruiterNotes" TEXT,
      "rating" INTEGER DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Application_jobId_candidateId_key" UNIQUE ("jobId", "candidateId")
    );`,
    `CREATE TABLE IF NOT EXISTS "SavedJob" (
      "id" TEXT PRIMARY KEY,
      "candidateId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "jobId" TEXT NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SavedJob_candidateId_jobId_key" UNIQUE ("candidateId", "jobId")
    );`,
    `CREATE TABLE IF NOT EXISTS "Interview" (
      "id" TEXT PRIMARY KEY,
      "applicationId" TEXT UNIQUE NOT NULL REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "scheduledDate" TIMESTAMP(3) NOT NULL,
      "timeSlot" TEXT NOT NULL,
      "meetingUrl" TEXT NOT NULL,
      "meetingType" TEXT NOT NULL DEFAULT 'TECHNICAL',
      "notes" TEXT,
      "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "Notification" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "title" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'INFO',
      "read" BOOLEAN NOT NULL DEFAULT false,
      "link" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const ddl of ddlStatements) {
    try {
      await prisma.$executeRawUnsafe(ddl);
    } catch {
      // Ignore if exists
    }
  }
}

async function main() {
  console.log('🌱 Seeding CareerHub Recruitment Platform Database...');

  await ensureTablesExist();

  // Clean existing tables in reverse relation order
  try {
    await prisma.notification.deleteMany();
    await prisma.interview.deleteMany();
    await prisma.savedJob.deleteMany();
    await prisma.application.deleteMany();
    await prisma.resume.deleteMany();
    await prisma.jobSkill.deleteMany();
    await prisma.job.deleteMany();
    await prisma.recruiterProfile.deleteMany();
    await prisma.candidateProfile.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
  } catch (err) {
    console.log('Tables may not be populated yet, continuing with seeding...');
  }

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const recruiterPasswordHash = await bcrypt.hash('recruiter123', salt);
  const candidatePasswordHash = await bcrypt.hash('candidate123', salt);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@careerhub.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      name: 'Eleanor Vance',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 2. Create Companies
  const techcorp = await prisma.company.create({
    data: {
      name: 'TechCorp Innovations',
      slug: 'techcorp-innovations',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=120',
      website: 'https://techcorp-innovations.example.com',
      description: 'Enterprise cloud platforms, AI Developer productivity tools, and distributed microservices.',
      industry: 'Enterprise Software & Cloud',
      location: 'San Francisco, CA',
      companySize: '200-500',
      foundedYear: 2016,
      verified: true,
    },
  });

  const innovatelabs = await prisma.company.create({
    data: {
      name: 'InnovateLabs AI',
      slug: 'innovatelabs-ai',
      logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120',
      website: 'https://innovatelabs-ai.example.com',
      description: 'Pioneering frontier generative AI models, agentic workflows, and real-time reasoning engines.',
      industry: 'Artificial Intelligence & ML',
      location: 'New York, NY',
      companySize: '50-200',
      foundedYear: 2021,
      verified: true,
    },
  });

  const cloudscale = await prisma.company.create({
    data: {
      name: 'CloudScale Systems',
      slug: 'cloudscale-systems',
      logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120',
      website: 'https://cloudscale-systems.example.com',
      description: 'Global distributed network edge infrastructure and Kubernetes resilience systems.',
      industry: 'Cloud Infrastructure & DevOps',
      location: 'Seattle, WA',
      companySize: '500+',
      foundedYear: 2014,
      verified: true,
    },
  });

  const fintech = await prisma.company.create({
    data: {
      name: 'FinTech Global',
      slug: 'fintech-global',
      logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120',
      website: 'https://fintech-global.example.com',
      description: 'Low-latency financial exchange technologies, algorithmic analytics, and modern payment APIs.',
      industry: 'Financial Technology',
      location: 'Chicago, IL',
      companySize: '1000+',
      foundedYear: 2012,
      verified: true,
    },
  });

  const pixelcraft = await prisma.company.create({
    data: {
      name: 'PixelCraft Studio',
      slug: 'pixelcraft-studio',
      logo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=120',
      website: 'https://pixelcraft-studio.example.com',
      description: 'Next-generation design systems, high-craft digital experiences, and brand engineering.',
      industry: 'Product Design & Web',
      location: 'Austin, TX',
      companySize: '20-50',
      foundedYear: 2019,
      verified: true,
    },
  });

  // 3. Create Recruiters
  const recruiter1 = await prisma.user.create({
    data: {
      email: 'sarah.connor@techcorp.com',
      passwordHash: recruiterPasswordHash,
      role: 'RECRUITER',
      name: 'Sarah Connor',
      phone: '+1 (555) 342-9102',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      recruiterProfile: {
        create: {
          companyId: techcorp.id,
          position: 'Head of Technical Talent Acquisition',
          department: 'Engineering Hiring',
        },
      },
    },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      email: 'david.kim@innovatelabs.io',
      passwordHash: recruiterPasswordHash,
      role: 'RECRUITER',
      name: 'David Kim',
      phone: '+1 (555) 781-4455',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      recruiterProfile: {
        create: {
          companyId: innovatelabs.id,
          position: 'Director of Talent & People',
          department: 'AI Research Recruitment',
        },
      },
    },
  });

  // 4. Create Candidates & Profiles
  const candidateUsersData = [
    {
      email: 'alex.morgan@example.com',
      name: 'Alex Morgan',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      headline: 'Senior Full-Stack Engineer | React, Next.js, Node.js, PostgreSQL & AWS',
      bio: 'Versatile software engineer with 6+ years building high-scale consumer web applications, distributed microservices, and modern React frontends.',
      location: 'San Francisco, CA',
      github: 'https://github.com/alexmorgan-dev',
      linkedin: 'https://linkedin.com/in/alexmorgan-dev',
      website: 'https://alexmorgan.dev',
      experienceYears: 6,
      currentCompany: 'Apex Software',
      currentRole: 'Senior Full Stack Engineer',
      skills: JSON.stringify(['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS', 'Docker', 'AWS', 'GraphQL']),
      education: JSON.stringify([
        { degree: 'B.S. in Computer Science', school: 'University of California, Berkeley', year: '2018' },
      ]),
      experience: JSON.stringify([
        { title: 'Senior Full Stack Engineer', company: 'Apex Software', years: '2021 - Present', description: 'Architected Next.js and Node.js microservices processing 5M+ daily requests.' },
        { title: 'Software Engineer', company: 'Nexus Interactive', years: '2018 - 2021', description: 'Developed core customer dashboard features with React, TypeScript, and PostgreSQL.' },
      ]),
    },
    {
      email: 'priya.sharma@example.com',
      name: 'Priya Sharma',
      phone: '+1 (555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      headline: 'Lead Frontend Architect & UI Engineer | Design Systems Expert',
      bio: 'Passionate about web performance, accessible UI design systems, and state-of-the-art React/Next.js architectures.',
      location: 'New York, NY',
      github: 'https://github.com/priyasharma-ui',
      linkedin: 'https://linkedin.com/in/priyasharma-ui',
      website: 'https://priyasharma.design',
      experienceYears: 7,
      currentCompany: 'Vanguard Digital',
      currentRole: 'Lead Frontend Architect',
      skills: JSON.stringify(['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Figma', 'Web Performance', 'Design Systems', 'Storybook', 'Jest', 'Accessibility (a11y)']),
      education: JSON.stringify([
        { degree: 'M.S. in Human-Computer Interaction', school: 'Georgia Institute of Technology', year: '2019' },
        { degree: 'B.E. in Information Technology', school: 'Delhi Technological University', year: '2017' },
      ]),
      experience: JSON.stringify([
        { title: 'Lead Frontend Architect', company: 'Vanguard Digital', years: '2021 - Present', description: 'Built company-wide multi-brand design system utilized across 14 enterprise applications.' },
      ]),
    },
    {
      email: 'james.wilson@example.com',
      name: 'James Wilson',
      phone: '+1 (555) 432-1098',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      headline: 'DevOps & Site Reliability Engineer | Kubernetes, Terraform, AWS',
      bio: 'SRE specialized in zero-downtime CI/CD pipelines, multi-region Kubernetes clusters, and automated infrastructure as code.',
      location: 'Seattle, WA',
      github: 'https://github.com/jwilson-ops',
      linkedin: 'https://linkedin.com/in/jwilson-ops',
      website: 'https://jameswilson.io',
      experienceYears: 5,
      currentCompany: 'SkyNet Ops',
      currentRole: 'Senior SRE',
      skills: JSON.stringify(['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP', 'Prometheus', 'Grafana', 'CI/CD', 'GitHub Actions', 'Python', 'Go']),
      education: JSON.stringify([
        { degree: 'B.S. in Computer Engineering', school: 'University of Washington', year: '2019' },
      ]),
      experience: JSON.stringify([
        { title: 'Senior SRE', company: 'SkyNet Ops', years: '2021 - Present', description: 'Managed EKS clusters across 3 AWS regions with 99.99% uptime SLA.' },
      ]),
    },
    {
      email: 'elena.rostova@example.com',
      name: 'Elena Rostova',
      phone: '+1 (555) 654-3210',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      headline: 'AI/ML Engineer & LLM Specialist | PyTorch, LangChain, RAG Systems',
      bio: 'Deep learning researcher and generative AI engineer building scalable retrieval-augmented generation (RAG) pipelines and LLM evaluation engines.',
      location: 'Boston, MA',
      github: 'https://github.com/erostova-ai',
      linkedin: 'https://linkedin.com/in/erostova-ai',
      website: 'https://elena-ai.dev',
      experienceYears: 4,
      currentCompany: 'NeuralEdge',
      currentRole: 'Machine Learning Engineer',
      skills: JSON.stringify(['Python', 'PyTorch', 'TensorFlow', 'LangChain', 'LlamaIndex', 'Vector Databases (Pinecone/Milvus)', 'FastAPI', 'Hugging Face', 'NLP']),
      education: JSON.stringify([
        { degree: 'M.S. in Artificial Intelligence', school: 'MIT', year: '2020' },
      ]),
      experience: JSON.stringify([
        { title: 'Machine Learning Engineer', company: 'NeuralEdge', years: '2020 - Present', description: 'Designed enterprise document intelligence pipelines using fine-tuned LLaMA models.' },
      ]),
    },
    {
      email: 'michael.chang@example.com',
      name: 'Michael Chang',
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      headline: 'Product Designer & UI/UX Strategist | Figma, React, Prototyping',
      bio: 'Bridging design and engineering with high-fidelity interactive prototypes, user journey mapping, and conversion-focused UX.',
      location: 'Austin, TX',
      github: 'https://github.com/mchang-design',
      linkedin: 'https://linkedin.com/in/mchang-design',
      website: 'https://michaelchang.design',
      experienceYears: 5,
      currentCompany: 'HyperCraft Studio',
      currentRole: 'Lead Product Designer',
      skills: JSON.stringify(['Figma', 'UI/UX Design', 'User Research', 'Wireframing', 'Prototyping', 'React', 'Tailwind CSS', 'Design Systems', 'Interaction Design']),
      education: JSON.stringify([
        { degree: 'B.F.A. in Digital Arts & Design', school: 'Rhode Island School of Design', year: '2019' },
      ]),
      experience: JSON.stringify([
        { title: 'Lead Product Designer', company: 'HyperCraft Studio', years: '2021 - Present', description: 'Redesigned core checkout and onboarding flows resulting in 28% conversion lift.' },
      ]),
    },
  ];

  const candidateUsers = [];
  for (const c of candidateUsersData) {
    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: candidatePasswordHash,
        role: 'CANDIDATE',
        name: c.name,
        phone: c.phone,
        avatar: c.avatar,
        candidateProfile: {
          create: {
            headline: c.headline,
            bio: c.bio,
            location: c.location,
            github: c.github,
            linkedin: c.linkedin,
            website: c.website,
            experienceYears: c.experienceYears,
            currentCompany: c.currentCompany,
            currentRole: c.currentRole,
            skills: c.skills,
            education: c.education,
            experience: c.experience,
          },
        },
      },
    });
    candidateUsers.push(user);

    await prisma.resume.create({
      data: {
        candidateId: user.id,
        fileName: `${c.name.replace(/\s+/g, '_')}_Resume_2026.pdf`,
        fileUrl: `/uploads/resumes/resume_${user.id}_sample.pdf`,
        storageKey: `resume_${user.id}_sample.pdf`,
        fileSize: 142800,
        mimeType: 'application/pdf',
        isDefault: true,
      },
    });
  }

  // 5. Create 16 Diverse Jobs
  const jobsData = [
    {
      recruiterId: recruiter1.id,
      companyId: techcorp.id,
      title: 'Senior Full Stack Engineer',
      slug: 'senior-full-stack-engineer-techcorp',
      category: 'Engineering',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      remoteStatus: 'HYBRID',
      location: 'San Francisco, CA',
      salaryMin: 145000,
      salaryMax: 185000,
      salaryCurrency: 'USD',
      isFeatured: true,
      status: 'PUBLISHED',
      description: 'Join TechCorp Innovations to lead the engineering of next-generation developer tooling and high-throughput SaaS cloud services. You will collaborate with cross-functional teams to build resilient architectures.',
      responsibilities: '• Architect and implement robust full-stack web applications using Next.js, Node.js, and PostgreSQL.\n• Optimize database query performance, indexing, and connection pooling.\n• Mentor junior engineers and conduct technical code reviews.\n• Partner with product managers to scope and deliver features with high velocity.',
      requirements: '• 5+ years of production experience in TypeScript, React/Next.js, and Node.js.\n• Strong foundation in relational database modeling (PostgreSQL / Prisma / TypeORM).\n• Experience with RESTful and GraphQL APIs.\n• Proven ability to design scalable microservices and distributed background jobs.',
      benefits: '• Competitive base salary + equity compensation\n• 100% employer-covered health, dental, and vision insurance\n• 401(k) matching up to 5%\n• Unlimited PTO and flexible hybrid schedule\n• $3,000 annual learning & conference stipend',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: techcorp.id,
      title: 'Lead Next.js / Frontend Architect',
      slug: 'lead-frontend-architect-techcorp',
      category: 'Engineering',
      jobType: 'FULL_TIME',
      experienceLevel: 'LEAD',
      remoteStatus: 'REMOTE',
      location: 'San Francisco, CA (Remote Allowed)',
      salaryMin: 160000,
      salaryMax: 205000,
      salaryCurrency: 'USD',
      isFeatured: true,
      status: 'PUBLISHED',
      description: 'We are seeking a visionary Lead Frontend Architect to establish the design system foundation, micro-frontend standards, and performance benchmarks across all TechCorp web products.',
      responsibilities: '• Drive frontend technical vision, modular architecture, and component libraries.\n• Spearhead web performance optimizations (Core Web Vitals, SSR, streaming rendering).\n• Author architectural decision records (ADRs) and lead weekly engineering syncs.\n• Ensure top-tier accessibility (WCAG 2.1 AA compliance).',
      requirements: '• 7+ years in frontend engineering with 2+ years in technical leadership / architecture.\n• Mastery of React 18/19, Next.js App Router, TypeScript, and Tailwind CSS.\n• Deep expertise in state management, bundlers (Turbopack/Webpack/Vite), and CI/CD testing.',
      benefits: '• Top-of-market salary + valuable equity\n• Comprehensive global health coverage\n• Home office setup allowance ($2,500)\n• Flexible remote-first work environment',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Turbopack', 'Web Performance', 'Design Systems'],
    },
    {
      recruiterId: recruiter2.id,
      companyId: innovatelabs.id,
      title: 'AI Infrastructure & LLM Systems Engineer',
      slug: 'ai-infrastructure-llm-systems-engineer-innovatelabs',
      category: 'Engineering',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      remoteStatus: 'REMOTE',
      location: 'New York, NY (Remote Allowed)',
      salaryMin: 170000,
      salaryMax: 220000,
      salaryCurrency: 'USD',
      isFeatured: true,
      status: 'PUBLISHED',
      description: 'InnovateLabs AI is scaling frontier generative AI agents and inference pipelines. In this role, you will build ultra-low-latency model serving frameworks, vector search clusters, and agentic reasoning loops.',
      responsibilities: '• Design and deploy scalable LLM inference engines (vLLM, TensorRT-LLM, Triton).\n• Build vector database pipelines with semantic caching and hybrid search.\n• Implement streaming token evaluation and prompt security guardrails.\n• Scale infrastructure across multi-GPU cloud instances (H100/A100).',
      requirements: '• 4+ years of software engineering with strong Python and C++ or Rust background.\n• Hands-on experience with PyTorch, CUDA, Hugging Face, and distributed model serving.\n• Strong understanding of transformer architectures, quantization, and RAG pipelines.',
      benefits: '• Generous equity grant in high-growth AI startup\n• Premium medical, dental, vision coverage\n• Flexible wellness stipend & gym membership\n• Annual team offsites in international locations',
      skills: ['Python', 'PyTorch', 'FastAPI', 'Vector Databases', 'LangChain', 'Docker', 'Kubernetes', 'CUDA'],
    },
    {
      recruiterId: recruiter2.id,
      companyId: innovatelabs.id,
      title: 'Machine Learning Research Scientist',
      slug: 'ml-research-scientist-innovatelabs',
      category: 'Data Science',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      remoteStatus: 'HYBRID',
      location: 'New York, NY',
      salaryMin: 180000,
      salaryMax: 235000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Perform foundational research in reasoning models, multimodal representations, and automated code generation algorithms.',
      responsibilities: '• Publish novel research papers and file foundational patents.\n• Train and fine-tune large-scale multimodal models.\n• Collaborate with product teams to transition research breakthroughs into production.',
      requirements: '• Ph.D. or Master’s in Computer Science, Machine Learning, or related quantitative field.\n• Proven publication record at top conferences (NeurIPS, ICML, ICLR, CVPR).\n• Fluency in PyTorch, JAX, and distributed training frameworks (DeepSpeed, Megatron-LM).',
      benefits: '• Uncapped compute budget with dedicated GPU clusters\n• Competitive salary and stock options\n• Relocation assistance to New York City',
      skills: ['Python', 'PyTorch', 'JAX', 'DeepSpeed', 'NLP', 'Multimodal AI', 'Machine Learning'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: cloudscale.id,
      title: 'Cloud Platform & Kubernetes SRE',
      slug: 'cloud-platform-kubernetes-sre-cloudscale',
      category: 'DevOps',
      jobType: 'FULL_TIME',
      experienceLevel: 'MID',
      remoteStatus: 'REMOTE',
      location: 'Seattle, WA (Remote Allowed)',
      salaryMin: 130000,
      salaryMax: 165000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Ensure extreme reliability and automated scaling of our multi-cloud Kubernetes clusters serving tens of thousands of global tenants.',
      responsibilities: '• Build automated Terraform modules and GitOps workflows (ArgoCD/Flux).\n• Maintain observability stacks with Prometheus, Grafana, OpenTelemetry, and Loki.\n• Conduct incident post-mortems and automate chaos engineering tests.',
      requirements: '• 3+ years in DevOps/SRE with deep knowledge of Kubernetes internals.\n• Strong scripting skills in Go or Python.\n• Experience with AWS/GCP networking, VPCs, and IAM security.',
      benefits: '• 100% remote flexibility\n• Comprehensive health package\n• 401(k) matching\n• Cell phone and internet reimbursement',
      skills: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'Prometheus', 'ArgoCD', 'Go'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: cloudscale.id,
      title: 'Distributed Backend Engineer (Go / Rust)',
      slug: 'distributed-backend-engineer-cloudscale',
      category: 'Engineering',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      remoteStatus: 'REMOTE',
      location: 'Seattle, WA',
      salaryMin: 155000,
      salaryMax: 195000,
      salaryCurrency: 'USD',
      isFeatured: true,
      status: 'PUBLISHED',
      description: 'Build high-performance, low-latency distributed storage systems and consensus protocols in Go and Rust.',
      responsibilities: '• Architect distributed consensus mechanisms (Raft) and event streaming layers.\n• Optimize networking throughput, gRPC endpoints, and memory usage.\n• Write comprehensive integration and fuzz tests.',
      requirements: '• 4+ years building high-concurrency systems in Go or Rust.\n• Strong grasp of TCP/IP, gRPC, Protobuf, and Linux system calls.\n• Experience with distributed databases (CockroachDB, Cassandra, or Kafka).',
      benefits: '• Competitive base salary and equity\n• Unlimited PTO policy\n• $2,000 yearly hardware budget',
      skills: ['Go', 'Rust', 'gRPC', 'Kafka', 'Distributed Systems', 'PostgreSQL', 'Docker'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: pixelcraft.id,
      title: 'Senior Product Designer',
      slug: 'senior-product-designer-pixelcraft',
      category: 'Design',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      remoteStatus: 'REMOTE',
      location: 'Austin, TX (Remote Allowed)',
      salaryMin: 125000,
      salaryMax: 160000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'PixelCraft Studio is looking for a Senior Product Designer to shape intuitive, beautiful interfaces for cutting-edge digital products.',
      responsibilities: '• Own the end-to-end design lifecycle from user research to production-ready Figma specs.\n• Build design systems with reusable atomic components and comprehensive token guides.\n• Work directly with frontend engineers to ensure high-fidelity implementation.',
      requirements: '• 4+ years designing B2B and consumer web/mobile products.\n• Strong portfolio demonstrating mastery of interaction design, typography, and visual hierarchy.\n• Proficiency in Figma, prototyping tools, and basic understanding of CSS/HTML.',
      benefits: '• Modern Mac workstation & ergonomic equipment\n• Flexible hours and remote setup\n• Health, dental & vision benefits',
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping', 'Wireframing'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: pixelcraft.id,
      title: 'Design Systems & UI Engineer',
      slug: 'design-systems-ui-engineer-pixelcraft',
      category: 'Design',
      jobType: 'FULL_TIME',
      experienceLevel: 'MID',
      remoteStatus: 'HYBRID',
      location: 'Austin, TX',
      salaryMin: 115000,
      salaryMax: 145000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Bridge the gap between design and engineering by creating accessible, themeable UI components in React and Tailwind.',
      responsibilities: '• Build headless accessible components using Radix UI and Tailwind CSS.\n• Maintain Storybook documentation and automated visual regression testing.\n• Collaborate with designers to translate Figma variables into code tokens.',
      requirements: '• 3+ years in frontend development with specific focus on UI components and design systems.\n• Mastery of React, TypeScript, CSS-in-JS / Tailwind, and a11y standards.',
      benefits: '• Health & Dental\n• Generous paid vacation\n• Creative studio workspace in downtown Austin',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Storybook', 'Figma', 'Accessibility (a11y)'],
    },
    {
      recruiterId: recruiter2.id,
      companyId: fintech.id,
      title: 'Quantitative Software Engineer',
      slug: 'quantitative-software-engineer-fintech-global',
      category: 'Engineering',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      remoteStatus: 'ON_SITE',
      location: 'Chicago, IL',
      salaryMin: 180000,
      salaryMax: 250000,
      salaryCurrency: 'USD',
      isFeatured: true,
      status: 'PUBLISHED',
      description: 'Develop low-latency algorithmic trading infrastructure, order routing algorithms, and real-time risk evaluation engines.',
      responsibilities: '• Design microsecond-level execution algorithms and market data feeds.\n• Collaborate with quantitative researchers to backtest and implement statistical models.\n• Optimize memory caches, kernel bypass networking (Solarflare/DPDK).',
      requirements: '• 5+ years in C++ (17/20) or modern Java in high-frequency trading or low-latency fintech.\n• Solid understanding of concurrency, lock-free data structures, and CPU cache hierarchies.\n• Degree in Computer Science, Physics, Math, or related field.',
      benefits: '• Lucrative annual performance bonus\n• Catered gourmet breakfast & lunch\n• Comprehensive healthcare and retirement matching',
      skills: ['C++', 'Java', 'Algorithms', 'Low Latency', 'Financial Markets', 'Multi-threading'],
    },
    {
      recruiterId: recruiter2.id,
      companyId: fintech.id,
      title: 'FinTech Security & Compliance Engineer',
      slug: 'fintech-security-compliance-engineer-fintech-global',
      category: 'Engineering',
      jobType: 'FULL_TIME',
      experienceLevel: 'MID',
      remoteStatus: 'HYBRID',
      location: 'Chicago, IL',
      salaryMin: 125000,
      salaryMax: 160000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Strengthen the perimeter and security posture of our financial processing networks, encryption keys, and SOC 2 / PCI-DSS controls.',
      responsibilities: '• Conduct threat modeling, vulnerability assessments, and penetration testing.\n• Implement zero-trust network access (ZTNA) and automated secret rotation.\n• Audit cloud security configurations across AWS and on-premise data centers.',
      requirements: '• 3+ years in application security, cloud security, or cryptographic engineering.\n• Familiarity with PCI-DSS, SOC 2, ISO 27001 compliance standards.\n• Experience with SIEM tools, SAST/DAST scanners, and incident response.',
      benefits: '• Excellent health insurance\n• 401(k) match\n• Continuing education and security certification sponsorships',
      skills: ['Cybersecurity', 'Application Security', 'AWS Security', 'Cryptography', 'Compliance', 'Python'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: techcorp.id,
      title: 'Senior Product Manager - Developer Experience',
      slug: 'senior-product-manager-devex-techcorp',
      category: 'Product',
      jobType: 'FULL_TIME',
      experienceLevel: 'SENIOR',
      remoteStatus: 'HYBRID',
      location: 'San Francisco, CA',
      salaryMin: 150000,
      salaryMax: 185000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Define the roadmap and drive adoption for our developer APIs, CLI tools, and cloud SDKs used by millions of software engineers.',
      responsibilities: '• Conduct user interviews with enterprise developers and synthesize telemetry data.\n• Write detailed PRDs, feature specs, and user stories.\n• Coordinate launches across engineering, developer relations, and marketing.',
      requirements: '• 4+ years in product management with technical developer-facing products.\n• Prior experience as a software engineer or strong technical background.\n• Exceptional communication and stakeholder alignment skills.',
      benefits: '• Top-tier compensation & equity\n• Full medical coverage\n• Flexible hybrid schedule',
      skills: ['Product Management', 'Developer Tools', 'API Design', 'User Research', 'Agile / Scrum'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: pixelcraft.id,
      title: 'Junior Web Developer (React & TypeScript)',
      slug: 'junior-web-developer-pixelcraft',
      category: 'Engineering',
      jobType: 'FULL_TIME',
      experienceLevel: 'ENTRY',
      remoteStatus: 'REMOTE',
      location: 'Austin, TX (Remote Allowed)',
      salaryMin: 65000,
      salaryMax: 85000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Kickstart your career at PixelCraft Studio! We are seeking an enthusiastic junior developer eager to build engaging landing pages and interactive web applications.',
      responsibilities: '• Implement responsive UI layouts using React, Next.js, and Tailwind CSS.\n• Write clean, maintainable TypeScript code with unit tests.\n• Participate in team sprint planning and pair programming sessions.',
      requirements: '• Bachelor’s in CS or completion of reputable coding bootcamp / demonstrable project portfolio.\n• Solid understanding of JavaScript/TypeScript, React fundamentals, HTML5, and CSS3.\n• Eagerness to learn and take feedback constructively.',
      benefits: '• Structured mentorship program with senior developers\n• Health insurance stipend\n• Generous equipment allowance',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'HTML5', 'CSS3', 'Git'],
    },
    {
      recruiterId: recruiter2.id,
      companyId: innovatelabs.id,
      title: 'Technical Product Marketing Manager',
      slug: 'technical-product-marketing-manager-innovatelabs',
      category: 'Marketing',
      jobType: 'FULL_TIME',
      experienceLevel: 'MID',
      remoteStatus: 'REMOTE',
      location: 'New York, NY (Remote Allowed)',
      salaryMin: 120000,
      salaryMax: 150000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Translate complex AI model breakthroughs into compelling narratives, launch campaigns, and developer documentation.',
      responsibilities: '• Lead go-to-market strategies for new AI model releases and developer APIs.\n• Create whitepapers, benchmark reports, and interactive demos.\n• Manage community channels and developer hackathons.',
      requirements: '• 3+ years in technical product marketing or developer advocacy in B2B SaaS/AI.\n• Ability to understand and articulate deep learning concepts to technical audiences.',
      benefits: '• Equity package\n• Health, dental & vision\n• Remote travel allowance',
      skills: ['Product Marketing', 'Developer Relations', 'Technical Writing', 'AI & ML Concepts', 'GTM Strategy'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: cloudscale.id,
      title: 'Enterprise Solutions Architect',
      slug: 'enterprise-solutions-architect-cloudscale',
      category: 'Engineering',
      jobType: 'FULL_TIME',
      experienceLevel: 'LEAD',
      remoteStatus: 'HYBRID',
      location: 'Seattle, WA',
      salaryMin: 165000,
      salaryMax: 215000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Help Fortune 500 enterprises architect, migrate, and modernize their mission-critical applications on CloudScale Systems.',
      responsibilities: '• Deliver technical architecture reviews and cloud migration blueprints.\n• Lead proof-of-concept (PoC) implementations for strategic enterprise clients.\n• Act as the technical liaison between enterprise customers and core engineering.',
      requirements: '• 7+ years of experience in cloud architecture, enterprise presales, or solutions engineering.\n• AWS / GCP Certified Solutions Architect Professional credentials.\n• Deep knowledge of microservices, networking, and multi-tenant security.',
      benefits: '• Comprehensive salary + quarterly performance incentive\n• Full healthcare package\n• Executive coaching and professional development',
      skills: ['Cloud Architecture', 'AWS', 'Kubernetes', 'Enterprise Software', 'Client Strategy'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: techcorp.id,
      title: 'Data Platform Engineer (Snowflake & Spark)',
      slug: 'data-platform-engineer-techcorp',
      category: 'Data Science',
      jobType: 'FULL_TIME',
      experienceLevel: 'MID',
      remoteStatus: 'REMOTE',
      location: 'San Francisco, CA (Remote Allowed)',
      salaryMin: 135000,
      salaryMax: 170000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Design and optimize data pipelines ingestion from millions of IoT sensors and event streams into our Snowflake data warehouse.',
      responsibilities: '• Build automated ETL/ELT pipelines using Apache Spark, dbt, and Airflow.\n• Optimize SQL query latency and data warehouse storage models.\n• Ensure data quality and automated anomaly detection.',
      requirements: '• 3+ years in data engineering with Python, SQL, and distributed compute frameworks.\n• Hands-on experience with Snowflake, Databricks, or BigQuery.\n• Experience with Airflow or Dagster orchestration.',
      benefits: '• High-tier salary & equity\n• Full healthcare package\n• Remote flexibility',
      skills: ['Python', 'SQL', 'Snowflake', 'Apache Spark', 'dbt', 'Airflow'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: techcorp.id,
      title: 'Part-Time Full Stack Web Engineer',
      slug: 'part-time-full-stack-web-engineer-techcorp',
      category: 'Engineering',
      jobType: 'PART_TIME',
      experienceLevel: 'MID',
      remoteStatus: 'REMOTE',
      location: 'San Francisco, CA (Remote Allowed)',
      salaryMin: 65000,
      salaryMax: 90000,
      salaryCurrency: 'USD',
      isFeatured: true,
      status: 'PUBLISHED',
      description: 'TechCorp is looking for a flexible Part-Time Full Stack Engineer to support open-source tooling, documentation integrations, and microservice feature extensions (20 hrs/week).',
      responsibilities: '• Maintain developer documentation portals and sample apps in Next.js.\n• Build REST and GraphQL endpoint integrations.\n• Fix critical bugs and write unit tests.',
      requirements: '• 3+ years experience in React, TypeScript, and Node.js.\n• Self-directed with great async communication skills.',
      benefits: '• Flexible 20 hrs/week schedule\n• Pro-rated competitive hourly/salary compensation\n• Home office equipment allowance',
      skills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL'],
    },
    {
      recruiterId: recruiter2.id,
      companyId: innovatelabs.id,
      title: 'Part-Time Machine Learning Data Annotator & QA',
      slug: 'part-time-ml-data-annotator-innovatelabs',
      category: 'Data Science',
      jobType: 'PART_TIME',
      experienceLevel: 'ENTRY',
      remoteStatus: 'REMOTE',
      location: 'New York, NY (Remote Allowed)',
      salaryMin: 45000,
      salaryMax: 60000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Review and evaluate model outputs, curate specialized benchmark datasets, and audit LLM safety guardrails on a flexible part-time basis.',
      responsibilities: '• Benchmark model reasoning chains against ground truth responses.\n• Label multimodal vision-language datasets.\n• Collaborate with research scientists on RLHF evaluation.',
      requirements: '• Strong analytical and critical reasoning skills.\n• Basic familiarity with Python and AI concepts is a plus.',
      benefits: '• Flexible hours\n• Exposure to frontier generative AI workflows',
      skills: ['Data Quality', 'NLP', 'Python', 'Machine Learning', 'Evaluation'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: cloudscale.id,
      title: 'Contract Cloud Security & SOC 2 Specialist',
      slug: 'contract-cloud-security-soc2-cloudscale',
      category: 'DevOps',
      jobType: 'CONTRACT',
      experienceLevel: 'SENIOR',
      remoteStatus: 'REMOTE',
      location: 'Seattle, WA (Remote Allowed)',
      salaryMin: 140000,
      salaryMax: 175000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: '6-month contract role to lead SOC 2 Type II audit readiness, AWS IAM least-privilege automation, and Kubernetes cluster hardening.',
      responsibilities: '• Automate cloud security posture management across multi-account AWS orgs.\n• Remediate vulnerability scan findings and lead penetration testing drills.\n• Author security runbooks and policies.',
      requirements: '• 5+ years in cloud infrastructure security and compliance.\n• Deep knowledge of AWS, Terraform, and Kubernetes security contexts.',
      benefits: '• High-tier contract hourly rate\n• Fully remote engagement',
      skills: ['AWS Security', 'Kubernetes', 'Terraform', 'SOC 2', 'IAM'],
    },
    {
      recruiterId: recruiter2.id,
      companyId: fintech.id,
      title: 'Summer Software Engineering Intern (Web & Mobile)',
      slug: 'summer-swe-intern-fintech-global',
      category: 'Engineering',
      jobType: 'INTERNSHIP',
      experienceLevel: 'ENTRY',
      remoteStatus: 'HYBRID',
      location: 'Chicago, IL',
      salaryMin: 55000,
      salaryMax: 70000,
      salaryCurrency: 'USD',
      isFeatured: true,
      status: 'PUBLISHED',
      description: 'Join FinTech Global for an immersive 12-week paid engineering internship building real-time dashboard analytics and financial transaction APIs.',
      responsibilities: '• Ship production code alongside seasoned staff engineers.\n• Build interactive customer analytics charts and widgets.\n• Present capstone internship project to leadership.',
      requirements: '• Currently enrolled in a CS/Engineering degree program.\n• Proficiency in JavaScript/TypeScript, React, and Python or Java.',
      benefits: '• Paid 12-week summer internship\n• Housing stipend\n• Mentorship and full-time return offer potential',
      skills: ['TypeScript', 'React', 'Python', 'SQL', 'Algorithms'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: pixelcraft.id,
      title: 'Freelance UI/UX Visual & Iconography Designer',
      slug: 'freelance-uiux-visual-designer-pixelcraft',
      category: 'Design',
      jobType: 'FREELANCE',
      experienceLevel: 'MID',
      remoteStatus: 'REMOTE',
      location: 'Austin, TX (Remote Allowed)',
      salaryMin: 80000,
      salaryMax: 110000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'PUBLISHED',
      description: 'Freelance contract for creative designers to craft custom iconography sets, 3D asset illustrations, and promotional landing page mockups for tech startups.',
      responsibilities: '• Design custom vector icon packs in SVG format.\n• Create high-impact hero illustrations for product launches.\n• Collaborate with frontend developers on responsive assets.',
      requirements: '• Strong design portfolio demonstrating visual design and iconography.\n• Mastery of Figma, Illustrator, and SVG optimization.',
      benefits: '• Flexible freelance project milestones\n• Creative freedom',
      skills: ['Figma', 'Illustrator', 'Iconography', 'UI Design', 'Visual Design'],
    },
    {
      recruiterId: recruiter1.id,
      companyId: techcorp.id,
      title: 'Draft Intern - Mobile iOS Developer',
      slug: 'draft-intern-mobile-ios-techcorp',
      category: 'Engineering',
      jobType: 'INTERNSHIP',
      experienceLevel: 'ENTRY',
      remoteStatus: 'HYBRID',
      location: 'San Francisco, CA',
      salaryMin: 50000,
      salaryMax: 65000,
      salaryCurrency: 'USD',
      isFeatured: false,
      status: 'DRAFT',
      description: 'Draft job for upcoming summer mobile development internship program.',
      responsibilities: '• Learn Swift & SwiftUI.\n• Build mobile components.',
      requirements: '• Passion for iOS development.\n• Swift basics.',
      benefits: '• Mentorship',
      skills: ['Swift', 'SwiftUI', 'iOS'],
    },
  ];

  const createdJobs = [];
  for (const j of jobsData) {
    const { skills, ...jobFields } = j;
    const job = await prisma.job.create({
      data: {
        ...jobFields,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        skills: {
          create: skills.map((s) => ({ skillName: s })),
        },
      },
    });
    createdJobs.push(job);
  }

  // 6. Create Applications
  const alexUser = candidateUsers[0];
  const priyaUser = candidateUsers[1];
  const jamesUser = candidateUsers[2];
  const elenaUser = candidateUsers[3];
  const michaelUser = candidateUsers[4];

  const alexResume = await prisma.resume.findFirst({ where: { candidateId: alexUser.id } });
  const priyaResume = await prisma.resume.findFirst({ where: { candidateId: priyaUser.id } });
  const jamesResume = await prisma.resume.findFirst({ where: { candidateId: jamesUser.id } });
  const elenaResume = await prisma.resume.findFirst({ where: { candidateId: elenaUser.id } });
  const michaelResume = await prisma.resume.findFirst({ where: { candidateId: michaelUser.id } });

  // Alex -> INTERVIEW with scheduled interview
  await prisma.application.create({
    data: {
      jobId: createdJobs[0].id,
      candidateId: alexUser.id,
      resumeId: alexResume?.id,
      status: 'INTERVIEW',
      coverLetter: 'I am thrilled to apply for the Senior Full Stack Engineer role at TechCorp. With 6+ years of building Next.js and PostgreSQL production architectures, I am confident I can make an immediate impact on your core cloud platform.',
      recruiterNotes: 'Exceptional background in Next.js 14 and distributed systems. Passed initial screening with flying colors.',
      rating: 5,
      interview: {
        create: {
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          timeSlot: '02:00 PM - 03:00 PM EST',
          meetingUrl: 'https://meet.google.com/qwe-rtyu-iop',
          meetingType: 'TECHNICAL',
          notes: 'System design and live coding session with Lead Architect.',
          status: 'SCHEDULED',
        },
      },
    },
  });

  // Priya -> SHORTLISTED
  await prisma.application.create({
    data: {
      jobId: createdJobs[1].id,
      candidateId: priyaUser.id,
      resumeId: priyaResume?.id,
      status: 'SHORTLISTED',
      coverLetter: 'I have spent the last 7 years perfecting accessible design systems and Next.js performance at scale. Leading TechCorp’s frontend architecture aligns perfectly with my career goals.',
      recruiterNotes: 'Remarkable design systems background. Shortlisted for upcoming team panel.',
      rating: 5,
    },
  });

  // Elena -> UNDER_REVIEW
  await prisma.application.create({
    data: {
      jobId: createdJobs[2].id,
      candidateId: elenaUser.id,
      resumeId: elenaResume?.id,
      status: 'UNDER_REVIEW',
      coverLetter: 'My research in scalable RAG architectures and PyTorch inference makes me a strong fit for InnovateLabs’ high-throughput model serving platform.',
      recruiterNotes: 'Strong research credentials from MIT. Reviewing code samples.',
      rating: 4,
    },
  });

  // James -> SELECTED
  await prisma.application.create({
    data: {
      jobId: createdJobs[4].id,
      candidateId: jamesUser.id,
      resumeId: jamesResume?.id,
      status: 'SELECTED',
      coverLetter: 'Having built multi-region Kubernetes clusters across AWS and GCP, I am eager to join CloudScale Systems.',
      recruiterNotes: 'Offer extended and accepted! Onboarding next month.',
      rating: 5,
    },
  });

  // Michael -> APPLIED
  await prisma.application.create({
    data: {
      jobId: createdJobs[6].id,
      candidateId: michaelUser.id,
      resumeId: michaelResume?.id,
      status: 'APPLIED',
      coverLetter: 'My work centers around crafting accessible design systems and conversion-tested user journeys. Excited about PixelCraft’s vision!',
      rating: 0,
    },
  });

  // 7. Create Saved Jobs
  await prisma.savedJob.create({
    data: {
      candidateId: alexUser.id,
      jobId: createdJobs[2].id,
    },
  });

  await prisma.savedJob.create({
    data: {
      candidateId: alexUser.id,
      jobId: createdJobs[5].id,
    },
  });

  console.log('✅ CareerHub Database Successfully Seeded:');
  console.log(`   - 1 Admin: ${admin.email}`);
  console.log(`   - 2 Recruiters: ${recruiter1.email}, ${recruiter2.email}`);
  console.log(`   - ${candidateUsers.length} Candidates with full profiles and uploaded resumes`);
  console.log(`   - 5 Companies`);
  console.log(`   - ${createdJobs.length} Diverse Jobs across multiple categories and seniority levels`);
  console.log('   - Applications across all ATS stages');
  console.log('   - Active Interview Scheduled with Meeting Link');
  console.log('   - Bookmarked Saved Jobs');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
