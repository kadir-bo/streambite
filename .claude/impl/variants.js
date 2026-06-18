// ============================================================
// Streambite Animation Variants (Framer Motion)
// Quelle: .claude/DESIGN-SYSTEM.md — Section 4
// Kopiert nach: lib/ui/variants.js
// ============================================================

import { springs, fade } from './springs';

export const modal = {
  hidden:  { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: springs.default },
  exit:    { opacity: 0, scale: 0.95, y: 4, transition: { ...fade, duration: 0.12 } },
};

export const backdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: fade },
  exit:    { opacity: 0, transition: { ...fade, duration: 0.12 } },
};

export const dropdown = {
  hidden:  { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1,    y:  0, transition: springs.snappy },
  exit:    { opacity: 0, scale: 0.95, y: -4, transition: { ...fade, duration: 0.1 } },
};

export const toast = {
  hidden:  { opacity: 0, y: 16, scale: 0.96 },
  visible: { opacity: 1, y:  0, scale: 1,    transition: springs.snappy },
  exit:    { opacity: 0, y:  8, scale: 0.96,  transition: { ...fade, duration: 0.15 } },
};

export const message = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y:  0, transition: springs.snappy },
};

export const sidebarPanel = (width) => ({
  open:   { width, opacity: 1, transition: springs.gentle },
  closed: { width: 0, opacity: 0, transition: springs.gentle },
});

export const listContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.03 } },
};

export const listItem = {
  hidden:  { opacity: 0, x: -6 },
  visible: { opacity: 1, x:  0, transition: springs.snappy },
};

export const serverIcon = {
  idle:   { borderRadius: '30%', scale: 1 },
  hover:  { borderRadius: '50%', scale: 1.1, transition: springs.snappy },
  active: { borderRadius: '50%', scale: 1,   transition: springs.snappy },
};

export const serverPill = {
  idle:   { height: 0,  scaleY: 0, opacity: 0 },
  hover:  { height: 18, scaleY: 1, opacity: 1, transition: springs.snappy },
  active: { height: 32, scaleY: 1, opacity: 1, transition: springs.snappy },
};

export const messageActions = {
  hidden:  { opacity: 0, scale: 0.92, y: -2 },
  visible: { opacity: 1, scale: 1,    y:  0, transition: springs.snappy },
  exit:    { opacity: 0, scale: 0.92, y: -2, transition: { ...fade, duration: 0.08 } },
};

export const popover = {
  hidden:  { opacity: 0, scale: 0.92, y: 4 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: springs.default },
  exit:    { opacity: 0, scale: 0.9,  y: 4, transition: { ...fade, duration: 0.12 } },
};

export const sendButton = {
  hidden:  { opacity: 0, x: 6 },
  visible: { opacity: 1, x: 0, transition: springs.snappy },
  exit:    { opacity: 0, x: 6, transition: { ...fade, duration: 0.1 } },
};

export const replyPreview = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: springs.snappy },
  exit:    { height: 0, opacity: 0,      transition: { duration: 0.15 } },
};
