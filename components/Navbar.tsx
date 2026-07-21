"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useSession } from "@/hooks/useSession";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: user } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={twMerge(
        clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out py-6",
          scrolled ? "bg-(--color-off-white) shadow-sm" : "bg-transparent"
        )
      )}
    >
      <div className="max-w-360 w-full mx-auto px-12 md:px-24 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-(--color-japan-red) flex items-center justify-center text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M12 4v16"/><path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs tracking-[0.2em] text-(--color-secondary-text)">JOURNEY TO</span>
            <span className="font-heading text-xl tracking-wider text-(--color-japan-red) font-semibold">MASTERY</span>
          </div>
        </div>

        {/* Links and CTA */}
        <div className="flex items-center gap-10">
          <div className="hidden lg:flex items-center gap-10">
            {["HOME", "OVERVIEW", "LEVELS", "TIMELINE", "PRIZES", "FAQ", "CONTACT"].map((link, i) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className={clsx(
                  "text-xs tracking-widest font-medium transition-colors hover:text-(--color-japan-red) relative group",
                  i === 0 ? "text-(--color-japan-red)" : "text-(--color-primary-text)"
                )}
              >
                {link}
                {i === 0 && (
                  <span className="absolute -bottom-2 left-0 w-full h-px bg-(--color-japan-red)"></span>
                )}
                {i !== 0 && (
                  <span className="absolute -bottom-2 left-0 w-0 h-px bg-(--color-japan-red) transition-all duration-300 group-hover:w-full"></span>
                )}
              </a>
            ))}
          </div>

          <Link
            href={user ? "/dashboard" : "/login"}
            className="px-5 py-2 border border-(--color-japan-red) bg-(--color-japan-red) text-white hover:bg-transparent hover:text-(--color-japan-red) text-xs tracking-widest font-medium transition-all duration-300 rounded-sm"
          >
            {user ? "DASHBOARD" : "LOGIN"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
