"use client";
import { LuxuryButton } from '@/components/ui/LuxuryButton';
import { LuxuryInput } from '@/components/ui/LuxuryInput';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchApi } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Car,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Plus,
  User,
  UserPlus,
  Camera,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function BreakdownsPage() {
  const [showForm, setShowForm] = useState(false);
  const [isBilling, setIsBilling] = useState(false);
  const [completingBreakdown, setCompletingBreakdown] = useState<any>(null);
  const [endImage, setEndImage] = useState('');
  const [breakdowns, setBreakdowns] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [billingBreakdown, setBillingBreakdown] = useState<any>(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const { user } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    user_id: '',
    vehicle_id: '',
    client_name: '',
    client_vehicle_number: '',
    from_location: '',
    to_location: '',
    description: '',
    start_image: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'start' | 'end') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'start') {
          setFormData({ ...formData, start_image: reader.result as string });
        } else {
          setEndImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getBreakdowns = async () => {
    try {
      const [b, w, v] = await Promise.all([
        fetchApi('/breakdowns'),
        user?.role === 'Admin' ? fetchApi('/workers') : Promise.resolve([]),
        fetchApi('/vehicles')
      ]);
      setBreakdowns(b);
      setWorkers(w);
      setVehicles(v);
      
      // Auto-select current worker if not admin
      if (user && user.role !== 'Admin') {
        setFormData(prev => ({ ...prev, user_id: user._id }));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getBreakdowns();
    }
  }, [user]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.vehicle_id === '') delete payload.vehicle_id;
      if (payload.user_id === '') delete payload.user_id;

      await fetchApi('/breakdowns', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast('Breakdown entry recorded successfully', 'success');
      setShowForm(false);
      setFormData({
        user_id: user?.role === 'Admin' ? '' : (user?._id || ''),
        vehicle_id: '',
        client_name: '',
        client_vehicle_number: '',
        from_location: '',
        to_location: '',
        description: '',
        start_image: ''
      });
      getBreakdowns();
    } catch (err: any) {
      showToast(err.message || 'Failed to record breakdown', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string, end_image?: string) => {
    try {
      await fetchApi(`/breakdowns/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, end_image })
      });
      showToast(`Service status updated to ${status}`, 'success');
      getBreakdowns();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingBreakdown || !invoiceAmount) return;

    try {
      await fetchApi('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          breakdown_id: billingBreakdown._id,
          amount: Number(invoiceAmount),
          extra_charges: 0,
          notes: `Invoice for ${billingBreakdown.client_name}`
        })
      });
      showToast('Invoice generated successfully', 'success');
      setBillingBreakdown(null);
      setInvoiceAmount('');
      setIsBilling(false);
      getBreakdowns();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate invoice', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service <span className="text-gold-gradient">Entries</span></h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-[2px]">Core breakdown tracking & management</p>
        </div>
        
        {!showForm && !isBilling && (
          <LuxuryButton onClick={() => setShowForm(true)} className="w-auto px-8 flex items-center gap-2">
            <Plus size={18} />
            CREATE NEW ENTRY
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
            className="glass glass-gold rounded-[2.5rem] p-8 lg:p-12 relative"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-bold tracking-tight text-gold">New Breakdown Entry</h2>
              <button onClick={() => setShowForm(false)} className="text-[10px] uppercase font-bold text-white/30 hover:text-white transition-colors">Cancel</button>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[2px] text-gold/60 ml-1">Assigned Staff</label>
                <div className="relative group">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={18} />
                  <select 
                    className="w-full bg-obsidian border border-white/5 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:border-gold/30 appearance-none text-white/80 disabled:opacity-50"
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                    disabled={user?.role !== 'Admin'}
                  >
                    {user?.role === 'Admin' ? (
                      <>
                        <option value="">Select Worker...</option>
                        {workers.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                      </>
                    ) : (
                      <option value={user?._id}>{user?.name}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[2px] text-gold/60 ml-1">Assigned Fleet Unit</label>
                <div className="relative group">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={18} />
                  <select 
                    className="w-full bg-obsidian border border-white/5 rounded-2xl p-4 pl-12 text-sm focus:outline-none focus:border-gold/30 appearance-none text-white/80"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                  >
                    <option value="">Select Vehicle...</option>
                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.vehicle_number} - {v.type}</option>)}
                  </select>
                </div>
              </div>

              <LuxuryInput label="Client Name" icon={User} placeholder="e.g. John Doe" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} />
              <LuxuryInput label="Client Vehicle Number" icon={Car} placeholder="e.g. DXB 12345" value={formData.client_vehicle_number} onChange={(e) => setFormData({...formData, client_vehicle_number: e.target.value})} />
              <LuxuryInput label="From Location" icon={ArrowRight} placeholder="Pickup point" value={formData.from_location} onChange={(e) => setFormData({...formData, from_location: e.target.value})} />
              <LuxuryInput label="To Location" icon={ArrowRight} placeholder="Drop-off point" value={formData.to_location} onChange={(e) => setFormData({...formData, to_location: e.target.value})} />
              
              <div className="md:col-span-1">
                <label className="text-[10px] uppercase tracking-[2px] text-gold/60 ml-1 mb-2 block">Pickup Condition Photo</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="camera"
                    className="hidden" 
                    id="pickup-photo" 
                    onChange={(e) => handleFileUpload(e, 'start')} 
                  />
                  <label 
                    htmlFor="pickup-photo" 
                    className="flex items-center justify-center gap-3 w-full bg-obsidian border border-dashed border-white/10 rounded-2xl p-4 text-sm text-white/40 cursor-pointer hover:border-gold/30 hover:text-gold transition-all"
                  >
                    {formData.start_image ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gold/20">
                          <img src={formData.start_image} className="w-full h-full object-cover" alt="Pickup" />
                        </div>
                        <span className="text-gold font-bold">PHOTO CAPTURED</span>
                      </div>
                    ) : (
                      <>
                        <Camera size={18} />
                        TAKE PICKUP PHOTO
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="text-[10px] uppercase tracking-[2px] text-gold/60 ml-1 mb-2 block">Description / Notes</label>
                <textarea 
                  className="w-full bg-obsidian border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-gold/30 min-h-[58px] transition-all"
                  placeholder="Additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                 <LuxuryButton type="submit" className="w-full md:w-auto px-20">
                  SUBMIT ENTRY
                </LuxuryButton>
              </div>
            </form>
          </motion.div>
        ) : isBilling ? (
          <motion.div 
            key="billing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass glass-gold rounded-[2.5rem] p-8 lg:p-12 relative"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gold/10 rounded-2xl text-gold">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-gold">Generate Service Bill</h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-[2px]">Ref: #{billingBreakdown?._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => { setIsBilling(false); setBillingBreakdown(null); }} className="text-[10px] uppercase font-bold text-white/30 hover:text-white transition-colors">Cancel</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-white/20 tracking-widest">Client Name</span>
                    <p className="text-lg font-bold text-white">{billingBreakdown?.client_name}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-white/20 tracking-widest">Vehicle</span>
                    <p className="text-sm font-medium text-white/80">{billingBreakdown?.client_vehicle_number}</p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-white/20 tracking-widest">Route</span>
                      <p className="text-xs text-white/60">{billingBreakdown?.from_location} → {billingBreakdown?.to_location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 flex flex-col justify-center">
                <LuxuryInput 
                  label="Total Service Amount (AED)" 
                  icon={DollarSign} 
                  placeholder="e.g. 1500" 
                  value={invoiceAmount} 
                  onChange={(e) => setInvoiceAmount(e.target.value)} 
                />
                
                <div className="p-4 rounded-2xl bg-gold/5 border border-gold/10 text-[10px] text-gold/60 uppercase tracking-widest leading-relaxed">
                  Finalizing this bill will create an official invoice and mark this breakdown as <span className="text-white font-bold">BILLED</span>.
                </div>

                <div className="flex justify-end">
                  <LuxuryButton type="submit" className="w-full md:w-auto px-20 text-black">
                    GENERATE FINAL BILL
                  </LuxuryButton>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* List */}
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="py-20 text-center text-white/20 uppercase tracking-[4px] text-sm font-bold">
                  Loading service records...
                </div>
              ) : breakdowns.length === 0 ? (
                <div className="py-20 text-center text-white/20 uppercase tracking-[4px] text-sm font-bold">
                  No breakdown entries found.
                </div>
              ) : breakdowns.map((item, i) => (
                <motion.div 
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-6 rounded-3xl border border-white/5 hover:border-gold/20 transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-obsidian rounded-2xl border border-white/5 flex items-center justify-center text-gold/40 group-hover:text-gold transition-colors">
                        <Car size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-lg">{item.client_name}</h4>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                            item.status === 'Ongoing' ? 'bg-blue-400/10 text-blue-400' : 
                            item.status === 'Pending' ? 'bg-gold/10 text-gold' : 'bg-green-400/10 text-green-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40 uppercase tracking-[2px] mt-1 font-medium">{item.client_vehicle_number} • {new Date(item.createdAt).toLocaleTimeString()}</p>
                        
                        <div className="flex items-center gap-3 mt-3">
                          {item.user_id && (
                            <div className="flex items-center gap-1.5 text-[9px] text-gold/60 bg-gold/5 px-2 py-1 rounded-lg font-bold uppercase tracking-wider">
                              <User size={12} /> {item.user_id.name}
                            </div>
                          )}
                          {item.vehicle_id && (
                            <div className="flex items-center gap-1.5 text-[9px] text-white/30 bg-white/5 px-2 py-1 rounded-lg font-bold uppercase tracking-wider border border-white/5">
                              <Car size={12} /> {item.vehicle_id.vehicle_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 items-center gap-4 px-0 lg:px-10">
                      <div className="flex-1 flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-white/20 tracking-tighter">Pickup</span>
                        <span className="text-sm text-white/80 font-medium truncate">{item.from_location}</span>
                      </div>
                      <div className="text-gold/20"><ArrowRight size={12} /></div>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-white/20 tracking-tighter">Drop-off</span>
                        <span className="text-sm text-white/80 font-medium truncate">{item.to_location}</span>
                      </div>
                      <div className="flex flex-col ml-4">
                        <span className="text-[9px] uppercase font-bold text-white/20 tracking-tighter">Photos</span>
                        <div className="flex items-center gap-2 mt-1">
                          {item.start_image ? (
                             <div className="w-8 h-8 rounded-lg overflow-hidden border border-gold/20 group/img relative cursor-zoom-in">
                               <img src={item.start_image} className="w-full h-full object-cover" alt="S" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"><Eye size={10} className="text-white" /></div>
                             </div>
                          ) : <div className="w-8 h-8 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center"><ImageIcon size={12} className="text-white/10" /></div>}
                          
                          {item.end_image ? (
                             <div className="w-8 h-8 rounded-lg overflow-hidden border border-green-400/20 group/img relative cursor-zoom-in">
                               <img src={item.end_image} className="w-full h-full object-cover" alt="E" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"><Eye size={10} className="text-white" /></div>
                             </div>
                          ) : item.status === 'Completed' ? null : <div className="w-8 h-8 rounded-lg bg-white/5 border border-dashed border-white/10 flex items-center justify-center"><ImageIcon size={12} className="text-white/10" /></div>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.is_invoiced && (
                        <div className="px-4 py-2 bg-white/5 border border-white/10 text-white/20 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-green-400" />
                          Billed
                        </div>
                      )}
                      
                      {item.status === 'Completed' && !item.is_invoiced && user?.role === 'Admin' && (
                        <button 
                          onClick={() => { setBillingBreakdown(item); setIsBilling(true); }}
                          className="px-4 py-2 bg-green-400/10 hover:bg-green-400 text-green-400 hover:text-black rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                        >
                          <DollarSign size={14} />
                          Generate Bill
                        </button>
                      )}
                      
                      {item.status !== 'Completed' && (
                        <button 
                          onClick={() => setCompletingBreakdown(item)}
                          className="px-4 py-2 bg-gold/10 hover:bg-gold text-gold hover:text-black rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          Complete Service
                        </button>
                      )}
                      <button className="p-4 rounded-2xl bg-white/5 hover:bg-gold/10 hover:text-gold transition-all text-white/40">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {completingBreakdown && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCompletingBreakdown(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass glass-gold relative w-full max-w-md p-8 rounded-[2.5rem] overflow-hidden"
            >
              <h3 className="font-bold text-xl text-gold mb-2">Finalize Service</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[2px] mb-8">Please capture the delivery condition</p>
              
              <div className="space-y-6">
                <div className="relative group">
                  <input type="file" accept="image/*" capture="camera" className="hidden" id="end-photo" onChange={(e) => handleFileUpload(e, 'end')} />
                  <label htmlFor="end-photo" className="flex flex-col items-center justify-center gap-4 w-full aspect-video bg-obsidian border border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-gold/30 hover:bg-gold/5 transition-all overflow-hidden">
                    {endImage ? (
                      <img src={endImage} className="w-full h-full object-cover" alt="End" />
                    ) : (
                      <>
                        <Camera size={32} className="text-white/20" />
                        <span className="text-[10px] uppercase font-bold text-white/40">TAB TO TAKE DROP-OFF PHOTO</span>
                      </>
                    )}
                  </label>
                </div>
                
                <LuxuryButton 
                  onClick={() => {
                    handleUpdateStatus(completingBreakdown._id, 'Completed', endImage);
                    setCompletingBreakdown(null);
                    setEndImage('');
                  }}
                  className="w-full text-black"
                >
                  FINALIZE & SAVE
                </LuxuryButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
