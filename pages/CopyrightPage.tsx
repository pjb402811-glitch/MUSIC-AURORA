
import React, { useState } from 'react';
import { type Track } from '../types';
import Button from '../components/Button';

interface CopyrightPageProps {
  track: Track;
  onBack: () => void;
}

const CopyrightPage: React.FC<CopyrightPageProps> = ({ track, onBack }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: 'United States',
    confirmOwnership: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
        <div className="max-w-2xl mx-auto text-center p-8 bg-gray-800/50 rounded-lg">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">등록 정보 제출 완료</h2>
            <p className="text-gray-300 mb-6">
                감사합니다. 귀하의 정보가 접수되었습니다. {formData.country}에서의 저작권 등록 절차에 대한 추가 안내 이메일이 <span className="font-semibold text-white">{formData.email}</span>(으)로 발송될 예정입니다.
            </p>
            <Button onClick={onBack}>보관함으로 돌아가기</Button>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button onClick={onBack} variant="secondary" className="mb-6">&larr; 트랙으로 돌아가기</Button>
      <div className="bg-gray-800/50 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">저작권 등록</h2>
        <p className="text-gray-400 mb-6">저작권 등록을 시작하려면 세부 정보를 입력하세요: <span className="font-semibold text-white">{track.title}</span>.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">법적 성명</label>
            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 shadow-sm focus:ring-cyan-500 focus:border-cyan-500" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">연락 이메일</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 shadow-sm focus:ring-cyan-500 focus:border-cyan-500" />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-300">거주 국가</label>
            <select name="country" id="country" value={formData.country} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 shadow-sm focus:ring-cyan-500 focus:border-cyan-500">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>기타</option>
            </select>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input id="confirmOwnership" name="confirmOwnership" type="checkbox" checked={formData.confirmOwnership} onChange={handleChange} required className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-600 rounded bg-gray-700" />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="confirmOwnership" className="font-medium text-gray-300">본인이 이 음악 및 관련 아트워크의 원작자임을 확인합니다.</label>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={!formData.confirmOwnership}>등록 안내 제출</Button>
        </form>
      </div>
    </div>
  );
};

export default CopyrightPage;