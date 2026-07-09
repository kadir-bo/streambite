"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { dropdown } from "@/lib";
import { useClickOutside } from "@/hooks";
import { ContextMenuItem, RadioMenuItem } from "@/components";
import { twMerge } from "tailwind-merge";

const SUBMENU_WIDTH = 220;

export default function ContextMenu({
  open,
  onClose,
  position,
  items,
  anchor,
  width,
  mode = "floating", // "floating" | "inline"
  triggerRef, // optional — wird in useClickOutside eingeschlossen, sodass
  // Klick auf den Trigger NICHT als "outside" zählt (wichtig
  // für toggle-Buttons im inline-Modus)
}) {
  const onCloseRef = useRef(onClose);
  const closeTimerRef = useRef(null);
  const menuRef = useRef(null);
  const submenuRef = useRef(null);
  const [submenu, setSubmenu] = useState(null); // { index, items, rect }
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const handleOutsideClick = useCallback(() => onCloseRef.current(), []);
  // Im inline-Modus den triggerRef in die Liste aufnehmen, damit
  // der toggle-Button das Menü nicht ungewollt schließt & wieder öffnet.
  const outsideRefs = triggerRef
    ? [menuRef, submenuRef, triggerRef]
    : [menuRef, submenuRef];
  useClickOutside(outsideRefs, handleOutsideClick, open);

  useEffect(() => {
    if (!open) return;
    function close() {
      onCloseRef.current();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    // Floating: bei Scroll schließen. Inline: nicht — Dropdown scrollt mit.
    if (mode !== "inline") {
      window.addEventListener("scroll", close, true);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
      setSubmenu(null);
    };
  }, [open, mode]);

  if (mode !== "inline" && typeof document === "undefined") return null;

  function openSubmenu(e, i, submenuItems) {
    clearTimeout(closeTimerRef.current);
    if (submenu?.index === i) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const openToLeft = window.innerWidth - rect.right < SUBMENU_WIDTH + 8;
    setSubmenu({
      index: i,
      items: submenuItems,
      left: openToLeft ? rect.left - SUBMENU_WIDTH - 4 : rect.right + 4,
      top: rect.top,
    });
  }

  function closeSubmenu() {
    clearTimeout(closeTimerRef.current);
    setSubmenu(null);
  }

  // The menu and its submenu are two separate floating panels with a gap
  // between them, so moving the mouse from one to the other briefly leaves
  // both - a short delay absorbs that without flickering closed. Hovering
  // either panel cancels the pending close.
  const menuItems = (closeSubmenuFn) =>
    items.map((item, i) =>
      item.divider ? (
        <div
          key={i}
          className="h-px bg-white/5 my-1"
          onMouseEnter={closeSubmenuFn}
        />
      ) : item.custom ? (
        <div key={i} className="px-3 py-2" onMouseEnter={closeSubmenuFn}>
          {item.custom}
        </div>
      ) : item.submenu ? (
        <ContextMenuItem
          key={i}
          icon={item.icon}
          label={item.label}
          subtitle={item.subtitle}
          chevron
          active={submenu?.index === i}
          onMouseEnter={(e) => openSubmenu(e, i, item.submenu)}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <ContextMenuItem
          key={i}
          icon={item.icon}
          label={item.label}
          danger={item.danger}
          active={item.active}
          disabled={item.disabled}
          title={item.title}
          onMouseEnter={closeSubmenuFn}
          onClick={() => {
            item.onClick?.();
            onClose();
          }}
        />
      ),
    );

  if (mode === "inline") {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdown}
            onClick={(e) => e.stopPropagation()}
            className={twMerge(
              "absolute top-full left-0 right-0 mt-1 z-50 bg-surface-card border border-white/5 rounded-lg p-1 shadow-xl",
              !width && "min-w-50",
            )}
            style={width ? { width } : undefined}
          >
            {menuItems(undefined)}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu"
          ref={menuRef}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={dropdown}
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={submenu ? () => {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = setTimeout(() => setSubmenu(null), 200);
          } : undefined}
          className={twMerge(
            "z-500 bg-surface-card border border-white/5 rounded-lg p-1 shadow-xl",
            !width && "min-w-50",
          )}
          style={{
            position: "fixed",
            left: position?.x ?? 0,
            width,
            ...(anchor === "bottom"
              ? {
                  bottom:
                    typeof window !== "undefined"
                      ? window.innerHeight - (position?.y ?? 0)
                      : 0,
                }
              : { top: position?.y ?? 0 }),
          }}
        >
          {menuItems(submenu ? scheduleCloseSubmenu : undefined)}
        </motion.div>
      )}

      {open && submenu && (
        <motion.div
          key="submenu"
          ref={submenuRef}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={dropdown}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => clearTimeout(closeTimerRef.current)}
          onMouseLeave={() => {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = setTimeout(() => setSubmenu(null), 200);
          }}
          className="z-500 rounded-lg border border-white/5 bg-surface-card p-1 shadow-xl"
          style={{
            position: "fixed",
            left: submenu.left,
            top: submenu.top,
            width: SUBMENU_WIDTH,
          }}
        >
          {submenu.items.length ? (
            submenu.items.map((entry, j) => (
              <RadioMenuItem
                key={j}
                label={entry.label}
                active={entry.active}
                disabled={entry.disabled}
                onClick={() => {
                  entry.onClick?.();
                  setSubmenu(null);
                  onClose();
                }}
              />
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-zinc-500">
              Keine Geräte gefunden
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
