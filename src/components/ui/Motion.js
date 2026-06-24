'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const MotionLink = motion(Link);

// Page transitions (opacity + translateY)
export const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Glass card entrance animations
export const AnimatedCard = ({ children, className = '', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Button press scale effect & Hover lift
export const AnimatedButton = ({ children, onClick, className = '', disabled = false, type = 'button' }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// Link functioning as an AnimatedButton
export const AnimatedLink = ({ children, href, className = '', style, ...props }) => {
  return (
    <MotionLink
      href={href}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </MotionLink>
  );
};

// Bottom sheet slide up (matches iOS spring)
export const AnimatedSheet = ({ children, isOpen, onClose, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`relative w-full bg-[#1c1c20] rounded-t-3xl border-t border-[rgba(255,255,255,0.12)] p-6 shadow-2xl ${className}`}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        <div className="w-12 h-1.5 bg-[rgba(255,255,255,0.2)] rounded-full mx-auto mb-6" />
        {children}
      </motion.div>
    </div>
  );
};

// Notification slide in from top
export const AnimatedNotification = ({ children, className = '' }) => {
  return (
    <motion.li
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={className}
    >
      {children}
    </motion.li>
  );
};
