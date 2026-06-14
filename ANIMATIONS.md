# Journey to Mastery - Animation System

Frameworks:

- GSAP
- ScrollTrigger
- Framer Motion (optional)
- Lenis Smooth Scroll

Goal:

Animations should feel cinematic and premium.

Never flashy.

Never fast.

Think luxury website.

---

# Global Animation Rules

Duration:
0.8s - 1.5s

Ease:
power3.out

Avoid:
Bounce
Elastic
Crazy rotations

Everything should feel smooth.

---

# Intro Hero Sequence

When page loads:

Only show:

"Welcome to Journey to Mastery"

Centered.

Background:
Off White

Duration:
2 seconds

---

After 2 seconds:

Text slowly blurs.

Opacity decreases.

Scale increases slightly.

Background mist appears.

Gate fades in.

Main hero content appears.

Sequence order:

1. Welcome Text
2. Blur
3. Mist
4. Gate
5. Main Heading
6. Description
7. CTA

Total duration:
4–5 seconds

---

# Hero Text Reveal

MASTERY

Reveal animation:

Split text into characters.

Each character:

opacity 0 -> 1

translateY 40px -> 0

Stagger:
0.05

---

Subheading

Fade Up

Delay:
0.4s

---

Button

Fade Up

Delay:
0.7s

---

# Japanese Text Animation

Right side vertical text.

Japanese:
開発者コミュニティ

English:
Developer Community

---

Cycle every:

6 seconds

Animation:

A glowing ember/fire line travels from top to bottom.

As it passes:

Japanese transforms into English.

Then reverses.

English transforms back into Japanese.

---

Use:

GSAP timeline

Mask reveal

Orange/red glow

Very subtle.

No cartoon fire.

---

# Water Ripple Animation

Below Torii gate.

Create:

Continuous gentle ripples.

---

Methods:

Shader
Canvas
SVG displacement
WebGL

Any is acceptable.

---

Requirements

Reflection should:

- Distort slightly
- Move gently
- Feel realistic

No aggressive waves.

Think peaceful lake.

---

# Sakura Petal Animation

Use GSAP.

Petals should:

Start:
Top Left

Travel:
Circular drifting paths

End:
Bottom Right

---

Requirements

Random sizes

Random rotation

Random speeds

20–30 petals max

Continuous generation

Performance optimized

---

Petals should:

Occasionally pass in front of hero text.

Occasionally behind text.

Use varying z-index layers.

---

# Scroll Transition Hero -> Levels

As user scrolls:

Hero content:

Scale:
1 → 0.95

Opacity:
1 → 0.4

Blur:
0 → 8px

---

Levels section rises upward.

Feels like entering next chapter.

---

# Levels Section Animation

Trigger:

When 30% visible.

---

Each level appears:

Opacity:
0 → 1

Y:
50px → 0

Stagger:
0.15

Duration:
1s

---

Hover Animation

Icon:

Scale:
1 → 1.1

Underline expands.

Small upward lift.

---

# Section Titles

Every section title:

Reveal with mask animation.

Direction:

Left → Right

Duration:
1 second

---

# Coming Soon Sections

Timeline

Mentors

Prizes

---

Background content:

Blurred

Scale:
1.05

---

Overlay:

COMING SOON

Animation:

Opacity pulse

0.85 ↔ 1

Duration:
3s

Infinite

---

# Timeline Placeholder

When entering viewport:

Blur decreases slightly.

Then returns.

Creates curiosity effect.

---

# Mentor Cards Placeholder

Hover:

Blur reduces slightly.

Returns after hover out.

Never fully reveal content.

---

# Prize Cards Placeholder

Trophy icons:

Very subtle floating animation.

translateY:

0 → -5px → 0

Duration:

4 seconds

Infinite

---

# CTA Button Animation

Hover:

Arrow slides right.

Background fills left to right.

Duration:
0.4s

---

# Cursor Effects

Very subtle.

Small red dot.

Follower circle.

No large custom cursor.

---

# Footer Animation

Japanese seal stamp appears.

Opacity:
0 → 1

Scale:
0.8 → 1

Triggered when footer enters viewport.

---

# Smooth Scroll

Use Lenis.

Settings:

Duration:
1.2

Smooth wheel:
true

Smooth touch:
true

---

# Performance Requirements

Maintain:

60 FPS

Use:

will-change

transform

opacity

Avoid:

Animating width
Animating height
Heavy blur on mobile

Provide mobile-specific optimized animations.