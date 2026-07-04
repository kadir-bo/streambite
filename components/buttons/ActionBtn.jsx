"use client";

import { IconBtn } from "@/components";

export default function ActionBtn({ icon, title, onClick, danger }) {
  return (
    <IconBtn
      icon={icon}
      onClick={onClick}
      title={title}
      variant={danger ? "danger" : "ghost"}
      className={danger ? "" : "hover:text-zinc-100"}
    />
  );
}
