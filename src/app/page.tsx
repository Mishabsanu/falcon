"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Lock, Car, ShieldCheck } from 'lucide-react';
import { LuxuryInput } from '@/components/ui/LuxuryInput';
import { LuxuryButton } from '@/components/ui/LuxuryButton';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password })
      });
      login(data);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--color-obsidian)_0%,_#000_100%)]">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md glass glass-gold rounded-[2.5rem] p-10 relative overflow-hidden"
      >
        {/* Decorative Background Glows */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold/5 rounded-full blur-[80px]" />

        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-16 h-16 bg-gradient-to-tr from-gold to-gold-light rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          >
            <Car size={32} className="text-black" />
          </motion.div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-gold-gradient italic">FALCON</span>
            <span className="text-white/90"> SYSTEMS</span>
          </h1>
          <p className="text-xs uppercase tracking-[4px] text-white/30 font-medium ml-1">
            Breakdown Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <LuxuryInput 
            label="Phone Number" 
            icon={Phone} 
            placeholder="Enter your phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          
          <LuxuryInput 
            label="Password" 
            icon={Lock} 
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-gold/50" />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Secure Access</span>
            </div>
            <button type="button" className="text-[10px] text-gold uppercase tracking-wider font-semibold hover:opacity-80 transition-opacity">
              Forgot?
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-400/10 border border-red-400/20 rounded-xl p-3 text-[10px] text-red-400 uppercase tracking-wider font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <LuxuryButton type="submit" disabled={isLoading}>
            {isLoading ? 'ESTABLISHING SECURE CONNECTION...' : 'ENTER DASHBOARD'}
          </LuxuryButton>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[2px]">
            © 2026 Falcon Breakdown Services
          </p>
        </div>
      </motion.div>
    </main>
  );
}
