import React from 'react';
import { type Track } from '../types';

interface TrackCardProps {
  track: Track;
  onClick: () => void;
  isSelected: boolean;
}

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
);

const MusicNoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />
    </svg>
);


const TrackCard: React.FC<TrackCardProps> = ({ track, onClick, isSelected }) => {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-lg overflow-hidden cursor-pointer group transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${isSelected ? 'ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/30' : 'ring-2 ring-transparent'}`}
    >
      <div className="w-full h-full aspect-square bg-gray-800 flex items-center justify-center">
          <MusicNoteIcon />
      </div>
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-all duration-300 flex flex-col justify-end p-4">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayIcon />
        </div>
        <h3 className="font-bold text-lg text-white truncate">{track.title}</h3>
        <p className="text-sm text-gray-300 truncate">{track.artist}</p>
      </div>
    </div>
  );
};

export default TrackCard;