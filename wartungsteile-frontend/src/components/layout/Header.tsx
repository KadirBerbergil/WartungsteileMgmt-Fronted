// src/components/layout/Header.tsx - Verbesserter Header
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Maschine oder Teil suchen..."
            className="pl-10 pr-4 py-2 w-80 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Benachrichtigungen */}
        <button className="relative p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-all">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* Benutzer-Profil */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">Admin User</p>
            <p className="text-xs text-gray-500">Innendienst</p>
          </div>
          <UserCircleIcon className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;