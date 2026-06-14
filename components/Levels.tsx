"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const levels = [
  {
    level: "LEVEL 1",
    title: "RONIN",
    subtitle: "Idea & Foundation",
    description: "Validate your idea and build a solid foundation.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16" />
        <path d="M4 10h16" />
        <path d="M6 6v14" />
        <path d="M18 6v14" />
      </svg>
    ) // Simple Torii
  },
  {
    level: "LEVEL 2",
    title: "KENSHI",
    subtitle: "Build & Forge",
    description: "Build your MVP and implement core functionality.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
        <line x1="13" y1="19" x2="19" y2="13" />
        <line x1="16" y1="16" x2="20" y2="20" />
        <line x1="19" y1="21" x2="21" y2="19" />
        <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
        <line x1="5" y1="14" x2="9" y2="18" />
        <line x1="7" y1="17" x2="4" y2="20" />
        <line x1="3" y1="19" x2="5" y2="21" />
      </svg>
    ) // Crossed Swords
  },
  {
    level: "LEVEL 3",
    title: "SAMURAI",
    subtitle: "Deploy & Launch",
    description: "Deploy your product and make it public.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 0 0-5 5v2H5v4a5 5 0 0 0 10 0v-4h-2V7a5 5 0 0 0-5-5z" />
        <path d="M19 9v4a5 5 0 0 1-2.5 4.3" />
        <path d="M5 9v4a5 5 0 0 0 2.5 4.3" />
        <path d="M15 17.3A5 5 0 0 1 12 18a5 5 0 0 1-3-.7" />
        <path d="M8 22h8" />
        <path d="M12 18v4" />
      </svg>
    ) // Helmet
  },
  {
    level: "LEVEL 4",
    title: "SHOGUN",
    subtitle: "Traction & Impact",
    description: "Get real users and create real impact.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
        <path d="M8 12h8" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ) // Clan Symbol
  }
];

export default function Levels() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current || !titleRef.current) return;

    // Main animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top", // Pin when section reaches top of viewport
        end: "+=1500", // Scroll for 1500px to complete animation
        pin: true,
        scrub: 1, // Smooth scrub
      }
    });

    // 1. Title reveal animation
    tl.fromTo(
      titleRef.current,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        ease: "none"
      }
    );

    // 2. Cards reveal animation (Ronin, then Kenshi, etc)
    tl.fromTo(
      cardsRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.5, // sequential stagger
        ease: "power2.out"
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section id="levels" ref={containerRef} className="py-32 bg-[var(--color-off-white)] relative z-20">
      <div className="max-w-[1440px] w-full mx-auto px-12 md:px-24">
        
        {/* Section Title */}
        <div className="text-center mb-24 flex flex-col items-center">
          <h2 ref={titleRef} className="font-heading text-3xl md:text-5xl text-[var(--color-primary-text)] tracking-widest whitespace-nowrap overflow-hidden">
            THE 4 LEVELS OF <span className="text-[var(--color-japan-red)]">MASTERY</span>
          </h2>
          <div className="w-12 h-[2px] bg-[var(--color-japan-red)] mt-8"></div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {levels.map((level, i) => (
            <div 
              key={level.title}
              ref={el => { if (el) cardsRef.current[i] = el; }}
              className="group relative flex flex-col items-center text-center px-6 py-10 transition-all duration-500 hover:-translate-y-2 lg:border-r border-[var(--color-borders)] last:border-0"
            >
              {/* Icon */}
              <div className="text-[var(--color-japan-red)] mb-6 transition-transform duration-500 group-hover:scale-110">
                {level.icon}
              </div>
              
              {/* Level Number */}
              <div className="text-xs font-semibold tracking-[0.2em] text-[var(--color-secondary-text)] mb-2">
                {level.level}
              </div>
              
              {/* Title */}
              <h3 className="font-heading text-3xl tracking-widest text-[var(--color-primary-text)] mb-6 relative">
                {level.title}
              </h3>
              
              {/* Subtitle */}
              <div className="text-sm font-medium text-[var(--color-primary-text)] mb-4 relative inline-block">
                {level.subtitle}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[var(--color-japan-red)] transition-all duration-300 group-hover:w-full"></span>
              </div>
              
              {/* Description */}
              <p className="text-[var(--color-secondary-text)] text-sm leading-relaxed mt-4">
                {level.description}
              </p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
