export interface MusicInfo {
    suggestedTitles: string[];
    suggestedArtists: string[];
    sunoPrompt: string;
    description: string;
    genre: {
        main: string;
        subgenres: string[];
    };
    tags: string[];
    lyrics?: string;
}

// FIX: Add the missing `Track` interface, which is imported across various files.
export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  moods: string[];
  sunoPrompt: string;
  lyrics?: string;
  description: string;
  subgenres: string[];
  tags: string[];
}