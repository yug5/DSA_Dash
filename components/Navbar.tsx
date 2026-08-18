'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Target, Award, History, BarChart3, BookOpen, LogOut } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Target },
    { name: 'Practice', href: '/practice', icon: BookOpen },
    { name: 'History', href: '/history', icon: History },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
    { name: 'Goals', href: '/goals', icon: Award },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2 font-bold text-slate-900 text-lg">
              <span className="bg-slate-900 text-white px-2.5 py-1 rounded-md text-sm font-semibold">DSA</span>
              <span>Practice Platform</span>
            </Link>

            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/onboarding"
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded border border-slate-200"
            >
              Re-run Onboarding
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded border border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

