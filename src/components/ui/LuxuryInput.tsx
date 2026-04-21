"use client";
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface LuxuryInputProps {
  label: string;
  icon: LucideIcon;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const LuxuryInput: React.FC<LuxuryInputProps> = ({ 
  label, 
  icon: Icon, 
  type = "text", 
  value, 
  onChange,
  placeholder 
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[10px] uppercase tracking-[2px] text-gold/60 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/40 group-focus-within:text-gold transition-colors">
          <Icon size={18} />
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-obsidian border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-white/10"
        />
        <div className="absolute inset-0 rounded-xl bg-gold/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </div>
  );
};
