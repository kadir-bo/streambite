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
        <label className="text-2xs  font-medium tracking-widest uppercase text-(--text-secondary)">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full outline-none transition-colors bg-(--surface-raised) rounded-(--radius-base) px-3 py-2.5 text-sm placeholder:text-sm text-(--text-primary) border",
          error ? "border-(--danger)" : "border-(--border-default)",
          "focus:border-(--border-strong)",
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
      {error && <p className="text-xs text-(--danger)">{error}</p>}
    </div>
  );
});

export default Input;
