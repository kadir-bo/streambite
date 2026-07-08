"use client";

import { motion } from "motion/react";
import { twMerge } from "tailwind-merge";

const variantStyles = {
  primary:
    "bg-surface-raised text-white hover:brightness-110 shadow-xl shadow-deep/20",
  ghost:
    "bg-zinc-800 text-zinc-300 border border-white/[0.08] hover:bg-zinc-700 hover:text-white",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizeStyles = {
  sm: "px-4 py-3.5 text-sm rounded-md max-sm:min-h-12",
  md: "px-5 py-3.5 text-sm rounded-lg max-sm:min-h-12",
  lg: "px-7 py-4 text-base rounded-xl max-sm:min-h-12",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={twMerge(
        "inline-flex items-center justify-center gap-2 font-semibold leading-none select-none",
        "transition-all duration-150",
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="inline-block size-3.5 rounded-full animate-spin border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </motion.button>
  );
}
