import { useState, useCallback } from 'react';
import { useAudioStore } from '../../store/audioStore';
import { audioEngine } from '../../audio/AudioEngine';

function getComfortWord(ratio: number): string {
  if (ratio < 0.1) return 'off';
  if (ratio < 0.25) return 'whisper';
  if (ratio < 0.45) return 'gentle';
  if (ratio < 0.65) return 'moderate';
  if (ratio < 0.85) return 'strong';
  return 'full';
}

export function SessionControls() {
  const [showMore, setShowMore] = useState(false);

  const masterVolume = useAudioStore((s) => s.masterVolume);
  const toneVolume = useAudioStore((s) => s.toneVolume);
  const chimeVolume = useAudioStore((s) => s.chimeVolume);
  const setMasterVolume = useAudioStore((s) => s.setMasterVolume);
  const setToneVolume = useAudioStore((s) => s.setToneVolume);
  const setChimeVolume = useAudioStore((s) => s.setChimeVolume);

  const comfortLevel = masterVolume; // 0-1 range (max volume = 1.0)

  const handleComfort = useCallback((v: number) => {
    setMasterVolume(v);
    audioEngine.setMasterVolume(v);
  }, [setMasterVolume]);

  const handleToneVolume = useCallback((v: number) => {
    setToneVolume(v);
    audioEngine.setToneVolume(v);
  }, [setToneVolume]);

  const handleChimeVolume = useCallback((v: number) => {
    setChimeVolume(v);
    audioEngine.setChimeVolume(v);
  }, [setChimeVolume]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pb-5 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm mx-auto px-5 space-y-2">

        {/* Main: ONE comfort slider */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs tracking-wide">Comfort</span>
            <span className="text-white/20 text-xs">{getComfortWord(comfortLevel)}</span>
          </div>

          <div className="relative h-10 flex items-center">
            <div className="absolute left-0 right-0 h-2 bg-white/6 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-white/15 transition-all duration-75"
                style={{ width: `${comfortLevel * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={comfortLevel}
              onChange={(e) => handleComfort(parseFloat(e.target.value))}
              className="relative z-10 w-full h-10 appearance-none bg-transparent cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-white/80
                         [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:active:scale-110
                         [&::-webkit-slider-thumb]:transition-transform"
              aria-label={`Comfort level: ${getComfortWord(comfortLevel)}`}
            />
          </div>

          <div className="flex justify-between px-1">
            <span className="text-[9px] text-white/10">less</span>
            <span className="text-[9px] text-white/10">more</span>
          </div>
        </div>

        {/* Fine-tune toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-white/15 text-[10px] hover:text-white/25
                       transition-colors cursor-pointer py-1"
          >
            {showMore ? 'Simpler' : 'Fine-tune'}
          </button>
        </div>

        {showMore && (
          <div className="bg-black/40 backdrop-blur-md rounded-2xl px-5 py-3 space-y-3">
            <SmallSlider
              emoji={'\u223F'}
              label="Ambient"
              value={toneVolume}
              max={1}
              onChange={handleToneVolume}
            />
            <SmallSlider
              emoji={'\uD83D\uDD14'}
              label="Chimes"
              value={chimeVolume}
              max={0.3}
              onChange={handleChimeVolume}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SmallSlider({
  emoji,
  label,
  value,
  max,
  onChange,
}: {
  emoji: string;
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const percent = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-5 text-center shrink-0 text-white/30">{emoji}</span>
      <span className="text-[11px] text-white/30 w-14 shrink-0">{label}</span>
      <div className="flex-1 relative h-7 flex items-center">
        <div className="absolute left-0 right-0 h-1.5 bg-white/6 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-white/15 transition-all duration-75"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max={max}
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="relative z-10 w-full h-7 appearance-none bg-transparent cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-white/70
                     [&::-webkit-slider-thumb]:shadow-md"
          aria-label={label}
        />
      </div>
    </div>
  );
}
