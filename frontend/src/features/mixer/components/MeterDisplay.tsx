import React, { useEffect, useState } from 'react';
import { MeterData } from '../types/meter';

interface MeterDisplayProps {
  getMeterData: () => MeterData;
  height?: number;
  width?: number;
}

export const MeterDisplay: React.FC<MeterDisplayProps> = ({ getMeterData, height = 120, width = 12 }) => {
  const [meter, setMeter] = useState<MeterData>({ peakDb: -60, isClipping: false });

  useEffect(() => {
    let animId: number;
    let lastTime = 0;

    const update = (time: number) => {
      // Throttle meter UI state updates to ~30-60 fps
      if (time - lastTime > 30) {
        setMeter(getMeterData());
        lastTime = time;
      }
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [getMeterData]);

  // Convert dB (-60 dB to +6 dB) to height percentage (0% to 100%)
  const normalizedPeak = Math.max(0, Math.min(1, (meter.peakDb + 60) / 66));
  const heightPercent = normalizedPeak * 100;

  // Meter color logic: Green -> Yellow -> Red clipping
  let meterColor = 'bg-emerald-500';
  if (meter.isClipping) {
    meterColor = 'bg-rose-500';
  } else if (meter.peakDb > -6) {
    meterColor = 'bg-amber-400';
  }

  return (
    <div
      className="relative flex flex-col justify-end bg-slate-900 border border-slate-700/60 rounded overflow-hidden"
      style={{ height: `${height}px`, width: `${width}px` }}
    >
      {/* Dynamic Meter Level Fill */}
      <div
        className={`w-full transition-all duration-75 ease-out ${meterColor}`}
        style={{ height: `${heightPercent}%` }}
      />
      {/* 0dB Marker Line */}
      <div className="absolute top-[9%] left-0 w-full h-[1px] bg-rose-500/80 pointer-events-none" />
    </div>
  );
};
