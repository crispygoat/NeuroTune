# NeuroTune

A sensory calibration app using audiovisual brain entrainment, designed for autistic individuals and anyone seeking calm, focused sensory experiences. NeuroTune combines neuroscience research on gamma-frequency stimulation with an interactive, fluid visual environment that responds to touch.

## What It Does

NeuroTune delivers a multi-sensory session combining:

- **40 Hz gamma audiovisual entrainment** embedded in warm ambient music
- **Interactive ink-in-water visuals** that respond to touch like swirling fluid
- **Wind chime audio feedback** on every touch interaction
- **Invisible spectral flicker** at 40 Hz for sub-threshold visual entrainment

The entire experience starts in 2 taps: pick a color, pick a shape, and the session begins. No menus, no settings screens, no cognitive overhead. During the session, floating color orbs drift across the screen, inviting users to explore different color/sound/shape combinations by simply tapping them.

## The Science

### 40 Hz Gamma Entrainment (MIT GENUS Protocol)

The core of NeuroTune is built on research from the MIT Tsai Lab's GENUS (Gamma ENtrainment Using Sensory stimuli) protocol. Key findings:

- **Iaccarino et al. (2016), Nature**: 40 Hz light flicker drives gamma oscillations in visual cortex and reduces amyloid plaques in mouse models of Alzheimer's disease
- **Martorell et al. (2019), Cell**: Combined 40 Hz auditory + visual stimulation produces broader brain effects than either modality alone, affecting prefrontal cortex, hippocampus, and auditory cortex
- **Chan et al. (2021)**: Human trials showed 40 Hz audiovisual stimulation is safe and well-tolerated, with preliminary cognitive benefits

NeuroTune implements this through:
- **Auditory**: A 40 Hz binaural beat (180 Hz left ear / 220 Hz right ear) embedded quietly beneath an ambient pad chord
- **Visual**: A 40 Hz invisible spectral flicker at 2% opacity — alternating warm (rgba 255,248,240) and cool (rgba 240,245,255) tints across the entire screen

### Safe and Sound Protocol (SSP) Principles

Carrier tones are placed in the human vocal frequency range (200-1200 Hz), drawing from Stephen Porges' Safe and Sound Protocol research on vagus nerve signaling through prosodic vocal frequencies. The ambient pad uses:
- C3 (130.81 Hz), E3 (164.81 Hz), G3 (196 Hz) — warm C major chord
- C2 (65.41 Hz) sub-bass drone — felt more than heard
- Low-pass filter at 800 Hz with slow LFO sweep (0.08 Hz, ~12 second cycle)

### Wind Chime Frequencies

Touch-triggered chimes use a C major pentatonic scale from C5 to E6 (523-1319 Hz), synthesized with 3 sine partials per chime (fundamental + octave with detune + 2nd octave) and a fast 3ms attack into 2.5 second exponential decay for authentic bell character.

### Invisible Spectral Flicker

The 40 Hz flicker operates at 2% opacity — well below the WCAG 2.3.1 threshold of 10% luminance change that could trigger photosensitive reactions. Additional safety measures:
- Automatically disabled when `prefers-reduced-motion: reduce` is set
- Full-screen coverage stays below the 25% area threshold for general flashes
- Emergency stop kills all stimulation within 1 second
- Session duration capped at 5-20 minutes

### Breathing Cycle Integration

All visuals pulse with a regulated breathing rhythm (4s inhale, 2s hold, 5s exhale, 1s rest — 12 second cycle). The geometric shape, background glow, and blob sizes all expand and contract in sync, providing a passive breathing entrainment without explicit instruction.

## How It Works

### User Flow

```
Safety Disclaimer (first visit)
        |
    Color Pick — 4 large colored squares (Red, Green, Blue, Yellow)
        |          (this tap initializes AudioContext for iPad Safari)
    Shape Pick — 4 geometric shapes on the chosen color background
        |          (this tap starts the session immediately)
   Active Session — ink-in-water visuals + ambient audio + touch interaction
        |          Floating color orbs allow seamless color/shape switching
        |
    Feedback — Good / Okay / Too much (returns to Color Pick)
```

### Visual Engine

The visual system uses Canvas 2D with 12 large radial gradient blobs that:
- **Drift organically** using layered sine waves (no noise library needed)
- **Expand and fade** like ink diffusing in water
- **React to touch** — swipes push blobs away with swirl physics, taps spawn splash blobs and expanding ripple rings
- **Breathe** — blob radii oscillate with the breathing cycle

A geometric shape (mandala, triangle, hexagon, or circle) floats at center with a stippled white aesthetic (`setLineDash` + vertex dots). Touch disturbances push it off-center via a spring-damper system that gently pulls it back.

Touch trails render as iridescent "gasoline-on-water" effects with three layers: soft bloom underlay, chromatic gradient cores, and smooth Bezier curve connections. An activity-based dampening system prevents visual overload during rapid input.

### Audio Engine

All audio is synthesized in real-time using the Web Audio API — no audio files to load:

- **Ambient Pad**: 6 detuned sine oscillators forming a warm C major chord, filtered through a breathing low-pass filter
- **40 Hz Binaural Beat**: Quietly embedded at 3% gain beneath the pad (requires headphones for binaural effect)
- **Wind Chimes**: Random ambient chimes every 2-5 seconds + touch-triggered chimes on every tap
- **Sub-bass Drone**: C2 sine wave felt more than heard

Audio fades in over 3 seconds and out over 5 seconds. Emergency stop fades in 1 second.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (dev server + build)
- **Tailwind CSS v4** (utility-first styling)
- **Zustand** (3 stores: session, audio, log)
- **Web Audio API** (zero audio dependencies)
- **Canvas 2D** (zero visual dependencies)
- **Deployed to Vercel**

### iPad Safari Optimizations

- AudioContext created inside touch handler (Safari gesture requirement)
- Handles `interrupted` AudioContext state on visibility change
- ChannelSplitter/Merger for stereo binaural (StereoPanner fallback)
- `100dvh` + `viewport-fit=cover` + `touch-action: none` on canvas
- Screen Wake Lock API (Safari 16.4+)

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (or the next available port).

```bash
npm run build    # Production build
npm run preview  # Preview production build locally
```

## Project Structure

```
src/
  audio/
    AudioEngine.ts        — Singleton orchestrator
    AmbientPadNode.ts     — Warm pad chord + embedded 40Hz binaural
    WindChimePlayer.ts    — Synthesized pentatonic chimes
    BinauralBeatNode.ts   — Standalone binaural beat (available but unused)
    IsochronicToneNode.ts — Standalone isochronic pulse (available but unused)
    FadeController.ts     — Safe exponential volume fades
  visual/
    InkWaterRenderer.ts   — Core fluid animation engine
    InkParticle.ts        — Blob lifecycle (create, update, respawn, render)
    GeometricShape.ts     — Stippled shape with spring-damper physics
    TouchField.ts         — Touch input → disturbances + trails
    ColorPalette.ts       — HSL palette generation from user color choice
    BreathingCycle.ts     — Breath state calculation
    SpectralFlicker.ts    — 40Hz invisible flicker
    SafetyGuard.ts        — WCAG flicker safety checks
  store/
    sessionStore.ts       — Phase, color, shape, timer state
    audioStore.ts         — Volume levels
    logStore.ts           — Session history (persisted)
  components/
    session/              — ColorPicker, ShapePicker, SessionControls, etc.
    visual/               — InteractiveCanvas, FlickerOverlay
    layout/               — AppShell, SafetyDisclaimer
    feedback/             — PostSessionFeedback
  constants/
    frequencies.ts        — Brainwave bands, breath cycles, chime scales
    safety.ts             — WCAG thresholds, volume limits, fade durations
```

## Safety

NeuroTune is a research prototype, not a medical device. It is not intended to diagnose, treat, or cure any condition. The audiovisual stimulation parameters are based on published research but have not been clinically validated in this specific implementation.

**Photosensitivity**: The 40 Hz spectral flicker operates at 2% opacity (below WCAG thresholds) and is automatically disabled for users with `prefers-reduced-motion` enabled. An emergency stop button is always visible during sessions.

## References

- Iaccarino, H.F. et al. (2016). Gamma frequency entrainment attenuates amyloid load and modifies microglia. *Nature*, 540, 230-235.
- Martorell, A.J. et al. (2019). Multi-sensory gamma stimulation ameliorates Alzheimer's-associated pathology and improves cognition. *Cell*, 177(2), 256-271.
- Porges, S.W. (2011). *The Polyvagal Theory: Neurophysiological Foundations of Emotions, Attachment, Communication, and Self-regulation*. W.W. Norton.
- WCAG 2.1 Success Criterion 2.3.1: Three Flashes or Below Threshold.

## License

MIT
