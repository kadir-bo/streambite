import { springs, fade } from '@/lib/ui/springs'

export const modal = {
  hidden:  { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1,    y: 0, transition: springs.default },
  exit:    { opacity: 0, scale: 0.95, y: 4, transition: { ...fade, duration: 0.12 } },
}

export const backdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: fade },
  exit:    { opacity: 0, transition: { ...fade, duration: 0.12 } },
}

export const dropdown = {
  hidden:  { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1,    y:  0, transition: springs.snappy },
  exit:    { opacity: 0, scale: 0.95, y: -4, transition: { ...fade, duration: 0.1 } },
}

export const serverIcon = {
  idle:   { borderRadius: '30%', scale: 1 },
  hover:  { borderRadius: '50%', scale: 1.1, transition: springs.snappy },
  active: { borderRadius: '50%', scale: 1,   transition: springs.snappy },
}

export const messageActions = {
  hidden:  { opacity: 0, scale: 0.92, y: -2 },
  visible: { opacity: 1, scale: 1,    y:  0, transition: springs.snappy },
  exit:    { opacity: 0, scale: 0.92, y: -2, transition: { ...fade, duration: 0.08 } },
}

export const replyPreview = {
  hidden:  { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: springs.snappy },
  exit:    { height: 0, opacity: 0,      transition: { duration: 0.15 } },
}

export const pageTransition = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.1 } },
}
