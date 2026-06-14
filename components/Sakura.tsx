"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Sakura() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const petals: HTMLDivElement[] = [];
    const numPetals = 25;

    // Create petals
    for (let i = 0; i < numPetals; i++) {
      const petal = document.createElement("div");
      petal.className = "absolute w-3 h-3 rounded-tl-full rounded-br-full bg-[var(--color-japan-red)] opacity-40 blur-[1px]";
      
      // Randomize starting properties
      gsap.set(petal, {
        x: Math.random() * window.innerWidth,
        y: -50 - Math.random() * 200,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
        zIndex: Math.random() > 0.5 ? 10 : 30 // some behind text, some in front
      });

      container.appendChild(petal);
      petals.push(petal);

      // Animate petal
      animatePetal(petal);
    }

    function animatePetal(petal: HTMLDivElement) {
      const duration = 8 + Math.random() * 7;
      
      gsap.to(petal, {
        y: window.innerHeight + 100,
        x: "+=" + (Math.random() * 200 - 100),
        rotation: "+=" + (180 + Math.random() * 360),
        duration: duration,
        ease: "none",
        onComplete: () => {
          // Reset and restart
          gsap.set(petal, {
            y: -50 - Math.random() * 50,
            x: Math.random() * window.innerWidth,
          });
          animatePetal(petal);
        }
      });
      
      // Add a slight swaying motion
      gsap.to(petal, {
        x: "+=" + (Math.random() * 50 + 25),
        duration: duration / 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }

    return () => {
      petals.forEach(p => gsap.killTweensOf(p));
      if (container) container.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-20 overflow-hidden" />;
}
