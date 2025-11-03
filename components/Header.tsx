import React from 'react';

const NavItem: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
      isActive
        ? 'text-cyan-400 font-semibold'
        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
    }`}
  >
    {label}
  </button>
);


interface HeaderProps {
  activePage: string;
  navigateTo: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, navigateTo }) => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 p-4 flex flex-col md:flex-row md:justify-between items-center sticky top-0 z-10">
      <div className="flex items-baseline space-x-3">
        <div className="text-2xl font-black text-white">
          Aurora<span className="text-cyan-400">Tune</span>
        </div>
        <span className="text-xs text-gray-400 font-medium">Made by 박정범</span>
      </div>
      <nav className="flex items-center justify-center space-x-1 md:space-x-2 mt-4 md:mt-0">
        <NavItem
          label="프롬프트 만들기"
          isActive={activePage === 'create'}
          onClick={() => navigateTo('create')}
        />
        <NavItem
          label="보관함"
          isActive={activePage.startsWith('library')}
          onClick={() => navigateTo('library')}
        />
         <NavItem
          label="설정"
          isActive={activePage === 'settings'}
          onClick={() => navigateTo('settings')}
        />
      </nav>
    </header>
  );
};

export default Header;