'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Code2,
  History,
  BarChart2,
  Target,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'OVERVIEW', href: '/dashboard', icon: LayoutDashboard },
    { name: 'PRACTICE', href: '/practice', icon: Code2 },
    { name: 'PROGRESS', href: '/progress', icon: BarChart2 },
    { name: 'HISTORY', href: '/history', icon: History },
    { name: 'GOALS', href: '/goals', icon: Target },
    { name: 'SETTINGS', href: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface-container-low border-r border-outline-variant py-6 text-on-surface">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-black tracking-tight text-primary">
            DSA_Dash
          </h1>
          <p className="font-mono text-[11px] text-on-surface-variant mt-0.5 tracking-wider uppercase">
            v1.0.0 • ADAPTIVE DSA
          </p>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-on-surface-variant hover:text-on-surface"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-6 py-2.5 text-xs font-mono transition-all duration-150 ease-in-out ${isActive
                ? 'border-l-2 border-primary bg-surface-container text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
            >
              <Icon className="w-4 h-4 mr-3 shrink-0" />
              <span className="tracking-widest uppercase">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer & Actions */}
      <div className="px-6 pt-4 border-t border-outline-variant space-y-2">
        <Link
          href="/onboarding"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center w-full px-3 py-2 rounded-sm text-xs font-mono text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 mr-2 text-primary shrink-0" />
          <span>RE-RUN ONBOARDING</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-3 py-2 rounded-sm text-xs font-mono text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 mr-2 shrink-0" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar Header */}
      <div className="md:hidden flex items-center justify-between bg-surface-container-low border-b border-outline-variant px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <span className="font-headline-lg font-black text-primary text-lg">ALGO_CORE</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-on-surface-variant hover:text-on-surface"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-full z-50">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[240px] z-20">
        {sidebarContent}
      </aside>
    </>
  );
}
