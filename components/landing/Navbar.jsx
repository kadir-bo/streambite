"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Logo } from "@/components";
import { twMerge } from "tailwind-merge";

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={twMerge(
        "fixed top-0 left-0 right-0 z-50",
        scrolled
          ? "bg-zinc-950/80 backdrop-blur-lg border-b border-white/5"
          : "bg-transparent",
        "[transition:background_0.3s_cubic-bezier(0.16,1,0.3,1),border-color_0.3s_cubic-bezier(0.16,1,0.3,1)]",
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer select-none text-white hover:opacity-80 transition-opacity"
        >
          <Logo />
        </span>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/login")}
            >
              Anmelden
            </Button>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("/register")}
            className="max-sm:py-2"
          >
            Loslegen
          </Button>
        </div>
      </div>
    </nav>
  );
}
