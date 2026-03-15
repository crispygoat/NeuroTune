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

  const comfortLevel = masterVolume / 0.8; // normalize to 0-1 range

  const handleComfort = useCallback((v: number) => {
    const audioVal = v * 0.8;
    setMasterVolume(audioVal);
    audioEngine.setMasterVolume(audioVal);
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
      <div className="pointer-events-auto w-full max-w-md mx-auto px-4 space-y-3">

        {/* Main: ONE comfort slider */}
        <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/8 px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 text-sm">Comfort</span>
            <span className="text-white/25 text-xs italic">{getComfortWord(comfortLevel)}</span>
          </div>

          <div className="relative h-14 flex items-center">
            <div className="absolute left-0 right-0 h-3 bg-white/6 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-white/20 transition-all duration-75"
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
              className="relative z-10 w-full h-14 appearance-none bg-transparent cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-white/90
                         [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-black/50
                         [&::-webkit-slider-thumb]:shadow-xl
                         [&::-webkit-slider-thumb]:active:scale-110
                         [&::-webkit-slider-thumb]:transition-transform"
              aria-label={`Comfort level: ${getComfortWord(comfortLevel)}`}
            />
          </div>

          <div className="flex justify-between mt-1 px-1">
            <span className="text-[10px] text-white/15">less</span>
            <span className="text-[10px] text-white/15">more</span>
          </div>
        </div>

        {/* Fine-tune toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-white/15 text-[10px] hover:text-white/30
                       transition-colors cursor-pointer py-1"
          >
            {showMore ? 'Simpler' : 'Fine-tune'}
          </button>
        </div>

        {showMore && (
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/8 px-6 py-4 space-y-4">
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
    <div className="flex items-center gap-3">
      <span className="text-base w-6 text-center shrink-0">{emoji}</span>
      <span className="text-xs text-white/40 w-16">{label}</span>
      <div className="flex-1 relative h-8 flex items-center">
        <div className="absolute left-0 right-0 h-1.5 bg-white/6 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-white/20 transition-all duration-75"
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
          className="relative z-10 w-full h-8 appearance-none bg-transparent cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-white/80
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black/30
                     [&::-webkit-slider-thumb]:shadow-lg"
          aria-label={label}
        />
      </div>
    </div>
  );
}
