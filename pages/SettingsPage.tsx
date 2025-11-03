import React, { useRef } from 'react';
import Button from '../components/Button';
import { type Track } from '../types';

interface SettingsPageProps {
  tracks: Track[];
  clearLibrary: () => void;
  importTracks: (tracks: Track[]) => void;
  clearApiKey: () => void;
}

const SettingsCard: React.FC<{ title: string, description: string, children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <div>
            {children}
        </div>
    </div>
);


const SettingsPage: React.FC<SettingsPageProps> = ({ tracks, clearLibrary, importTracks, clearApiKey }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const dataStr = JSON.stringify(tracks, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'AuroraTune_Library_Backup.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const importedTracks = JSON.parse(text);
                    if (Array.isArray(importedTracks)) {
                        // Basic validation could be improved here
                        importTracks(importedTracks);
                        alert('보관함을 성공적으로 가져왔습니다!');
                    } else {
                        throw new Error('Invalid file format');
                    }
                }
            } catch (error) {
                alert('파일을 가져오는 데 실패했습니다. 유효한 JSON 파일인지 확인하세요.');
                console.error("Failed to import tracks:", error);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">설정</h2>
                <p className="text-gray-400 mt-1">Aurora Tune AI 앱의 동작을 관리합니다.</p>
            </div>
            
            <SettingsCard title="API Key 관리" description="저장된 Google AI API Key를 관리합니다. Key를 변경하거나 삭제하려면 아래 버튼을 클릭하세요.">
                <Button onClick={clearApiKey} variant="secondary">API Key 변경/삭제</Button>
            </SettingsCard>

            <SettingsCard title="데이터 관리" description="음악 보관함 데이터를 백업하거나 복원합니다.">
                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleExport} disabled={tracks.length === 0}>보관함 내보내기 (.json)</Button>
                    <Button onClick={handleImportClick} variant="secondary">보관함 가져오기 (.json)</Button>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            </SettingsCard>

            <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-red-400 mb-1">위험 구역</h3>
                <p className="text-red-400/80 mb-4">이 작업은 되돌릴 수 없으니 신중하게 진행하세요.</p>
                <Button onClick={clearLibrary} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white" disabled={tracks.length === 0}>
                    보관함 전체 삭제
                </Button>
            </div>
        </div>
    );
};

export default SettingsPage;