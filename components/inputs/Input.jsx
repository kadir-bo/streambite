"use client";

import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

const variantStyles = {
  default:
    "bg-surface-card rounded-lg px-3 py-2.5 text-sm placeholder:text-sm border-white/10 focus:border-(--accent)/40 focus:ring-1 focus:ring-(--accent)/20 focus:bg-surface-card/80",
  surface:
    "bg-surface-hover rounded-xl px-4 py-3 text-base placeholder:text-base border-white/5 focus:border-(--accent)/50",
};

const Input = forwardRef(function Input(
  { label, error, className, variant = "default", ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-2xs font-medium tracking-widest uppercase text-zinc-400">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={twMerge(
          "w-full outline-none transition-all duration-150 text-zinc-100 border",
          variantStyles[variant] ?? variantStyles.default,
          error ? "border-red-500" : "",
          className,
        )}
        onFocus={(e) => {
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Input;
