// FIX: Corrected the invalid React import to properly import React and the useState hook.
import React, { useState, useEffect, useCallback } from 'react';
import { 
    GENRES as INITIAL_GENRES, 
    MOODS as INITIAL_MOODS,
    INSTRUMENT_CATEGORIES,
    SONG_LENGTHS,
    MUSIC_STRUCTURES,
    VOCAL_TYPES,
    SINGING_STYLES,
    TEMPOS,
    RHYTHM_GROOVES,
    MIXING_TEXTURES,
    SFX_OPTIONS,
    ALL_INSTRUMENTS,
} from '../constants';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { type MusicInfo, type Track } from '../types';
import { generateMusicInfo, regenerateSunoPrompt, regenerateLyrics, suggestTitlesFromInfo, analyzeLyricsForSuggestions, suggestInstruments } from '../services/geminiService';

type Tab = 'tools' | 'info' | 'prompts';

const StepIndicator: React.FC<{
  step: number;
  label: string;
  isActive: boolean;
  isClickable: boolean;
  onClick: () => void;
}> = ({ step, label, isActive, isClickable, onClick }) => {
  const baseClasses = "flex items-center space-x-2 p-2 rounded-t-lg border-b-4 transition-colors text-sm sm:text-base";
  let stateClasses = "border-transparent text-gray-500 cursor-not-allowed";
  
  if (isActive) {
    stateClasses = "border-cyan-400 text-white font-semibold";
  } else if (isClickable) {
    stateClasses = "border-gray-600 text-gray-300 hover:bg-gray-700/50 cursor-pointer";
  }

  return (
    <button onClick={onClick} disabled={!isClickable} className={`${baseClasses} ${stateClasses}`}>
      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isActive || isClickable ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
        {step}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const OptionSelector: React.FC<{
  title: string;
  options: readonly string[];
  selectedOptions: string[] | string;
  onSelect: (option: string) => void;
  isMultiSelect?: boolean;
  color?: 'cyan' | 'purple' | 'teal';
}> = ({ title, options, selectedOptions, onSelect, isMultiSelect = true, color = 'cyan' }) => {
    const colorClasses = {
        cyan: { bg: 'bg-cyan-400', border: 'border-cyan-400', hover: 'hover:border-cyan-500' },
        purple: { bg: 'bg-purple-400', border: 'border-purple-400', hover: 'hover:border-purple-500' },
        teal: { bg: 'bg-teal-400', border: 'border-teal-400', hover: 'hover:border-teal-500' },
    };
    const colors = colorClasses[color];

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
            <label className="font-semibold text-gray-300">{title}</label>
            <div className="flex flex-wrap gap-2">
                {options.map(option => {
                    const isSelected = isMultiSelect ? (selectedOptions as string[]).includes(option) : selectedOptions === option;
                    return (
                        <button
                            key={option}
                            onClick={() => onSelect(option)}
                            className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${isSelected ? `${colors.bg} text-gray-900 ${colors.border} font-bold` : `bg-gray-800 border-gray-700 ${colors.hover}`}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};


interface CreationPageProps {
  addTrack: (track: Track) => void;
  navigateTo: (page: string) => void;
  getTrackById: (id: string) => Track | undefined;
  updateTrack: (track: Track) => void;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2V10a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const CreationPage: React.FC<CreationPageProps> = ({ addTrack, navigateTo, getTrackById, updateTrack }) => {
  // Global State
  const [activeTab, setActiveTab] = useState<Tab>('tools');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);

  // Form State (Tab 1)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [songLength, setSongLength] = useState(SONG_LENGTHS[1]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [customLyricsPrompt, setCustomLyricsPrompt] = useState('');
  
  // New detailed options
  const [selectedMusicStructures, setSelectedMusicStructures] = useState<string[]>([]);
  const [selectedVocalTypes, setSelectedVocalTypes] = useState<string[]>(['여성 보컬 (Female Vocal)']);
  const [selectedSingingStyles, setSelectedSingingStyles] = useState<string[]>([]);
  const [selectedTempo, setSelectedTempo] = useState(TEMPOS[1]);
  const [selectedRhythmGrooves, setSelectedRhythmGrooves] = useState<string[]>([]);
  const [selectedMixingTextures, setSelectedMixingTextures] = useState<string[]>([]);
  const [selectedSfx, setSelectedSfx] = useState<string[]>([]);

  const displayGenres = INITIAL_GENRES;
  const displayMoods = INITIAL_MOODS;
  
  // Manual Input State
  const [lyricsMode, setLyricsMode] = useState<'ai' | 'manual'>('ai');
  const [manualLyrics, setManualLyrics] = useState('');
  const [manualSunoPrompt, setManualSunoPrompt] = useState('');
  const [isAnalyzingLyrics, setIsAnalyzingLyrics] = useState(false);
  const [lyricsAnalysisSuggestions, setLyricsAnalysisSuggestions] = useState<{ genres: string[], moods: string[] } | null>(null);

  // Info Results State
  const [musicInfo, setMusicInfo] = useState<MusicInfo | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
  const [editedSunoPrompt, setEditedSunoPrompt] = useState('');
  const [isSuggestingTitles, setIsSuggestingTitles] = useState(false);
  const [isSuggestingInstruments, setIsSuggestingInstruments] = useState(false);

  // Prompt Editing State
  const [isRegeneratingSunoPrompt, setIsRegeneratingSunoPrompt] = useState(false);
  const [isRegeneratingLyrics, setIsRegeneratingLyrics] = useState(false);
  const [regenerateSunoCustomPrompt, setRegenerateSunoCustomPrompt] = useState('');
  const [regenerateLyricsCustomPrompt, setRegenerateLyricsCustomPrompt] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const editTrackId = params.get('editTrackId');
    const targetTab = params.get('targetTab');

    if (editTrackId) {
      const trackToEdit = getTrackById(editTrackId);
      if (trackToEdit) {
        setEditingTrack(trackToEdit);
        
        // Populate form states
        setSelectedTitle(trackToEdit.title);
        setSelectedArtist(trackToEdit.artist);
        setSelectedGenres([trackToEdit.genre]);
        setSelectedMoods(trackToEdit.moods || ((trackToEdit as any).mood ? [(trackToEdit as any).mood] : []));
        
        // Populate music info to allow editing prompts etc.
        const mockMusicInfo: MusicInfo = {
            suggestedTitles: [trackToEdit.title],
            suggestedArtists: [trackToEdit.artist],
            sunoPrompt: trackToEdit.sunoPrompt,
            description: trackToEdit.description,
            genre: {
                main: trackToEdit.genre,
                subgenres: trackToEdit.subgenres,
            },
            tags: trackToEdit.tags,
            lyrics: trackToEdit.lyrics,
        };
        setMusicInfo(mockMusicInfo);
        setEditedSunoPrompt(trackToEdit.sunoPrompt);

        // Navigate to the correct tab
        if (targetTab === 'prompts') setActiveTab('prompts');
        else setActiveTab('info');
      }
    }
  }, [getTrackById]);

  const handleCopyToClipboard = (text: string, target: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        setCopiedTarget(target);
        setTimeout(() => setCopiedTarget(null), 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('클립보드에 복사하지 못했습니다.');
    });
  };

  const handleAnalyzeLyrics = async () => {
    if (!manualLyrics.trim()) return;
    setIsAnalyzingLyrics(true);
    setLyricsAnalysisSuggestions(null);
    try {
        const suggestions = await analyzeLyricsForSuggestions(manualLyrics);
        setLyricsAnalysisSuggestions(suggestions);
    } catch (error) {
        console.error(`Failed to analyze lyrics`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`가사 분석에 실패했습니다.\n\n오류: ${errorMessage}`);
    } finally {
        setIsAnalyzingLyrics(false);
    }
  };
  
  const createMultiSelectHandler = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (option: string) => {
      setter(prev =>
        prev.includes(option)
          ? prev.filter(item => item !== option)
          : [...prev, option]
      );
  };
  
  const handleVocalTypeSelect = (vocalType: string) => {
      setSelectedVocalTypes(prev => {
          const isInstrumental = '보컬 없음 (Instrumental)';
          if (vocalType === isInstrumental) {
              return prev.includes(isInstrumental) ? [] : [isInstrumental];
          }
          const newSelection = prev.filter(v => v !== isInstrumental);
          if (newSelection.includes(vocalType)) {
              return newSelection.filter(v => v !== vocalType);
          } else {
              return [...newSelection, vocalType];
          }
      });
  };

  useEffect(() => {
      setIsInstrumental(selectedVocalTypes.includes('보컬 없음 (Instrumental)'));
      if (selectedGenres.includes('아카펠라')) {
          setSelectedVocalTypes(prev => {
              if (prev.includes('보컬 없음 (Instrumental)')) return prev;
              return [...prev, '보컬 없음 (Instrumental)'];
          });
      }
  }, [selectedVocalTypes, selectedGenres]);

  const handleGenerateInfo = async () => {
    if (selectedGenres.length === 0) {
      alert('하나 이상의 장르를 선택해주세요.');
      return;
    }
    setIsLoading(true);
    setLoadingStep('info');
    setMusicInfo(null);
    try {
      const info = await generateMusicInfo({
        genre: selectedGenres,
        moods: selectedMoods,
        instruments: selectedInstruments,
        songLength,
        musicStructure: selectedMusicStructures,
        vocalTypes: selectedVocalTypes,
        singingStyles: selectedSingingStyles,
        tempo: selectedTempo,
        rhythmGrooves: selectedRhythmGrooves,
        mixingTextures: selectedMixingTextures,
        sfx: selectedSfx,
        customPrompt,
        generateLyrics: !isInstrumental && lyricsMode === 'ai',
        customLyricsPrompt,
        manualLyrics: !isInstrumental && lyricsMode === 'manual' ? manualLyrics : undefined,
        manualSunoPrompt: manualSunoPrompt || undefined,
      });
      setMusicInfo(info);
      setSelectedTitle(info.suggestedTitles[0] || '');
      setSelectedArtist(info.suggestedArtists[0] || '');
      setEditedSunoPrompt(info.sunoPrompt);
      setActiveTab('info');
    } catch (error) {
      console.error("Failed to generate music info", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`음악 정보 생성에 실패했습니다. 다시 시도해 주세요.\n\n오류: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

    const handleRegenerateSunoPrompt = async () => {
        if (!musicInfo) return;
        setIsRegeneratingSunoPrompt(true);
        try {
            const newPrompt = await regenerateSunoPrompt(musicInfo, regenerateSunoCustomPrompt);
            setEditedSunoPrompt(newPrompt);
            setRegenerateSunoCustomPrompt('');
        } catch (error) {
            console.error("Failed to regenerate Suno prompt", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`Suno 프롬프트 재생성에 실패했습니다.\n\n오류: ${errorMessage}`);
        } finally {
            setIsRegeneratingSunoPrompt(false);
        }
    };
    
    const handleRegenerateLyrics = async () => {
        if (!musicInfo || lyricsMode !== 'ai') return;
        setIsRegeneratingLyrics(true);
        try {
            const newLyrics = await regenerateLyrics(musicInfo, selectedVocalTypes, regenerateLyricsCustomPrompt);
            setMusicInfo(prev => prev ? { ...prev, lyrics: newLyrics } : null);
            setRegenerateLyricsCustomPrompt('');
        } catch (error) {
            console.error("Failed to regenerate lyrics", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`가사 재생성에 실패했습니다.\n\n오류: ${errorMessage}`);
        } finally {
            setIsRegeneratingLyrics(false);
        }
    };
    
    const handleSuggestTitles = async () => {
        if (!musicInfo) return;
        setIsSuggestingTitles(true);
        try {
            const newTitles = await suggestTitlesFromInfo(musicInfo);
            setMusicInfo(prev => prev ? { ...prev, suggestedTitles: [...newTitles, ...prev.suggestedTitles] } : null);
        } catch (error) {
            console.error("Failed to suggest titles", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`제목 추천에 실패했습니다.\n\n오류: ${errorMessage}`);
        } finally {
            setIsSuggestingTitles(false);
        }
    };

    const handleSuggestInstruments = async () => {
        if (selectedGenres.length === 0 && selectedMoods.length === 0) {
            alert('악기를 추천받으려면 먼저 장르나 분위기를 선택해주세요.');
            return;
        }
        setIsSuggestingInstruments(true);
        try {
            const suggested = await suggestInstruments(selectedGenres, selectedMoods, ALL_INSTRUMENTS);
            // Add suggested instruments to the current selection, avoiding duplicates
            setSelectedInstruments(prev => {
                const combined = new Set([...prev, ...suggested]);
                return Array.from(combined);
            });
        } catch (error) {
            console.error("Failed to suggest instruments", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`악기 추천에 실패했습니다.\n\n오류: ${errorMessage}`);
        } finally {
            setIsSuggestingInstruments(false);
        }
    };

  const handleSaveAndFinish = useCallback(() => {
    if (!musicInfo) return;

    const trackData = {
      title: selectedTitle,
      artist: selectedArtist,
      genre: musicInfo.genre.main,
      moods: selectedMoods,
      sunoPrompt: editedSunoPrompt,
      lyrics: musicInfo.lyrics,
      description: musicInfo.description,
      subgenres: musicInfo.genre.subgenres,
      tags: musicInfo.tags,
    };
    
    if (editingTrack) {
        const updatedTrack = { ...editingTrack, ...trackData };
        updateTrack(updatedTrack);
        alert('트랙이 성공적으로 업데이트되었습니다!');
        navigateTo(`library?trackId=${editingTrack.id}`);
    } else {
        const newTrack: Track = {
            id: crypto.randomUUID(),
            ...trackData,
        };
        addTrack(newTrack);
        alert('트랙이 보관함에 저장되었습니다!');
        navigateTo(`library?trackId=${newTrack.id}`);
    }
  }, [musicInfo, selectedTitle, selectedArtist, editedSunoPrompt, selectedMoods, addTrack, navigateTo, editingTrack, updateTrack]);

  const steps: { id: Tab; label: string }[] = [
    { id: 'tools', label: '컨셉 정의' },
    { id: 'info', label: '정보 선택' },
    { id: 'prompts', label: '프롬프트 편집' },
  ];

  // RENDER LOGIC
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex space-x-1 sm:space-x-2 border-b border-gray-700 mb-8">
        {steps.map((step, index) => {
            const isClickable = !!musicInfo || step.id === 'tools';
            return (
                <StepIndicator
                    key={step.id}
                    step={index + 1}
                    label={step.label}
                    isActive={activeTab === step.id}
                    isClickable={isClickable}
                    onClick={() => {
                        if (isClickable) {
                            setActiveTab(step.id);
                        }
                    }}
                />
            );
        })}
      </div>

      {activeTab === 'tools' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-2xl font-bold">1. 컨셉 정의하기</h3>
            <p className="text-gray-400">음악의 기본적인 장르, 분위기부터 세부적인 스타일 요소까지 선택하세요.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OptionSelector title="장르 (다중 선택)" options={displayGenres} selectedOptions={selectedGenres} onSelect={createMultiSelectHandler(setSelectedGenres)} />
            <OptionSelector title="분위기 (다중 선택)" options={displayMoods} selectedOptions={selectedMoods} onSelect={createMultiSelectHandler(setSelectedMoods)} color="purple"/>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-300">악기 (다중 선택)</h4>
                <Button 
                    variant="secondary" 
                    onClick={handleSuggestInstruments} 
                    isLoading={isSuggestingInstruments}
                    disabled={selectedGenres.length === 0 && selectedMoods.length === 0}
                    className="!text-xs !py-1.5 !px-3"
                >
                    AI 추천받기
                </Button>
            </div>
            <div className="space-y-3">
              {INSTRUMENT_CATEGORIES.map(category => (
                <div key={category.name}>
                  <p className="text-sm font-medium text-gray-400 mb-2">{category.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.instruments.map(instrument => {
                      const isSelected = selectedInstruments.includes(instrument);
                      return (
                        <button
                          key={instrument}
                          onClick={() => createMultiSelectHandler(setSelectedInstruments)(instrument)}
                          className={`px-3 py-1.5 text-xs rounded-full border-2 transition-all ${isSelected ? `bg-teal-400 text-gray-900 border-teal-400 font-bold` : `bg-gray-800 border-gray-700 hover:border-teal-500`}`}
                        >
                          {instrument}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OptionSelector title="곡 길이" options={SONG_LENGTHS} selectedOptions={songLength} onSelect={setSongLength} isMultiSelect={false} color="teal" />
            <OptionSelector title="음악 구조 (다중 선택)" options={MUSIC_STRUCTURES} selectedOptions={selectedMusicStructures} onSelect={createMultiSelectHandler(setSelectedMusicStructures)} />
            
            <OptionSelector title="보컬 타입 (다중 선택)" options={VOCAL_TYPES} selectedOptions={selectedVocalTypes} onSelect={handleVocalTypeSelect} />
            <OptionSelector title="가창 스타일 (다중 선택)" options={SINGING_STYLES} selectedOptions={selectedSingingStyles} onSelect={createMultiSelectHandler(setSelectedSingingStyles)} />
            
            <OptionSelector title="템포" options={TEMPOS} selectedOptions={selectedTempo} onSelect={setSelectedTempo} isMultiSelect={false} />
            <OptionSelector title="리듬/그루브 (다중 선택)" options={RHYTHM_GROOVES} selectedOptions={selectedRhythmGrooves} onSelect={createMultiSelectHandler(setSelectedRhythmGrooves)} />
            
            <OptionSelector title="믹싱/질감 (다중 선택)" options={MIXING_TEXTURES} selectedOptions={selectedMixingTextures} onSelect={createMultiSelectHandler(setSelectedMixingTextures)} />
            <OptionSelector title="음향 효과 (SFX) (다중 선택)" options={SFX_OPTIONS} selectedOptions={selectedSfx} onSelect={createMultiSelectHandler(setSelectedSfx)} />
          </div>

          {/* Lyrics Generation Toggle */}
          {!isInstrumental && (
            <div className="bg-gray-800/50 p-4 rounded-lg space-y-4 animate-fade-in">
                <label className="font-semibold text-gray-300">가사</label>
                <div className="pl-1 space-y-4">
                    <div>
                        <div className="flex gap-2">
                            <button onClick={() => setLyricsMode('ai')} className={`px-3 py-1.5 text-sm rounded-md ${lyricsMode === 'ai' ? 'bg-cyan-500 text-white font-semibold' : 'bg-gray-700'}`}>AI로 생성</button>
                            <button onClick={() => setLyricsMode('manual')} className={`px-3 py-1.5 text-sm rounded-md ${lyricsMode === 'manual' ? 'bg-cyan-500 text-white font-semibold' : 'bg-gray-700'}`}>직접 입력</button>
                        </div>
                    </div>

                    {lyricsMode === 'ai' && (
                        <div className="pl-1 border-l-2 border-gray-700/50 ml-1 space-y-4 pt-2 pb-2 animate-fade-in">
                            <textarea
                                value={customLyricsPrompt}
                                onChange={(e) => setCustomLyricsPrompt(e.target.value)}
                                placeholder="가사에 대한 특별한 요청이 있나요? (예: '이별에 관한 슬픈 내용으로')"
                                className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm placeholder-gray-500"
                                rows={2}
                            />
                        </div>
                    )}
                    {lyricsMode === 'manual' && (
                        <div className="animate-fade-in space-y-4">
                            <textarea
                                value={manualLyrics}
                                onChange={e => setManualLyrics(e.target.value)}
                                placeholder="여기에 가사를 직접 입력하세요..."
                                className="w-full bg-gray-700 border-gray-600 rounded-md p-3 text-sm placeholder-gray-500"
                                rows={8}
                            />
                             <Button 
                                variant="secondary" 
                                onClick={handleAnalyzeLyrics} 
                                isLoading={isAnalyzingLyrics}
                                disabled={!manualLyrics.trim()}
                            >
                                가사 분석하여 장르/분위기 추천받기
                            </Button>
                            {lyricsAnalysisSuggestions && (
                                <div className="space-y-3 pt-2">
                                    {lyricsAnalysisSuggestions.genres.length > 0 && (
                                        <div>
                                            <h5 className="text-sm font-semibold text-gray-400 mb-2">AI 추천 장르:</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {lyricsAnalysisSuggestions.genres.map(genre => (
                                                    <button
                                                        key={genre}
                                                        onClick={() => createMultiSelectHandler(setSelectedGenres)(genre)}
                                                        className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${selectedGenres.includes(genre) ? 'bg-cyan-400 text-gray-900 border-cyan-400 font-bold' : 'bg-gray-800 border-gray-700 hover:border-cyan-500'}`}
                                                    >
                                                        {genre}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {lyricsAnalysisSuggestions.moods.length > 0 && (
                                        <div>
                                            <h5 className="text-sm font-semibold text-gray-400 mb-2">AI 추천 분위기:</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {lyricsAnalysisSuggestions.moods.map(mood => (
                                                    <button
                                                        key={mood}
                                                        onClick={() => createMultiSelectHandler(setSelectedMoods)(mood)}
                                                        className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${selectedMoods.includes(mood) ? 'bg-purple-400 text-gray-900 border-purple-400 font-bold' : 'bg-gray-800 border-gray-700 hover:border-purple-500'}`}
                                                    >
                                                        {mood}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
          )}

          {/* Custom Prompt */}
           <div className="bg-gray-800/50 p-4 rounded-lg">
             <label htmlFor="customPrompt" className="font-semibold text-gray-300">추가 요청사항 (선택)</label>
             <p className="text-sm text-gray-500 mt-1 mb-2">만들고 싶은 음악에 대해 AI에게 더 자세히 알려주세요. AI가 모든 정보를 생성할 때 참고합니다.</p>
             <textarea
               id="customPrompt"
               value={customPrompt}
               onChange={(e) => setCustomPrompt(e.target.value)}
               placeholder="예: '80년대 레트로 게임 배경음악 느낌으로'"
               className="w-full bg-gray-700 border-gray-600 rounded-md p-3 mt-1"
               rows={3}
             />
           </div>

          <div className="bg-gray-800/50 p-4 rounded-lg">
            <label className="font-semibold text-gray-300">프롬프트 직접 입력 (고급)</label>
            <p className="text-sm text-gray-500 mt-1 mb-2">음악 생성 AI(Suno 등)에 사용할 프롬프트를 직접 입력할 수 있습니다. 입력 시, AI는 이 프롬프트를 기반으로 곡 제목, 설명 등을 추천합니다.</p>
            <textarea
                value={manualSunoPrompt}
                onChange={(e) => setManualSunoPrompt(e.target.value)}
                placeholder="예: Epic, cinematic, dramatic, orchestral score, powerful percussion, intense strings"
                className="w-full bg-gray-700 border-gray-600 rounded-md p-3 mt-1 font-mono text-sm placeholder-gray-500"
                rows={3}
            />
           </div>

          <Button onClick={handleGenerateInfo} isLoading={isLoading && loadingStep === 'info'} className="w-full">
            컨셉 정보 생성
          </Button>
        </div>
      )}
      
      {activeTab === 'info' && musicInfo && (
         <div className="space-y-6 animate-fade-in">
             <h3 className="text-2xl font-bold">2. 제목 및 아티스트 선택</h3>
             <p className="text-gray-400">AI가 제안한 제목과 아티스트 이름 중에서 마음에 드는 것을 고르거나 직접 수정하세요.</p>
             {/* Title and Artist selection UI */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <label htmlFor="title" className="font-semibold text-gray-300">곡 제목</label>
                    <input type="text" id="title" value={selectedTitle} onChange={e => setSelectedTitle(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2 mt-2" />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {musicInfo.suggestedTitles.map(title => (
                            <button key={title} onClick={() => setSelectedTitle(title)} className="text-xs bg-gray-700 hover:bg-cyan-500/20 hover:text-cyan-300 px-2 py-1 rounded">{title}</button>
                        ))}
                    </div>
                     <Button onClick={handleSuggestTitles} isLoading={isSuggestingTitles} variant="secondary" className="w-full mt-3 !text-sm !py-2">다른 제목 추천받기</Button>
                </div>
                 <div className="bg-gray-800/50 p-4 rounded-lg">
                    <label htmlFor="artist" className="font-semibold text-gray-300">아티스트</label>
                    <input type="text" id="artist" value={selectedArtist} onChange={e => setSelectedArtist(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2 mt-2" />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {musicInfo.suggestedArtists.map(artist => (
                            <button key={artist} onClick={() => setSelectedArtist(artist)} className="text-xs bg-gray-700 hover:bg-cyan-500/20 hover:text-cyan-300 px-2 py-1 rounded">{artist}</button>
                        ))}
                    </div>
                </div>
             </div>
             <Button onClick={() => setActiveTab('prompts')} className="w-full">
                프롬프트 편집으로 이동
             </Button>
         </div>
      )}

      {activeTab === 'prompts' && musicInfo && (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-2xl font-bold">3. 가사 및 스타일 편집하기</h3>
            <p className="text-gray-400">AI 음악 생성을 위한 프롬프트와 가사를 확인하고 수정합니다.</p>
            
            {/* Lyrics Editor */}
            {musicInfo.lyrics && (
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                        <label htmlFor="lyrics" className="font-semibold text-gray-300">가사</label>
                        <Button
                            variant="secondary"
                            className="!text-xs !px-3 !py-1.5"
                            onClick={() => handleCopyToClipboard(musicInfo.lyrics || '', 'lyrics')}
                            Icon={copiedTarget === 'lyrics' ? CheckIcon : CopyIcon}
                        >
                            {copiedTarget === 'lyrics' ? '복사됨!' : '복사'}
                        </Button>
                    </div>
                    <textarea id="lyrics" value={musicInfo.lyrics} onChange={(e) => setMusicInfo({...musicInfo, lyrics: e.target.value})} className="w-full bg-gray-900 border-gray-700 rounded-md p-2 font-mono text-sm" rows={10} />
                    {lyricsMode === 'ai' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input type="text" value={regenerateLyricsCustomPrompt} onChange={e => setRegenerateLyricsCustomPrompt(e.target.value)} placeholder="변경할 내용 요청 (예: '희망적인 내용으로 변경')" className="flex-grow bg-gray-700 border-gray-600 rounded-md p-2 text-sm placeholder-gray-500" />
                            <Button onClick={handleRegenerateLyrics} isLoading={isRegeneratingLyrics} variant="secondary" className="w-full sm:w-auto">가사 재생성</Button>
                        </div>
                    )}
                </div>
            )}

            {/* Suno Prompt Editor */}
            <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                    <label htmlFor="sunoPrompt" className="font-semibold text-gray-300">음악 생성 프롬프트 (Suno)</label>
                    <Button
                        variant="secondary"
                        className="!text-xs !px-3 !py-1.5"
                        onClick={() => handleCopyToClipboard(editedSunoPrompt, 'sunoPrompt')}
                        Icon={copiedTarget === 'sunoPrompt' ? CheckIcon : CopyIcon}
                    >
                        {copiedTarget === 'sunoPrompt' ? '복사됨!' : '복사'}
                    </Button>
                </div>
                <textarea id="sunoPrompt" value={editedSunoPrompt} onChange={(e) => setEditedSunoPrompt(e.target.value)} className="w-full bg-gray-900 border-gray-700 rounded-md p-2 font-mono text-sm" rows={5} />
                <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={regenerateSunoCustomPrompt} onChange={e => setRegenerateSunoCustomPrompt(e.target.value)} placeholder="변경할 내용 요청 (예: '드럼을 더 강하게')" className="flex-grow bg-gray-700 border-gray-600 rounded-md p-2 text-sm placeholder-gray-500" />
                    <Button onClick={handleRegenerateSunoPrompt} isLoading={isRegeneratingSunoPrompt} variant="secondary" className="w-full sm:w-auto">프롬프트 재생성</Button>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button onClick={handleSaveAndFinish} className="w-full">
                    {editingTrack ? '업데이트하고 보관함으로' : '보관함에 저장'}
                </Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default CreationPage;