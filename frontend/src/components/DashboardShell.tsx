import React from 'react';
import { Link } from 'react-router-dom';

type DashboardRole = 'student' | 'teacher';

interface DashboardShellProps {
  role: DashboardRole;
  children: React.ReactNode;
}

const navConfig: Record<DashboardRole, { label: string; icon: string; href: string }[]> = {
  student: [
    { label: 'Dashboard', icon: '🏠', href: '/student-dashboard' },
    { label: 'Profile', icon: '👤', href: '/student-dashboard' },
    { label: 'Payments', icon: '💳', href: '/student-dashboard' },
  ],
  teacher: [
    { label: 'Dashboard', icon: '🏫', href: '/teacher-dashboard' },
    { label: 'Students', icon: '👥', href: '/teacher-dashboard' },
    { label: 'Sections', icon: '🗂️', href: '/teacher-dashboard' },
  ],
};

export const DashboardShell: React.FC<DashboardShellProps> = ({ role, children }) => {
  const navItems = navConfig[role];

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="hidden lg:flex fixed inset-y-0 w-24 flex-col justify-between bg-[#6F42C1] text-white border-r border-white/10 py-10">
        <div className="flex flex-col items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col items-center gap-1 text-center text-[0.65rem] uppercase tracking-[0.24em] text-white/80 hover:text-white"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="hidden lg:block text-[0.6rem]">{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="text-center text-[0.55rem] uppercase tracking-[0.35em] text-white/70">Live</div>
      </aside>

      <main className="min-h-screen lg:ml-24">
        <div className="px-4 py-6 lg:px-10">{children}</div>
      </main>
    </div>
  );
};
