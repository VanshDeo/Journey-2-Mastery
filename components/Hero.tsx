"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Sakura from "./Sakura";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const textCharsRef = useRef<HTMLSpanElement[]>([]);
  const gateRef = useRef<HTMLDivElement>(null);
  const jpTextRef = useRef<HTMLDivElement>(null);
  const enTextRef = useRef<HTMLDivElement>(null);
  
  const [introDone, setIntroDone] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user");
        if (res.ok) {
          const data = await res.json();
          setUserData(data.user);
        }
      } catch (e) {}
    };
    fetchUser();

    // Intro sequence tied to scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=2000", // Pins for 2000px of scrolling
        pin: true,
        scrub: 1, // Smooth scrubbing makes it reversible
      }
    });

    // 1. Welcome text fades out
    tl.to(welcomeRef.current, {
      autoAlpha: 0,
      scale: 1.05,
      filter: "blur(10px)",
      duration: 1.5,
      ease: "power2.inOut"
    })
    
    // 2. Fade in mist & gate
    .to(gateRef.current, {
      opacity: 1,
      duration: 2,
      ease: "power2.out"
    }, "-=0.5")

    // 3. Main content appears
    .to(heroContentRef.current, {
      opacity: 1,
      duration: 0.5
    }, "-=1")

    // 4. MASTERY text reveal
    .fromTo(textCharsRef.current, 
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: "power2.out" },
      "-=0.5"
    )

    // 5. Subheading and button
    .fromTo(".hero-sub", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.2 },
      "-=0.5"
    );

    // Scroll Transition Hero -> Levels
    // Triggers when the Levels section comes into view below the pinned Hero
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: "#levels",
        start: "top bottom",
        end: "top top",
        scrub: true,
      },
      scale: 0.95,
      opacity: 0.4,
      filter: "blur(8px)",
      ease: "none"
    });

    // Japanese Text translation cycle (6s) (Independent of scroll)
    const jpTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    jpTl.to(jpTextRef.current, { opacity: 0, duration: 1, delay: 2 })
        .to(enTextRef.current, { opacity: 1, duration: 1 }, "<")
        .to(enTextRef.current, { opacity: 0, duration: 1, delay: 2 })
        .to(jpTextRef.current, { opacity: 1, duration: 1 }, "<");

    return () => {
      tl.kill();
      jpTl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section ref={containerRef} id="home" className="relative h-screen w-full flex items-center overflow-hidden bg-[var(--color-off-white)]">
      {/* Intro Overlay */}
      <div 
        ref={welcomeRef}
        className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--color-off-white)]"
      >
        <h1 className="font-heading text-3xl md:text-5xl tracking-widest text-[var(--color-primary-text)] font-light">
          Are you ready for your <span className="font-onari font-normal tracking-normal text-[var(--color-japan-red)]">Journey to Mastery</span>?
        </h1>
      </div>

      <Sakura />

      <div className="max-w-8xl w-full mx-auto px-12 md:px-24 h-full flex pt-24 pb-12 relative z-10">
        
        {/* Left: Text Content (45%) */}
        <div ref={heroContentRef} className="w-full md:w-[45%] h-full flex flex-col justify-center opacity-0 ml-15">
          <p className="hero-sub text-lg tracking-[0.2em] text-[var(--color-secondary-text)] mb-4">
            <a href="https://dc.kgec.tech/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-japan-red)] transition-colors inline-flex items-center gap-2">
              <img src="/logo.jpg" alt="Dev Community Logo" className="w-6 h-6 rounded-full object-cover border border-[var(--color-borders)]" />
              Dev Community presents
            </a>
          </p>
          
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl leading-none mb-8 text-[var(--color-primary-text)]">
            {"JOURNEY TO MASTERY".split("").map((char, i) => (
              <span 
                key={i} 
                ref={el => { if(el) textCharsRef.current[i] = el; }}
                className={`inline-block ${char === ' ' ? 'w-4 md:w-6' : ''}`}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          
          <h2 className="hero-sub font-heading text-xl md:text-2xl text-[var(--color-japan-red)] font-semibold tracking-widest mb-6">
            BUILD. LAUNCH. IMPACT.
          </h2>
          
          <p className="hero-sub text-[var(--color-secondary-text)] max-w-md text-lg leading-relaxed mb-10">
            A 4-week coding program for beginners and developers to turn one idea into a live product with real users.
          </p>
          
          <Link href={userData ? "/dashboard" : "/join"} className="hero-sub group relative flex items-center gap-4 px-8 py-4 border border-[var(--color-japan-red)] text-[var(--color-japan-red)] font-medium tracking-widest text-sm overflow-hidden w-max">
            <span className="absolute inset-0 bg-[var(--color-japan-red)] translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-400 ease-out z-0"></span>
            <span className="relative z-10 group-hover:text-white transition-colors duration-400 font-onari text-xl tracking-[0.15em] font-normal pt-1">
              {userData ? "CONTINUE JOURNEY" : "BEGIN YOUR JOURNEY"}
            </span>
            <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-2 group-hover:text-white transition-all duration-400" />
          </Link>
        </div>

        {/* Right: Visual (55%) */}
        <div className="hidden md:flex w-[55%] h-full relative items-center justify-center">
          {/* Torii Gate Image Placeholder */}
          <div 
            ref={gateRef}
            className="absolute inset-0 opacity-0 transition-opacity"
          >
            {/* The new hero image - Please place the attached image in public/hero-image.jpg */}
            <div className="absolute inset-0 scale-110 bg-[url('/hero-image-1.png')] bg-cover bg-center mix-blend-multiply opacity-90 filter contrast-110 saturate-50 transition-transform duration-700" />
            
            {/* Left side blur & fade to blend with the text section */}
            <div className="absolute inset-y-[-50] left-[-45] w-1/3 bg-gradient-to-r from-[var(--color-off-white)] via-[var(--color-off-white)]/80 to-transparent z-5" />
            
            {/* Right side fade to blend in the background colour with no straight edges */}
            <div className="absolute inset-y-[-50] right-[-45] w-1/3 bg-gradient-to-l from-[var(--color-off-white)] via-[var(--color-off-white)]/80 to-transparent z-5" />
            
            {/* Top side fade to blend in the background colour */}
            <div className="absolute inset-x-0 top-170 h-1/4 bg-gradient-to-b from-transparent via-[var(--color-off-white)]/80 to-[var(--color-off-white)] z-5" />
            {/* <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-b from-[var(--color-off-white)] via-[var(--color-off-white)]/80 to-transparent z-5" /> */}
            
            {/* SVG Displacement for Water Ripple */}
            <svg className="hidden">
              <filter id="ripple">
                <feTurbulence type="fractalNoise" baseFrequency="0.01 0.1" numOctaves="1" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </svg>
            
            {/* Water overlay with ripple effect */}
            {/* <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[var(--color-off-white)] to-transparent z-10" style={{ filter: "url(#ripple)" }} />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[var(--color-off-white)] via-[var(--color-off-white)]/50 to-transparent z-10" /> */}
          </div>

          {/* Vertical Japanese Text */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="relative font-heading text-4xl text-[var(--color-dark-red)] writing-vertical-rl tracking-widest h-64">
              <div ref={jpTextRef} className="absolute inset-0 opacity-100 flex justify-center writing-vertical-rl" style={{ writingMode: 'vertical-rl'}}>
                開発者コミュニティ
              </div>
              <div ref={enTextRef} className="absolute inset-0 opacity-0 flex justify-center text-xl tracking-[0.3em] font-sans text-[var(--color-secondary-text)] writing-vertical-rl whitespace-nowrap" style={{ writingMode: 'vertical-rl'}}>
                DEVELOPER COMMUNITY
              </div>
            </div>
            {/* Seal Icon */}
            {/* <div className="mt-8 border-2 border-[var(--color-dark-red)] p-1 w-12 h-12 flex items-center justify-center text-[var(--color-dark-red)]">
              <span className="font-heading text-xs text-center leading-tight">魂<br/>決</span>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
