
import { useState, useEffect, useCallback } from 'react';
import { type Track } from '../types';

const LIBRARY_KEY = 'auroraTuneAILibrary';

export const useMusicLibrary = () => {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    try {
      const storedTracks = localStorage.getItem(LIBRARY_KEY);
      if (storedTracks) {
        setTracks(JSON.parse(storedTracks));
      }
    } catch (error) {
      console.error("Failed to load tracks from localStorage", error);
    }
  }, []);

  const saveTracks = (newTracks: Track[]) => {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newTracks));
      setTracks(newTracks);
    } catch (error) {
      console.error("Failed to save tracks to localStorage", error);
    }
  };

  const addTrack = useCallback((newTrack: Track) => {
    const newTracks = [newTrack, ...tracks];
    saveTracks(newTracks);
  }, [tracks]);

  const getTrackById = useCallback((id: string): Track | undefined => {
    return tracks.find(track => track.id === id);
  }, [tracks]);
  
  const updateTrack = useCallback((updatedTrack: Track) => {
      const newTracks = tracks.map(t => t.id === updatedTrack.id ? updatedTrack : t);
      saveTracks(newTracks);
  }, [tracks]);
  
  const clearLibrary = useCallback(() => {
    if (window.confirm('정말로 보관함의 모든 트랙을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        try {
            localStorage.removeItem(LIBRARY_KEY);
            setTracks([]);
        } catch (error) {
            console.error("Failed to clear library from localStorage", error);
        }
    }
  }, []);

  return { tracks, addTrack, getTrackById, updateTrack, clearLibrary, saveTracks };
};