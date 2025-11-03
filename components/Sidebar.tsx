
import React from 'react';

const NavItem: React.FC<{
  icon: React.ReactElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
      isActive
        ? 'bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10'
        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </li>
);

const CreateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const LibraryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;


const Sidebar: React.FC<{ activePage: string; navigateTo: (page: string) => void; }> = ({ activePage, navigateTo }) => {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 fixed h-full flex flex-col">
      <div className="text-2xl font-black text-white mb-12">
        Aurora<span className="text-cyan-400">Tune</span>
      </div>
      <nav>
        <ul className="space-y-4">
          <NavItem
            icon={<CreateIcon />}
            label="프롬프트 만들기"
            isActive={activePage === 'create'}
            onClick={() => navigateTo('create')}
          />
          <NavItem
            icon={<LibraryIcon />}
            label="보관함"
            isActive={activePage.startsWith('library')}
            onClick={() => navigateTo('library')}
          />
        </ul>
      </nav>
      <div className="mt-auto">
        <ul className="space-y-4">
            <NavItem
                icon={<SettingsIcon />}
                label="설정"
                isActive={activePage === 'settings'}
                onClick={() => navigateTo('settings')}
            />
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;