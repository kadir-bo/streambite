"use client";

import { forwardRef } from "react";
import { cn } from "@/lib";

const Input = forwardRef(function Input(
  { label, error, className, ...props },
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
        className={cn(
          "w-full outline-none transition-all duration-150 bg-zinc-800 rounded-lg px-3 py-2.5 text-sm placeholder:text-sm text-zinc-100 border",
          error ? "border-red-500" : "border-white/10",
          "focus:border-(--accent)/40 focus:ring-1 focus:ring-(--accent)/20 focus:bg-zinc-800/80",
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
