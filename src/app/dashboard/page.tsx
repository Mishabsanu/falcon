"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Car, 
  AlertCircle, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  Bell,
  Clock
} from 'lucide-react';
import { LuxuryButton } from '@/components/ui/LuxuryButton';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    workers: '0',
    vehicles: '0',
    breakdowns: '0',
    revenue: '0'
  });
  const [recentBreakdowns, setRecentBreakdowns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        const isAdmin = user?.role === 'Admin';
        
        // Fetch only allowed data based on role
        const [w, v, b, i] = await Promise.allSettled([
          isAdmin ? fetchApi('/workers') : Promise.resolve([]),
          isAdmin ? fetchApi('/vehicles') : Promise.resolve([]),
          fetchApi('/breakdowns'),
          isAdmin ? fetchApi('/invoices') : Promise.resolve([])
        ]);

        const workersData = w.status === 'fulfilled' ? w.value : [];
        const vehiclesData = v.status === 'fulfilled' ? v.value : [];
        const breakdownsData = b.status === 'fulfilled' ? b.value : [];
        const invoicesData = i.status === 'fulfilled' ? i.value : [];

        if (isAdmin) {
          setCounts({
            workers: workersData.length.toString(),
            vehicles: vehiclesData.length.toString(),
            breakdowns: breakdownsData.filter((item: any) => item.status !== 'Completed').length.toString(),
            revenue: invoicesData.filter((item: any) => item.status === 'Paid')
                     .reduce((acc: number, inv: any) => acc + inv.amount, 0)
                     .toLocaleString()
          });
        } else {
          // Worker specific stats
          setCounts({
            workers: '-', // Hidden or generic
            vehicles: '-', 
            breakdowns: breakdownsData.filter((item: any) => item.status !== 'Completed').length.toString(),
            revenue: '-'
          });
        }
        setRecentBreakdowns(breakdownsData.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) getDashboardData();
  }, [user]);

  const stats = user?.role === 'Admin' ? [
    { label: 'Active Workers', value: counts.workers, icon: Users, change: '+12%', color: 'border-gold/20' },
    { label: 'Total Vehicles', value: counts.vehicles, icon: Car, change: 'Fleet Live', color: 'border-white/5' },
    { label: 'Pending Service', value: counts.breakdowns, icon: AlertCircle, change: 'Urgent', color: 'border-red-400/20' },
    { label: 'Revenue (Total Paid)', value: `AED ${counts.revenue}`, icon: DollarSign, change: 'Verified', color: 'border-gold/20' },
  ] : [
    { label: 'My Active Jobs', value: counts.breakdowns, icon: AlertCircle, change: 'Current', color: 'border-gold/20' },
    { label: 'Status', value: 'Active', icon: Clock, change: 'Synced', color: 'border-white/5' },
  ];

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-gold-gradient">{user?.name || 'Admin'}</span>
          </h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-[2px]">Falcon Systems Overview • April 22</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-4 rounded-2xl glass hover:bg-white/5 transition-colors relative">
            <Bell size={20} className="text-gold/60" />
            <div className="absolute top-4 right-4 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          </button>
          <LuxuryButton className="px-8 w-auto">
            + NEW BREAKDOWN
          </LuxuryButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass p-6 rounded-[2rem] border ${stat.color} relative overflow-hidden group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white/5 rounded-2xl text-gold group-hover:scale-110 transition-transform">
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                <TrendingUp size={12} />
                {stat.change}
              </div>
            </div>
            
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-[2px] font-medium">{stat.label}</p>
              <h3 className="text-4xl font-bold mt-1 tracking-tighter">{stat.value}</h3>
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl -mr-12 -mt-12" />
          </motion.div>
        ))}
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Breakdowns */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold tracking-tight">Recent Breakdowns</h3>
            <button className="text-[10px] text-gold uppercase tracking-[2px] font-bold flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="py-10 text-center text-white/20 uppercase tracking-[2px] text-xs font-bold">
                Retrieving recent activity...
              </div>
            ) : recentBreakdowns.length === 0 ? (
              <div className="py-10 text-center text-white/20 uppercase tracking-[2px] text-xs font-bold">
                No active breakdowns found.
              </div>
            ) : recentBreakdowns.map((item, i) => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/10 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-obsidian rounded-xl flex items-center justify-center border border-white/5 group-hover:border-gold/20 transition-colors">
                    <Car size={20} className="text-gold/40 group-hover:text-gold transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.clientVehicleNumber}</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">{item.fromLocation} • {new Date(item.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`
                    px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${item.status === 'Completed' ? 'bg-green-400/10 text-green-400' : 'bg-gold/10 text-gold'}
                  `}>
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="glass rounded-[2.5rem] p-8 relative overflow-hidden">
          <h3 className="text-xl font-bold tracking-tight mb-8">System Status</h3>
          <div className="space-y-6">
            <StatusItem label="API Services" status="Operational" color="bg-green-400" />
            <StatusItem label="Database" status="Synced" color="bg-green-400" />
            <StatusItem label="GPS Tracking" status="Active" color="bg-gold" />
            <StatusItem label="Worker Sync" status="2 Errors" color="bg-red-400" />
          </div>

          <div className="mt-12 p-6 rounded-[2rem] bg-gold/10 border border-gold/20 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={24} className="text-black" />
            </div>
            <h4 className="font-bold text-gold">Premium Support</h4>
            <p className="text-[10px] text-gold/60 mt-1 uppercase tracking-wider">Priority assistance enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status, color }: { label: string; status: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[1px] text-white/40">{status}</span>
        <div className={`w-2 h-2 rounded-full ${color} shadow-[0_0_8px_currentColor]`} />
      </div>
    </div>
  );
}
