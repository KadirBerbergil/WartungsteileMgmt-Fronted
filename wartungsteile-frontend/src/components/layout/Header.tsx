// src/components/layout/Header.tsx - Modern Clean Service Design
import { MagnifyingGlassIcon, BellIcon, Cog6ToothIcon, UserIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Suchen..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* System Status */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700">Online</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <BellIcon className="h-5 w-5" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">2</span>
          </div>
        </button>

        {/* Settings */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
        
        {/* User */}
        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">Service Techniker</p>
            <p className="text-xs text-gray-500">Wartung • Instandhaltung</p>
          </div>
          
          <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;