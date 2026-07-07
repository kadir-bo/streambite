"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { motionTokens, springs } from "@/lib/motion-tokens";
import { cn } from "@/lib";

/**
 * Generische Card mit animiertem Entrance.
 *
 * @param {object}   icon        - Phosphor-Icon-Komponente
 * @param {string}   title       - Überschrift
 * @param {string}   description - Beschreibung
 * @param {"vertical"|"horizontal"|"center"} variant - Layout
 * @param {number}   index       - Stagger-Reihenfolge
 * @param {string}   className   - Extra-Klassen
 */
export default function Card({
  icon: Icon,
  title,
  description,
  variant = "vertical",
  index = 0,
  className,
  ...props
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const isHorizontal = variant === "horizontal";
  const isCenter = variant === "center";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{
        duration: motionTokens.stagger.duration,
        delay: index * motionTokens.stagger.delay,
        ease: motionTokens.easing.stagger,
      }}
      className={cn(
        "group transition-all duration-300",
        isHorizontal &&
          "flex gap-4 rounded-2xl border border-white/6 bg-white/2 p-5 hover:border-(--accent)/20 hover:bg-white/4",
        isCenter &&
          "flex flex-col items-center gap-3",
        !isHorizontal && !isCenter &&
          "rounded-2xl border border-white/6 bg-white/3 p-6 hover:border-(--accent)/30 hover:bg-white/6",
        className,
      )}
      {...props}
    >
      {Icon && (
        <motion.div
          whileHover={{ scale: motionTokens.scale.pop }}
          transition={springs.snappy}
          className={cn(
            "flex items-center justify-center group-hover:bg-(--accent)/20 transition-colors",
            isHorizontal &&
              "size-10 rounded-xl bg-(--accent)/10 shrink-0 mt-0.5",
            isCenter &&
              "size-12 rounded-2xl bg-gradient-to-br from-(--accent)/15 to-(--accent)/5 border border-(--accent)/10 group-hover:border-(--accent)/25 group-hover:from-(--accent)/20 group-hover:to-(--accent)/10 transition-all duration-300",
            !isHorizontal && !isCenter &&
              "size-11 rounded-xl bg-(--accent)/10 mb-4",
          )}
        >
          <Icon
            className={cn(
              "text-(--accent)",
              isHorizontal && "text-lg",
              isCenter && "text-xl",
              !isHorizontal && !isCenter && "text-lg",
            )}
            weight="duotone"
          />
        </motion.div>
      )}

      {isCenter ? (
        <div className="text-center">
          <div className="text-sm font-semibold text-zinc-100 tracking-tight text-balance">
            {title}
          </div>
          {description && (
            <div className="text-[11px] text-zinc-500 mt-0.5 font-medium">
              {description}
            </div>
          )}
        </div>
      ) : (
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
