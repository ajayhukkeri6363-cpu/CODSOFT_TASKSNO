import React from 'react';
import Link from 'next/link';
import { Briefcase, Github, Linkedin, Twitter, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Career<span className="text-indigo-400">Hub</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Modern recruitment platform empowering software engineers, designers, and fast-growing tech companies to connect effortlessly.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">For Candidates</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/jobs" className="hover:text-white transition-colors">Browse All Jobs</Link></li>
              <li><Link href="/jobs?remote=REMOTE" className="hover:text-white transition-colors">Remote Positions</Link></li>
              <li><Link href="/candidate/profile" className="hover:text-white transition-colors">Candidate Profile</Link></li>
              <li><Link href="/candidate/resume" className="hover:text-white transition-colors">Resume Upload</Link></li>
              <li><Link href="/candidate/applications" className="hover:text-white transition-colors">Track Applications</Link></li>
            </ul>
          </div>

          {/* For Recruiters */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">For Recruiters</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/register?role=RECRUITER" className="hover:text-white transition-colors">Post a Job Opening</Link></li>
              <li><Link href="/recruiter/dashboard" className="hover:text-white transition-colors">Recruiter Dashboard</Link></li>
              <li><Link href="/recruiter/applications" className="hover:text-white transition-colors">Kanban ATS Pipeline</Link></li>
              <li><Link href="/recruiter/company" className="hover:text-white transition-colors">Company Branding</Link></li>
            </ul>
          </div>

          {/* Platform / Internship */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">CodSoft Task 3</h4>
            <p className="text-xs text-slate-400 mb-3">
              Built as Task 3 for the <strong>CodSoft Full Stack Web Development Internship</strong>.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300">
              <span>Stack: Next.js 14, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM.</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CareerHub — CodSoft Full Stack Internship Task 3. All rights reserved.</p>
          <p className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>by Ajay Hukkeri</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
