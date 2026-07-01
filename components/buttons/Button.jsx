'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib'

const variants = {
  primary: {
    background: 'var(--text-primary)',
    color: 'var(--surface-deepest)',
    border: 'none',
  },
  ghost: {
    background: 'var(--surface-raised)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-default)',
  },
  danger: {
    background: 'var(--danger)',
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
    sm: { padding: '6px 12px', fontSize: 'var(--text-xs)', borderRadius: 'var(--radius-base)' },
    md: { padding: '10px 16px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-base)' },
    lg: { padding: '12px 20px', fontSize: 'var(--text-base)', borderRadius: 'var(--radius-lg)' },
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
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={cn('inline-flex items-center justify-center gap-2 font-medium transition-opacity cursor-pointer', mobileHClass, className)}
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
