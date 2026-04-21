"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Phone, 
  DollarSign, 
  UserPlus,
  Filter,
  ArrowRight,
  Lock,
  Trash2
} from 'lucide-react';
import { LuxuryButton } from '@/components/ui/LuxuryButton';
import { LuxuryInput } from '@/components/ui/LuxuryInput';
import { fetchApi } from '@/lib/api';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

export default function WorkersPage() {
  const [search, setSearch] = useState('');
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    salary: '',
    role: 'User'
  });

  const getWorkers = async () => {
    try {
      const data = await fetchApi('/workers');
      setWorkers(data);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getWorkers();
  }, []);

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/workers', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary)
        })
      });
      showToast('Worker registered successfully', 'success');
      setShowForm(false);
      setFormData({ name: '', phone: '', password: '', salary: '', role: 'User' });
      getWorkers();
    } catch (err: any) {
      showToast(err.message || 'Failed to create worker', 'error');
    }
  };

  const handleDeleteWorker = async (id: string) => {
    if (!confirm('Are you sure you want to remove this worker?')) return;
    try {
      await fetchApi(`/workers/${id}`, { method: 'DELETE' });
      showToast('Worker removed from registry', 'success');
      getWorkers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete worker', 'error');
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.phone.includes(search)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Worker <span className="text-gold-gradient">Registry</span></h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-[2px]">Manage your specialized workforce</p>
        </div>
        
        {!showForm && (
          <LuxuryButton onClick={() => setShowForm(true)} className="w-auto px-8 flex items-center gap-2">
            <UserPlus size={18} />
            ADD NEW WORKER
          </LuxuryButton>
        )}
      </div>
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass glass-gold rounded-[2.5rem] p-8 lg:p-12 mb-10"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-bold tracking-tight text-gold">Register New Worker</h2>
              <button onClick={() => setShowForm(false)} className="text-[10px] uppercase font-bold text-white/30 hover:text-white transition-colors">Cancel</button>
            </div>

            <form onSubmit={handleCreateWorker} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <LuxuryInput label="Full Name" icon={UserPlus} placeholder="e.g. John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <LuxuryInput label="Phone Number" icon={Phone} placeholder="e.g. +971..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <LuxuryInput label="Initial Password" icon={Lock} type="password" placeholder="e.g. securePass123" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              <LuxuryInput label="Monthly Salary (AED)" icon={DollarSign} placeholder="e.g. 5000" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} />
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[2px] text-gold/60 ml-1">Assigned Role</label>
                <select 
                  className="w-full bg-obsidian border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-gold/30 appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="User">Standard User</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end">
                 <LuxuryButton type="submit" className="w-full md:w-auto px-20 text-black">
                  CONFIRM REGISTRATION
                </LuxuryButton>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or phone..."
            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="px-6 py-4 rounded-2xl glass hover:bg-white/5 transition-colors flex items-center gap-2 text-sm font-medium text-white/60">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Workers Table/List */}
      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Worker Details</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Salary</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold">Status</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[2px] text-white/40 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-white/20 uppercase tracking-[2px] text-xs font-bold">
                    Retrieving worker data...
                  </td>
                </tr>
              ) : filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-white/20 uppercase tracking-[2px] text-xs font-bold">
                    No workers found.
                  </td>
                </tr>
              ) : filteredWorkers.map((worker, i) => (
                <motion.tr 
                  key={worker._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-obsidian border border-gold/10 rounded-xl flex items-center justify-center text-gold font-bold">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-wide">{worker.name}</h4>
                        <p className="text-[10px] text-white/30 flex items-center gap-1 mt-1 uppercase">
                          <Phone size={10} className="text-gold/40" /> {worker.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <span className="text-white/30">AED</span>
                      <span className="text-white/80">{worker.salary.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-white/20 uppercase tracking-wider mt-1">Monthly Pay</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`
                      px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${worker.status === 'Active' ? 'bg-green-400/10 text-green-400' : 'bg-white/5 text-white/20'}
                    `}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                       <button 
                        onClick={() => handleDeleteWorker(worker._id)}
                        className="p-2 hover:text-red-400 transition-colors text-white/10 hover:bg-red-400/5 rounded-lg"
                        title="Delete Worker"
                       >
                        <Trash2 size={18} />
                      </button>
                       <button className="p-2 hover:text-gold transition-colors text-white/20">
                        <ArrowRight size={18} />
                      </button>
                      <button className="p-2 hover:text-gold transition-colors text-white/20">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
