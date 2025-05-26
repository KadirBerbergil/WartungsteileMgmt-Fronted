// src/components/layout/Sidebar.tsx - Premium Business Design
import { NavLink } from 'react-router-dom';
import { 
  CogIcon, 
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: Squares2X2Icon,
      description: "Übersicht & Analytics"
    },
    {
      to: "/machines",
      label: "Maschinen",
      icon: CogIcon,
      description: "CNC-Lademagazine"
    },
    {
      to: "/parts",
      label: "Wartungsteile", 
      icon: WrenchScrewdriverIcon,
      description: "Ersatz- & Verschleißteile"
    },
    {
      to: "/reports",
      label: "Berichte",
      icon: ClipboardDocumentListIcon,
      description: "Analytics & Reports"
    }
  ];

  return (
    <div className="h-screen w-72 bg-white border-r border-slate-200/60 flex flex-col overflow-hidden shadow-xl shadow-slate-200/20">
      {/* Premium Logo Header */}
      <div className="px-8 py-8 border-b border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <CogIcon className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full ring-2 ring-white shadow-sm"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              WartungsManager
            </h1>
            <p className="text-xs text-slate-500 font-medium">CNC Solutions Pro</p>
          </div>
        </div>
      </div>
      
      {/* Premium Navigation */}
      <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink 
            key={item.to}
            to={item.to} 
            className={({ isActive }) => 
              `group relative flex items-center px-4 py-4 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-50 to-slate-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
            end={item.to === "/"}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-600 to-indigo-700 rounded-full"></div>
                )}
                
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 transition-all duration-200 ${
                  isActive 
                    ? 'bg-white shadow-sm border border-indigo-100' 
                    : 'bg-slate-100/50 group-hover:bg-white group-hover:shadow-sm'
                }`}>
                  <item.icon className={`h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm transition-colors duration-200 ${
                    isActive ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-xs mt-0.5 transition-colors duration-200 ${
                    isActive ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-600'
                  }`}>
                    {item.description}
                  </div>
                </div>
                
                {/* Subtle arrow for active state */}
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full opacity-60"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Premium Quick Actions */}
      <div className="px-6 py-6 border-t border-slate-100 bg-gradient-to-r from-slate-50/50 to-transparent">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Quick Actions</h3>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left group">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors duration-150">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <CogIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Neue Maschine</div>
                  <div className="text-xs text-slate-500">CNC hinzufügen</div>
                </div>
              </div>
            </button>
            <button className="w-full text-left group">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors duration-150">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <WrenchScrewdriverIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Wartung planen</div>
                  <div className="text-xs text-slate-500">Service einleiten</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;