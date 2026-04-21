"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  XCircle,
  Download,
  Filter
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function AttendancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const getAttendance = async () => {
    try {
      const data = await fetchApi('/attendance');
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      await fetchApi('/attendance/checkin', { method: 'POST' });
      showToast('Checked in successfully', 'success');
      getAttendance();
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    }
  };

  const handleCheckOut = async () => {
    try {
      await fetchApi('/attendance/checkout', { method: 'PUT' });
      showToast('Checked out successfully', 'success');
      getAttendance();
    } catch (err: any) {
      showToast(err.message || 'Check-out failed', 'error');
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shift <span className="text-gold-gradient">Logs</span></h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-[2px]">Daily workforce presence tracking</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-6 py-4 rounded-2xl glass hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-medium text-white/60">
            <Download size={18} />
            Export CSV
          </button>
          <button className="px-6 py-4 rounded-2xl bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors flex items-center gap-2 text-sm font-bold">
            <Calendar size={18} />
            SELECT DATE
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard icon={LogIn} label="Active Shifts" value={logs.filter(l => !l.outTime).length.toString()} color="text-green-400" />
        <SummaryCard icon={LogOut} label="Total logs (Today)" value={logs.length.toString()} color="text-gold" />
        <div className="glass p-6 rounded-3xl border border-gold/10 flex flex-col gap-3">
          <button onClick={handleCheckIn} className="w-full py-3 bg-gold text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-gold-light transition-colors">Mark Check-In</button>
          <button onClick={handleCheckOut} className="w-full py-3 bg-white/5 text-gold border border-gold/20 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-gold/5 transition-colors">Check-Out</button>
        </div>
      </div>

      {/* Attendance List */}
      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h3 className="font-bold tracking-wide">Workforce Attendance Log</h3>
          <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase tracking-wider">
            <Clock size={14} className="text-gold/40" />
            Live Updates Enabled
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Worker</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Check-In</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Check-Out</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-white/20 uppercase tracking-[2px] text-xs font-bold">
                    Syncing logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-white/20 uppercase tracking-[2px] text-xs font-bold">
                    No attendance logs for today.
                  </td>
                </tr>
              ) : logs.map((log, i) => (
                <motion.tr 
                  key={log._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 font-bold text-xs border border-white/5">
                        {log.user_id?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{log.user_id?.name || 'Unknown'}</h4>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-medium text-white/80">{log.in_time}</td>
                  <td className="px-8 py-6 text-sm font-medium text-white/40">{log.out_time || '--:--'}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       {!log.out_time ? (
                         <>
                           <Clock size={14} className="text-gold animate-pulse" />
                           <span className="text-[10px] font-bold uppercase tracking-wider text-gold">On-Shift</span>
                         </>
                       ) : (
                         <>
                           <CheckCircle2 size={14} className="text-green-400" />
                           <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Completed</span>
                         </>
                       )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="glass p-6 rounded-3xl border border-white/5 flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-[2px] text-white/30 font-bold">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}
