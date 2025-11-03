import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CreationPage from './pages/CreationPage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
import { useMusicLibrary } from './hooks/useMusicLibrary';
import ApiKeyModal from './components/ApiKeyModal';
import { initializeAi } from './services/geminiService';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('create');
  const { tracks, addTrack, clearLibrary, saveTracks, getTrackById, updateTrack } = useMusicLibrary();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Simple hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').split('?')[0];
      setActivePage(hash || 'create');
    };

    window.addEventListener('hashchange', handleHashChange, false);
    handleHashChange(); // Initial check

    return () => {
      window.removeEventListener('hashchange', handleHashChange, false);
    };
  }, []);

  useEffect(() => {
    try {
      const storedApiKey = localStorage.getItem('googleApiKey');
      if (storedApiKey) {
          initializeAi(storedApiKey);
      } else {
          setIsApiKeyModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to access localStorage", error);
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    try {
      localStorage.setItem('googleApiKey', key);
      initializeAi(key);
      setIsApiKeyModalOpen(false);
    } catch (error) {
      console.error("Failed to save API key to localStorage", error);
      alert('API Key를 저장하지 못했습니다. 브라우저 설정을 확인해주세요.');
    }
  };

  const handleClearApiKey = () => {
      try {
        localStorage.removeItem('googleApiKey');
        setIsApiKeyModalOpen(true);
      } catch (error) {
        console.error("Failed to clear API key from localStorage", error);
      }
  };

  const navigateTo = (page: string) => {
      window.location.hash = page;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {isApiKeyModalOpen && <ApiKeyModal onSave={handleSaveApiKey} />}
      <Header activePage={activePage} navigateTo={navigateTo} />
      <main className="flex-1 p-8 overflow-y-auto">
        {activePage.startsWith('create') && <CreationPage addTrack={addTrack} navigateTo={navigateTo} getTrackById={getTrackById} updateTrack={updateTrack} />}
        {activePage.startsWith('library') && <LibraryPage tracks={tracks} onTrackSelect={() => {}} navigateTo={navigateTo}/>}
        {activePage === 'settings' && <SettingsPage tracks={tracks} clearLibrary={clearLibrary} importTracks={saveTracks} clearApiKey={handleClearApiKey} />}
      </main>
    </div>
  );
};

export default App;