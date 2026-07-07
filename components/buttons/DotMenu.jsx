"use client";

import { DotsThreeVertical } from "@phosphor-icons/react";
import { cn } from "@/lib";
import { IconBtn } from "@/components";

/**
 * DotMenu – DotsThreeVertical-Menü-Button mit einheitlicher Größe
 *
 * Erscheint als kleiner Icon-Button (size-6, max-sm:size-10) und wird
 * überall dort genutzt, wo ein ContextMenu aufgeht.
 *
 * <DotMenu onClick={openMenu} title="Mehr" />
 */
export default function DotMenu({ onClick, title = "Mehr", className }) {
  return (
    <IconBtn
      icon={DotsThreeVertical}
      onClick={onClick}
      title={title}
      size="lg"
      mobileSize="xl"
      rounded="sm"
      iconWeight="bold"
      className={cn("text-sm md:text-base", className)}
    />
  );
}
