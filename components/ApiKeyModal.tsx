import React, { useState } from 'react';
import Button from './Button';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
}

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.623 5.91L10 18H8v-2l1.91-3.377A6 6 0 0121 9zM12 9a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-8 w-full max-w-lg m-4 text-gray-200">
        <h2 className="text-2xl font-bold mb-2">Google AI API Key 설정</h2>
        <p className="text-red-400 mb-4">이 앱을 사용하려면 Google AI API Key가 필요합니다. 아래에 입력해주세요.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="text-sm font-medium text-gray-400">Google AI API Key 입력</label>
            <div className="relative mt-1">
                <KeyIcon />
               <input
                 id="apiKey"
                 type="password"
                 value={key}
                 onChange={(e) => setKey(e.target.value)}
                 className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 pl-10 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
                 placeholder="******************"
                 autoComplete="off"
               />
            </div>
            <p className="text-xs text-gray-500 mt-2">API Key는 브라우저에만 저장되며, 외부로 전송되지 않습니다.</p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
             <h3 className="font-semibold mb-2">Google AI API Key 발급방법</h3>
             <ol className="list-decimal list-inside text-sm space-y-1 text-gray-400">
                <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google AI Studio</a> 페이지로 이동하여 로그인합니다.</li>
                <li>'Get API Key' 또는 'Create API key' 버튼을 클릭합니다.</li>
                <li>생성된 API Key를 복사합니다.</li>
                <li>복사한 Key를 위 입력창에 붙여넣고 'Key 저장' 버튼을 누릅니다.</li>
             </ol>
          </div>

          <Button type="submit" className="w-full" disabled={!key.trim()}>
            Key 저장
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
