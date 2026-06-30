"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { dropdown } from "@/lib";
import { useClickOutside } from "@/hooks";
import ContextMenuItem from "@/components/ui/ContextMenuItem";
import RadioMenuItem from "@/components/ui/RadioMenuItem";

const SUBMENU_WIDTH = 220;

export default function ContextMenu({
  open,
  onClose,
  position,
  items,
  anchor,
  width,
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

  useEffect(() => {
    if (!open) setSubmenu(null);
  }, [open]);

  const handleOutsideClick = useCallback(() => onCloseRef.current(), []);
  // Registered on the capture phase (see the hook), so opening a SECOND
  // context menu elsewhere closes this one first — the two can't both end
  // up open.
  useClickOutside([menuRef, submenuRef], handleOutsideClick, open);

  useEffect(() => {
    if (!open) return;
    function close() {
      onCloseRef.current();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (typeof document === "undefined") return null;

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
  // both — a short delay absorbs that without flickering closed. Hovering
  // either panel cancels the pending close.
  function scheduleCloseSubmenu() {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setSubmenu(null), 200);
  }

  function cancelCloseSubmenu() {
    clearTimeout(closeTimerRef.current);
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
          onMouseLeave={submenu ? scheduleCloseSubmenu : undefined}
          className={`z-(--z-tooltip) bg-(--surface-base) border border-(--border-subtle) rounded-lg p-1 shadow-(--shadow-xl) ${width ? "" : "min-w-50"}`}
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
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="h-px bg-(--border-subtle) my-1" onMouseEnter={closeSubmenu} />
            ) : item.custom ? (
              <div key={i} className="px-3 py-2" onMouseEnter={closeSubmenu}>
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
                onMouseEnter={closeSubmenu}
                onClick={() => {
                  item.onClick?.();
                  onClose();
                }}
              />
            ),
          )}
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
          onMouseEnter={cancelCloseSubmenu}
          onMouseLeave={scheduleCloseSubmenu}
          className="z-(--z-tooltip) rounded-lg border border-(--border-subtle) bg-(--surface-base) p-1 shadow-(--shadow-xl)"
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
            <div className="px-3 py-2 text-sm text-(--text-muted)">Keine Geräte gefunden</div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
