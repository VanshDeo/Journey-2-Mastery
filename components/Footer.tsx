"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const sealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sealRef.current) return;

    gsap.fromTo(
      sealRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sealRef.current,
          start: "top 90%",
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <footer className="bg-[var(--color-off-white)] pt-24 pb-12 border-t border-[var(--color-borders)] relative z-20">
      <div className="max-w-[1440px] w-full mx-auto px-12 md:px-24 flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
        
        {/* Left: Brand */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[var(--color-japan-red)] flex items-center justify-center text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16"/><path d="M4 14h16"/><path d="M12 4v16"/><path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z"/></svg>
            </div>
            <span className="font-heading text-lg tracking-wider text-[var(--color-japan-red)] font-semibold">MASTERY</span>
          </div>
          <p className="text-[var(--color-secondary-text)] text-sm max-w-xs text-center md:text-left">
            Empowering developers to build, launch, and impact the world.
          </p>
        </div>

        {/* Center: Seal Stamp */}
        <div 
          ref={sealRef}
          className="flex flex-col items-center justify-center opacity-0"
        >
          <div className="border-2 border-[var(--color-dark-red)] p-2 w-16 h-16 flex items-center justify-center text-[var(--color-dark-red)] rounded-sm">
            <span className="font-heading text-lg text-center leading-tight">魂<br/>決</span>
          </div>
        </div>

        {/* Right: Links & Social */}
        <div className="flex flex-col items-center md:items-end gap-6">
          <div className="flex gap-6">
            {["Overview", "FAQ", "Contact"].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium tracking-wide text-[var(--color-primary-text)] hover:text-[var(--color-japan-red)] transition-colors">
                {link}
              </a>
            ))}
          </div>
          <div className="flex gap-4 text-[var(--color-secondary-text)]">
            <a href="#" className="hover:text-[var(--color-japan-red)] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="#" className="hover:text-[var(--color-japan-red)] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            </a>
            <a href="#" className="hover:text-[var(--color-japan-red)] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
          <p className="text-xs text-[var(--color-muted-text)] mt-4">
            &copy; {new Date().getFullYear()} Journey to Mastery. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
