"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Car, 
  Clock, 
  AlertCircle, 
  FileText, 
  LayoutDashboard,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', roles: ['Admin', 'User'] },
  { icon: Users, label: 'Workers', href: '/dashboard/workers', roles: ['Admin'] },
  { icon: Car, label: 'Vehicles', href: '/dashboard/vehicles', roles: ['Admin'] },
  { icon: Clock, label: 'Attendance', href: '/dashboard/attendance', roles: ['Admin', 'User'] },
  { icon: AlertCircle, label: 'Breakdowns', href: '/dashboard/breakdowns', roles: ['Admin', 'User'] },
  { icon: FileText, label: 'Invoices', href: '/dashboard/invoices', roles: ['Admin'] },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || 'User'));

  return (
    <div className="h-screen w-72 glass border-r border-white/5 p-6 flex flex-col">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
          <Car size={20} className="text-black" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          <span className="text-gold italic">FALCON</span>
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        {filteredMenu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 5 }}
                className={`
                  flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gold/10 text-gold border border-gold/20' 
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-gold" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-4 w-full text-white/40 hover:text-red-400 transition-colors group"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
};
