"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "@phosphor-icons/react";
import { IconBtn } from "@/components";
import { modal, backdrop } from "@/lib";

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 440,
  bodyClassName = "p-5",
  mobileFullScreen = false,
}) {
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
          className={`fixed inset-0 z-[200] bg-black/65 flex pb-40 md:pb-0 items-center justify-center ${
            mobileFullScreen ? "p-0 sm:p-5" : "p-5"
          }`}
        >
          <motion.div
            key="card"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modal}
            onClick={(e) => e.stopPropagation()}
            className={`bg-zinc-800 border border-white/5 w-full relative overflow-hidden ${
              mobileFullScreen
                ? "h-full rounded-none sm:h-auto sm:rounded-xl"
                : "rounded-xl"
            }`}
            style={{ maxWidth }}
          >
            {title && (
              <div className="px-5 pt-5 flex items-start justify-between gap-3">
                <h2 className="text-(--text-xl) font-semibold text-zinc-100 leading-tight">
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

            <div className={bodyClassName}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
