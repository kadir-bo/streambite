'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib'

const variants = {
  primary: {
    background: '#f4f4f5',
    color: '#09090b',
    border: 'none',
  },
  ghost: {
    background: '#27272a',
    color: '#a1a1aa',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  danger: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
  },
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  style,
  ...props
}) {
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '11px', borderRadius: '8px' },
    md: { padding: '10px 16px', fontSize: '13px', borderRadius: '8px' },
    lg: { padding: '12px 20px', fontSize: '15px', borderRadius: '12px' },
  }

  // Mobile Touch-Target: mindestens 44px Höhe (Apple HIG)
  // Feste Strings für Tailwind JIT – kein Template-Literal!
  const mobileHeightClasses = {
    sm: 'max-sm:min-h-10',
    md: 'max-sm:min-h-11',
    lg: 'max-sm:min-h-12',
  };
  const mobileHClass = mobileHeightClasses[size] ?? 'max-sm:min-h-11';

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      className={cn(mobileHClass, className)}
      style={{
        ...variants[variant],
        ...sizeStyles[size],
        opacity: disabled || loading ? 0.5 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        ...style,
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block size-3.5 rounded-full animate-spin border-2 border-current border-t-transparent" />
      ) : children}
    </motion.button>
  )
}
