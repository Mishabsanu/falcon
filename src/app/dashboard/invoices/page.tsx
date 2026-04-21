"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  DollarSign, 
  Download, 
  Eye, 
  MoreVertical,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const getInvoices = async () => {
    try {
      const data = await fetchApi('/invoices');
      setInvoices(data);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getInvoices();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetchApi(`/invoices/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      showToast(`Invoice marked as ${status}`, 'success');
      getInvoices();
    } catch (err: any) {
      showToast(err.message || 'Failed to update invoice', 'error');
    }
  };

  const totalUnpaid = invoices
    .filter(inv => inv.status === 'Unpaid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & <span className="text-gold-gradient">Invoices</span></h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-[2px]">Financial oversight & settlement tracking</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass px-6 py-4 rounded-2xl flex items-center gap-3 border border-red-400/10">
             <div className="text-[10px] uppercase tracking-[2px] text-white/20 font-bold">Total Unpaid:</div>
             <div className="text-lg font-bold text-red-400">AED {totalUnpaid.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <StatsCard label="Revenue History" value={`AED ${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}`} change="Live" icon={DollarSign} color="text-green-400" />
         <StatsCard label="Unpaid Count" value={invoices.filter(inv => inv.status === 'Unpaid').length.toString()} change="Action Needed" icon={FileText} color="text-gold" />
         <StatsCard label="Settled Count" value={invoices.filter(inv => inv.status === 'Paid').length.toString()} change="Synced" icon={Clock} color="text-white/40" />
      </div>

      {/* Invoices List */}
      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <h3 className="font-bold tracking-wide">All Transactions</h3>
           <button className="p-3 hover:bg-white/5 rounded-xl transition-colors text-white/40"><Download size={20} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Invoice Ref</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Client / Service</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Amount</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Status</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-white/20 uppercase tracking-[2px] text-xs font-bold">
                    Fetching records...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-white/20 uppercase tracking-[2px] text-xs font-bold">
                    No invoices found.
                  </td>
                </tr>
              ) : invoices.map((inv, i) => (
                <motion.tr 
                  key={inv._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <span className="font-mono text-xs text-gold/60">#{inv._id.slice(-6).toUpperCase()}</span>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">{new Date(inv.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <h4 className="font-bold text-sm tracking-wide">{inv.breakdown_id?.client_name || 'General Client'}</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Ref: {inv.breakdown_id?._id?.slice(-6).toUpperCase() || 'N/A'}</p>
                  </td>
                  <td className="px-8 py-6 font-bold text-sm">AED {inv.amount.toLocaleString()}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${inv.status === 'Paid' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-gold shadow-[0_0_8px_#D4AF37]'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${inv.status === 'Paid' ? 'text-green-400' : 'text-gold'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                       {inv.status === 'Unpaid' && (
                         <button 
                           onClick={() => handleUpdateStatus(inv._id, 'Paid')}
                           className="px-4 py-2 bg-green-400/10 hover:bg-green-400 text-green-400 hover:text-black rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-green-400/20"
                         >
                           Settle Now
                         </button>
                       )}
                       <button className="p-2 glass hover:border-gold/30 transition-all text-white/40 hover:text-gold">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-white/20 hover:text-white transition-colors">
                        <Download size={16} />
                      </button>
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

function StatsCard({ label, value, change, icon: Icon, color }: any) {
  return (
    <div className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-white/5 rounded-2xl ${color}`}>
          <Icon size={24} />
        </div>
        <span className="text-[9px] font-bold px-2 py-1 bg-white/5 rounded-full text-white/40 uppercase tracking-widest">{change}</span>
      </div>
      <p className="text-[9px] uppercase tracking-[2px] text-white/20 font-bold">{label}</p>
      <h4 className="text-2xl font-bold tracking-tight mt-1">{value}</h4>
      <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-full blur-xl -mr-8 -mt-8" />
    </div>
  );
}
