# NeuroTune — Sensory Calibration App
### A tool for exploring audiovisual brain entrainment, with a focus on autism-friendly sensory fine-tuning

---

## 🧠 The Core Idea

An iPad-optimized app that delivers **personalized, graduated audiovisual stimulation** — using controlled sound frequencies and visual patterns to gently calibrate sensory processing, build neural tolerance, and expand comfort windows over time.

The guiding principle: **meet the nervous system where it is, not where we want it to be.**

---

## 🎯 Goals

- Allow users (or caregivers) to explore sound frequency and visual entrainment safely
- Build a personal **sensory profile** over time based on responses and feedback
- Deliver sessions that are calming, predictable, and never overwhelming
- Track changes in comfort and response across sessions
- Lay the groundwork for future research-grade data collection

---

## 📱 Target Platform

**Primary: Apple iPad (iPadOS)**
- Large, high-quality display — ideal for immersive visuals
- High-fidelity audio output / AirPods support
- Swift / SwiftUI native stack for best performance and sensory precision
- Accessibility-first (Apple's ecosystem is strong here)

**Secondary (future):** iPhone, Mac, web prototype for testing

---

## 🏗️ Recommended Tech Stack

### Native iOS/iPadOS App (Best for production)
| Layer | Technology |
|---|---|
| Language | Swift 5.9+ |
| UI Framework | SwiftUI |
| Audio Engine | AVFoundation + AudioKit (open source) |
| Visual/Animation | Metal shaders + SwiftUI animations |
| Data/Storage | SwiftData (local) + CloudKit (sync) |
| Haptics | CoreHaptics (adds tactile layer) |
| Analytics | Custom + HealthKit integration (future) |

### Web Prototype (Best for fast iteration now)
| Layer | Technology |
|---|---|
| Framework | React + TypeScript |
| Audio | Web Audio API (binaural beats, tones) |
| Visuals | Canvas API / WebGL / Three.js |
| State | Zustand or React Context |
| Storage | IndexedDB (local session data) |
| Deployment | Vercel / Netlify |

> **Recommendation:** Start with a **React web prototype** to validate the concept quickly on iPad Safari, then build native SwiftUI once the experience is proven.

---

## 🗺️ Phased Roadmap

### Phase 1 — Prototype (Weeks 1–4)
**Goal: Prove the core experience works**

- [ ] Basic binaural beat generator (delta / theta / alpha / beta / gamma)
- [ ] Simple visual entrainment patterns (slow pulse, mandala breathing, color wash)
- [ ] Volume and intensity controls (always user-controlled)
- [ ] "Safe exit" — one tap to immediately stop everything
- [ ] Session timer (5 / 10 / 20 minutes)
- [ ] Basic session log (what was used, how long)

### Phase 2 — Sensory Profiling (Weeks 5–10)
**Goal: Personalize the experience**

- [ ] Onboarding sensory sensitivity questionnaire (gentle, visual, low text)
- [ ] Frequency preference discovery — guided listening sessions
- [ ] Visual pattern preference discovery
- [ ] Build a personal **sensory map** (what calms, what activates, what to avoid)
- [ ] Caregiver / parent mode for supporting a child through setup
- [ ] Response tracking: simple emoji/color-based feedback after sessions

### Phase 3 — Graduated Programs (Weeks 11–18)
**Goal: Build structured therapeutic-style programs**

- [ ] 30-day "Sensory Calibration" program (gradual, gentle progression)
- [ ] Specific modules: Focus, Calm, Sleep Prep, Morning Activation
- [ ] Adaptive difficulty — program adjusts based on feedback
- [ ] Progress visualization (calm, simple graphs)
- [ ] Export session data (PDF report for therapists / researchers)

### Phase 4 — Research Layer (Future)
**Goal: Contribute to the science**

- [ ] Opt-in anonymized data contribution
- [ ] Integration with wearables (Apple Watch HRV as proxy for nervous system state)
- [ ] Collaboration portal for occupational therapists and researchers
- [ ] Academic partnership framework

---

## 🎨 UX Design Principles

These are non-negotiable given the target audience:

1. **Predictable** — no surprise animations, sounds, or transitions
2. **Low cognitive load** — minimal text, icon-led navigation
3. **Always in control** — user can pause, exit, or reduce intensity at any moment
4. **Gentle onboarding** — no overwhelming setup; start with one simple session
5. **Sensory neutral UI** — soft colors, no harsh contrasts, no flashing elements in the interface itself
6. **Caregiver-aware** — clear parent/support person mode
7. **Never clinical-feeling** — warm, human, curious — not medical or sterile

---

## 🔬 Core Features (V1)

### Sound Module
- Binaural beat generator (all 5 brainwave bands)
- Isochronic tone option (no headphones required)
- Nature sound layers (rain, forest, ocean — proven calming)
- Frequency mixer: combine a base tone + nature layer
- Volume ramping — sounds always fade in/out, never sudden

### Visual Module
- Breathing guide animations (expand/contract shapes)
- Slow color gradient washes (chromotherapy-inspired)
- Geometric pulse patterns (frequency-matched to audio)
- Darkness/rest mode — visuals optional, audio only
- Brightness override — always dimmer than system setting

### Session Engine
- Preset sessions: Calm, Focus, Sleep, Explore
- Custom session builder
- Duration selector
- Automatic fade-out at session end
- Post-session mood check (3 options: 😌 😐 😟)

---

## 📊 Data Model (Simple V1)

```
User Profile
  ├── sensory_preferences: { frequencies: [], visuals: [], avoid: [] }
  ├── sessions: [ { date, type, duration, mood_after } ]
  └── program_progress: { current_day, streak }
```

---

## ⚠️ Important Ethical Guardrails

- **Not a medical device** — clear disclaimer, not positioned as therapy
- **Photosensitivity warning** — mandatory on first launch, visual flash rates capped at safe levels
- **Caregiver consent flow** for users under 18
- **No dark patterns** — no streaks that punish, no guilt for missed sessions
- **Community advisory** — engage autistic self-advocates in design from the start

---

## 🚀 First Build Suggestion

Start here: **a single React page** that does one thing beautifully —

> A user picks a brainwave state (theta, alpha, etc.), a binaural beat plays through headphones, and a slow breathing mandala pulses in sync on the screen. Sessions last 5–10 minutes. A single emoji response is logged after.

That one experience, done well, proves the entire concept.

---

## 🤝 Potential Collaborators (Future)
- Occupational therapists specializing in sensory processing
- Autism self-advocacy organizations
- Neurofeedback researchers
- AudioKit open-source community
- Apple Accessibility team / WWDC community

---

*This document is a living plan — expect it to evolve as we learn from real sessions and real users.*
