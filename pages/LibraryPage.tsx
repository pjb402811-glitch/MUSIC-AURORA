import React, { useState, useEffect, useMemo } from 'react';
import { type Track } from '../types';
import TrackCard from '../components/TrackCard';
import Button from '../components/Button';

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none border-b-2 ${
            isActive
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-white'
        }`}
    >
        {label}
    </button>
);

const DetailView: React.FC<{track: Track, navigateTo: (page: string) => void}> = ({ track, navigateTo }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'lyrics' | 'prompts'>('info');

    useEffect(() => {
        setActiveTab('info');
    }, [track]);
    
    const handleEdit = (targetTab: 'info' | 'prompts') => {
        navigateTo(`create?editTrackId=${track.id}&targetTab=${targetTab}`);
    };

    return (
        <div className="flex flex-col h-full bg-gray-800/50 backdrop-blur-md rounded-lg p-6">
            <div className="flex-grow space-y-6 overflow-y-auto pr-2">
                
                <h2 className="text-3xl font-bold">{track.title}</h2>
                <p className="text-lg text-gray-300">{track.artist}</p>

                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-2">
                        <TabButton label="앨범 정보" isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                        {track.lyrics && <TabButton label="가사" isActive={activeTab === 'lyrics'} onClick={() => setActiveTab('lyrics')} />}
                        <TabButton label="프롬프트" isActive={activeTab === 'prompts'} onClick={() => setActiveTab('prompts')} />
                    </nav>
                </div>
                
                <div className="pt-4">
                    {activeTab === 'info' && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <h4 className="font-semibold text-gray-400 text-sm">앨범 설명</h4>
                                <p className="bg-gray-900/50 p-3 rounded-md text-sm text-gray-300 mt-1">{track.description}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-400 text-sm">장르 및 태그</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="inline-block bg-cyan-500/20 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{track.genre}</span>
                                    {track.subgenres.map(sg => <span key={sg} className="inline-block bg-cyan-500/10 text-cyan-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">{sg}</span>)}
                                    {(track.moods || ((track as any).mood ? [(track as any).mood] : [])).map((mood: string) => (
                                        <span key={mood} className="inline-block bg-purple-500/20 text-purple-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{mood}</span>
                                    ))}
                                    {track.tags.map(tag => <span key={tag} className="inline-block bg-purple-500/10 text-purple-400 text-xs font-semibold px-2.5 py-0.5 rounded-full"># {tag}</span>)}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'lyrics' && track.lyrics && (
                        <div className="animate-fade-in">
                            <h4 className="font-semibold text-gray-400 text-sm">가사</h4>
                            <pre className="bg-gray-900/50 p-3 rounded-md text-sm text-gray-300 font-mono mt-1 whitespace-pre-wrap break-words max-h-60 overflow-y-auto">{track.lyrics}</pre>
                        </div>
                    )}
                    {activeTab === 'prompts' && (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <h4 className="font-semibold text-gray-400 text-sm">음악 프롬프트</h4>
                                <p className="bg-gray-900/50 p-3 rounded-md text-sm text-gray-300 font-mono mt-1 whitespace-pre-wrap break-words">{track.sunoPrompt}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-shrink-0 pt-6">
                <div className="bg-gray-900/50 p-4 rounded-lg text-center">
                    <h4 className="font-semibold text-gray-300 mb-3">이 트랙으로 다시 만들기</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" className="!text-xs !px-2 !py-2 h-full" onClick={() => handleEdit('info')}>제목/정보</Button>
                        <Button variant="secondary" className="!text-xs !px-2 !py-2 h-full" onClick={() => handleEdit('prompts')}>프롬프트</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const LibraryPage: React.FC<{tracks: Track[], onTrackSelect: (id: string)=>void, navigateTo: (page: string) => void}> = ({ tracks, onTrackSelect, navigateTo }) => {
  
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const selectedTrack = useMemo(() => {
    const urlParams = new URLSearchParams(currentHash.split('?')[1]);
    const selectedTrackId = urlParams.get('trackId');
    return tracks.find(t => t.id === selectedTrackId);
  }, [currentHash, tracks]);

  const handleSelect = (trackId: string) => {
    // Setting the hash will trigger the 'hashchange' event listener,
    // which updates the component's state and causes a re-render.
    const newHash = `#library?trackId=${trackId}`;
    window.location.hash = newHash;
    onTrackSelect(trackId);
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold text-gray-400">음악 보관함이 비어있습니다</h2>
        <p className="text-gray-500 mt-2">음악을 만들어 당신의 컬렉션을 채워보세요.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-100px)]">
      <div className="lg:col-span-2 h-full overflow-y-auto pr-4">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {tracks.map(track => (
            <TrackCard key={track.id} track={track} onClick={() => handleSelect(track.id)} isSelected={selectedTrack?.id === track.id}/>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1 h-full overflow-y-hidden">
        {selectedTrack ? <DetailView track={selectedTrack} navigateTo={navigateTo} /> : (
            <div className="flex items-center justify-center h-full bg-gray-800/20 rounded-lg">
                <p className="text-gray-500">트랙을 선택하여 상세 정보를 확인하세요</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;