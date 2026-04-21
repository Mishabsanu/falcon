"use client";
import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { LayoutDashboard, Users, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'User'] },
    { href: '/dashboard/attendance', icon: Clock, roles: ['Admin', 'User'] },
    { href: '/dashboard/breakdowns', icon: AlertCircle, roles: ['Admin', 'User'] },
    { href: '/dashboard/workers', icon: Users, roles: ['Admin'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role || 'User'));

  return (
    <div className="flex bg-black min-h-screen text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gold/5 rounded-full blur-[120px] -z-10" />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-24 lg:pb-10">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden glass-gold glass p-4 flex justify-around items-center z-50 rounded-t-[2.5rem] border-t border-gold/20">
        {filteredItems.map(item => (
          <NavItem key={item.href} href={item.href} icon={item.icon} active={pathname === item.href} />
        ))}
      </nav>
    </div>
  );
}

function NavItem({ href, icon: Icon, active }: { href: string; icon: any; active: boolean }) {
  return (
    <Link href={href}>
      <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-gold text-black shadow-lg shadow-gold/30' : 'text-white/40'}`}>
        <Icon size={24} />
      </div>
    </Link>
  );
}
