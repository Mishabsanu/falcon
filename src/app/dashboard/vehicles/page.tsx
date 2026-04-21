"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Plus, 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { LuxuryButton } from '@/components/ui/LuxuryButton';
import { LuxuryInput } from '@/components/ui/LuxuryInput';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { AnimatePresence } from 'framer-motion';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    vehicle_number: '',
    type: '',
    status: 'Available'
  });

  const getVehicles = async () => {
    try {
      const data = await fetchApi('/vehicles');
      setVehicles(data);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getVehicles();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/vehicles', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      showToast('Vehicle registered successfully', 'success');
      setShowForm(false);
      setFormData({ vehicle_number: '', type: '', status: 'Available' });
      getVehicles();
    } catch (err: any) {
      showToast(err.message || 'Failed to register vehicle', 'error');
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle <span className="text-gold-gradient">Master</span></h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-[2px]">Fleet inventory & operational status</p>
        </div>
        
        {!showForm && (
          <LuxuryButton onClick={() => setShowForm(true)} className="w-auto px-8 flex items-center gap-2">
            <Plus size={18} />
            REGISTER VEHICLE
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
              <h2 className="text-xl font-bold tracking-tight text-gold">Register New Fleet Asset</h2>
              <button onClick={() => setShowForm(false)} className="text-[10px] uppercase font-bold text-white/30 hover:text-white transition-colors">Cancel</button>
            </div>

            <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <LuxuryInput label="Vehicle Plate Number" icon={Car} placeholder="e.g. DXB 7721" value={formData.vehicle_number} onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})} />
              <LuxuryInput label="Vehicle Type / Model" icon={Settings} placeholder="e.g. Heavy Duty Tow" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} />
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-[2px] text-gold/60 ml-1">Current Status</label>
                <select 
                  className="w-full bg-obsidian border border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-gold/30 appearance-none"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Available">Available</option>
                  <option value="Busy">On Job</option>
                  <option value="Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end">
                 <LuxuryButton type="submit" className="w-full md:w-auto px-20 text-black">
                  ADD TO FLEET
                </LuxuryButton>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-white/20 uppercase tracking-[4px] text-sm font-bold">
            Synchronizing fleet data...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="col-span-full py-20 text-center text-white/20 uppercase tracking-[4px] text-sm font-bold">
            No registered vehicles found.
          </div>
        ) : vehicles.map((vehicle, i) => (
          <motion.div
            key={vehicle._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-[2rem] p-6 border border-white/5 relative group hover:border-gold/20 transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-3 bg-white/5 rounded-2xl text-gold group-hover:scale-110 transition-transform">
                <Car size={32} />
              </div>
              <div className="flex flex-col items-end">
                <span className={`
                  px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5
                  ${vehicle.status === 'Available' ? 'bg-green-400/10 text-green-400' : 
                    vehicle.status === 'Busy' ? 'bg-gold/10 text-gold' : 'bg-red-400/10 text-red-400'}
                `}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    vehicle.status === 'Available' ? 'bg-green-400' : 
                    vehicle.status === 'Busy' ? 'bg-gold' : 'bg-red-400'
                  }`} />
                  {vehicle.status}
                </span>
                <span className="text-[9px] text-white/20 uppercase tracking-widest mt-2">PLATE: {vehicle.vehicle_number}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold tracking-tight">{vehicle.vehicle_number}</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-[2px] font-medium mt-1">{vehicle.type}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-white/20" />
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Fleet Member</span>
              </div>
              <button className="text-white/20 hover:text-gold transition-colors">
                <Settings size={18} />
              </button>
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
          </motion.div>
        ))}
      </div>

      {/* Maintenance Summary */}
      <div className="glass rounded-[2.5rem] p-8 border border-red-400/10 bg-red-400/[0.02]">
        <div className="flex items-center gap-4 text-red-400">
          <AlertTriangle size={24} />
          <div>
            <h4 className="font-bold tracking-tight">Fleet Maintenance Alert</h4>
            <p className="text-xs text-red-400/60 uppercase tracking-wider mt-0.5">SHJ-8821 requires urgent service (Brake Pad Replacement)</p>
          </div>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
