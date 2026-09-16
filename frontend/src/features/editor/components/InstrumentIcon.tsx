import React from 'react';
import { Music, Disc, Drum, Zap, Volume2, Mic, Radio, Sliders } from 'lucide-react';

interface InstrumentIconProps {
  iconName: string;
  className?: string;
}

export const InstrumentIcon: React.FC<InstrumentIconProps> = ({ iconName, className = 'w-4 h-4' }) => {
  switch (iconName) {
    case 'Piano':
      return <Music className={className} />;
    case 'Guitar':
      return <Radio className={className} />;
    case 'Bass':
      return <Disc className={className} />;
    case 'Drum':
    case 'Drums':
      return <Drum className={className} />;
    case 'Strings':
      return <Music className={className} />;
    case 'Brass':
      return <Volume2 className={className} />;
    case 'Saxophone':
      return <Mic className={className} />;
    case 'Zap':
    case 'Synth':
      return <Zap className={className} />;
    default:
      return <Sliders className={className} />;
  }
};
