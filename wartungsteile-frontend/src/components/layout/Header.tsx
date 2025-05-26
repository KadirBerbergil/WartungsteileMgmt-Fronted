// src/components/layout/Header.tsx - Premium Business Design
import { MagnifyingGlassIcon, BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 flex items-center justify-between px-8 shadow-sm shadow-slate-200/20">
      {/* Premium Search */}
      <div className="flex items-center space-x-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
          </div>
          <input
            type="text"
            placeholder="Maschine oder Teil suchen..."
            className="w-96 pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
          />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/10 to-slate-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
        </div>
        
        {/* Search suggestions badge */}
        <div className="hidden xl:flex items-center space-x-2 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono">⌘</kbd>
            <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono">K</kbd>
          </div>
          <span>für Schnellsuche</span>
        </div>
      </div>
      
      {/* Premium Right Section */}
      <div className="flex items-center space-x-4">
        {/* System Status */}
        <div className="hidden lg:flex items-center space-x-3 px-4 py-2 bg-slate-50/50 rounded-xl border border-slate-200/60">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">System Online</span>
          </div>
          <div className="w-px h-4 bg-slate-300"></div>
          <div className="text-xs text-slate-500">
            24/7 Monitoring
          </div>
        </div>

        {/* Premium Notifications */}
        <div className="relative group">
          <button className="relative p-3 bg-slate-50/50 hover:bg-white border border-slate-200/60 rounded-xl transition-all duration-200 hover:shadow-md hover:border-slate-300/60 group">
            <BellIcon className="h-5 w-5 text-slate-600 group-hover:text-slate-800" />
            
            {/* Notification indicator */}
            <div className="absolute -top-1 -right-1 flex items-center justify-center">
              <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
                <span className="text-xs font-bold text-white">3</span>
              </div>
              <div className="absolute w-5 h-5 bg-red-400 rounded-full animate-ping opacity-20"></div>
            </div>
          </button>
          
          {/* Notification dropdown preview */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl shadow-slate-200/20 border border-slate-200/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Benachrichtigungen</h3>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">3 Neue</span>
              </div>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              <div className="space-y-1">
                <div className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">Wartung überfällig</p>
                      <p className="text-xs text-slate-500 mt-1">Maschine CNC-001 benötigt Service</p>
                      <p className="text-xs text-slate-400 mt-1">vor 2 Stunden</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">Niedriger Lagerbestand</p>
                      <p className="text-xs text-slate-500 mt-1">Teil DDR5$ nur noch 2 Stück</p>
                      <p className="text-xs text-slate-400 mt-1">vor 4 Stunden</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 text-center">
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Alle anzeigen</button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <button className="p-3 bg-slate-50/50 hover:bg-white border border-slate-200/60 rounded-xl transition-all duration-200 hover:shadow-md hover:border-slate-300/60 group">
          <Cog6ToothIcon className="h-5 w-5 text-slate-600 group-hover:text-slate-800 group-hover:rotate-90 transition-all duration-200" />
        </button>
        
        {/* Premium User Profile */}
        <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">Max Mustermann</p>
            <p className="text-xs text-slate-500 font-medium">Wartungsleiter</p>
          </div>
          
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-slate-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-200">
              <span className="text-sm font-bold text-white">MM</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full shadow-sm"></div>
            
            {/* Status indicator */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;