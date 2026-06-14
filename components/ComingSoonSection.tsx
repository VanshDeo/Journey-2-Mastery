"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ComingSoonSection({ 
  id, 
  title 
}: { 
  id: string, 
  title: string 
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current || !titleRef.current) return;

    // Title reveal animation
    gsap.fromTo(
      titleRef.current,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        }
      }
    );

    // Pulse animation for COMING SOON
    gsap.to(overlayRef.current, {
      opacity: 0.85,
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // Hover effect for the blurred content
    const handleMouseEnter = () => {
      gsap.to(contentRef.current, { filter: "blur(4px)", scale: 1.02, duration: 0.5 });
    };
    const handleMouseLeave = () => {
      gsap.to(contentRef.current, { filter: "blur(12px)", scale: 1.05, duration: 0.5 });
    };

    const container = containerRef.current;
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Scroll trigger curiosity effect
    gsap.to(contentRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 60%",
        end: "top 40%",
        scrub: true,
      },
      filter: "blur(6px)",
    });

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section id={id} className="py-24 bg-[var(--color-off-white)] relative z-20 overflow-hidden">
      <div className="max-w-[1440px] w-full mx-auto px-12 md:px-24">
        
        {/* Section Title */}
        <div className="mb-16">
          <h2 ref={titleRef} className="font-heading text-4xl text-[var(--color-primary-text)] tracking-widest uppercase">
            {title}
          </h2>
        </div>

        {/* Coming Soon Area */}
        <div ref={containerRef} className="relative h-96 w-full rounded-sm overflow-hidden group cursor-not-allowed">
          
          {/* Blurred Content Placeholder */}
          <div 
            ref={contentRef}
            className="absolute inset-0 bg-[var(--color-card-bg)] border border-[var(--color-borders)] scale-105"
            style={{ filter: "blur(12px)" }}
          >
            {/* Abstract shapes to look like content when blurred */}
            <div className="grid grid-cols-3 gap-8 p-12 h-full opacity-50">
              <div className="bg-[var(--color-secondary-bg)] w-full h-full rounded-sm"></div>
              <div className="bg-[var(--color-secondary-bg)] w-full h-full rounded-sm"></div>
              <div className="bg-[var(--color-secondary-bg)] w-full h-full rounded-sm"></div>
            </div>
          </div>

          {/* Overlay Text */}
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10">
            <span 
              ref={overlayRef}
              className="font-heading text-5xl md:text-7xl text-[var(--color-japan-red)] tracking-[0.2em] font-light mix-blend-multiply"
            >
              COMING SOON
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
