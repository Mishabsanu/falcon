"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface LuxuryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}

export const LuxuryButton: React.FC<LuxuryButtonProps> = ({ 
  children, 
  onClick, 
  type = "button",
  className = "",
  disabled = false
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-4 rounded-xl font-semibold text-sm tracking-[1px]
        bg-gradient-to-r from-gold to-gold-light text-black
        hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]
        transition-shadow duration-300 disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};
