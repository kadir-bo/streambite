"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useDragControls,
} from "motion/react";
import { X } from "@phosphor-icons/react";
import { IconBtn } from "@/components";
import { modal, backdrop } from "@/lib";
import { twMerge } from "tailwind-merge";

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 440,
  bodyClassName = "p-5",
  mobileFullScreen = false,
}) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdrop}
          onClick={onClose}
          className={twMerge(
            "fixed inset-0 z-200 bg-black/80 flex items-center justify-center",
            mobileFullScreen
              ? "p-0 sm:p-5 items-end sm:items-center"
              : "p-5",
          )}
        >
          <motion.div
            key="card"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modal}
            onClick={(e) => e.stopPropagation()}
            drag={mobileFullScreen ? "y" : false}
            dragControls={dragControls}
            dragSnapToOrigin
            dragElastic={0.3}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose();
            }}
            className={twMerge(
              "bg-surface-app border border-white/5 w-full relative overflow-hidden",
              mobileFullScreen
                ? "h-[95dvh] rounded-t-2xl sm:h-auto sm:rounded-2xl flex flex-col"
                : "rounded-2xl",
            )}
            style={{ maxWidth }}
          >
            {/* Pull handle — only when mobileFullScreen */}
            {mobileFullScreen && (
              <div
                className="flex justify-center pt-3 pb-2 md:hidden cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-1 rounded-full bg-zinc-600" />
              </div>
            )}

            {title && (
              <div className="px-5 pt-5 flex items-start justify-between gap-3">
                <h2 className="text-(--text-xl) font-semibold leading-tight">
                  {title}
                </h2>
                <IconBtn
                  icon={X}
                  onClick={onClose}
                  title="Schließen"
                  size="sm"
                  className="mt-0.5"
                />
              </div>
            )}

            <div
              className={twMerge(
                bodyClassName,
                mobileFullScreen ? "flex-1 min-h-0 overflow-hidden" : "",
              )}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
