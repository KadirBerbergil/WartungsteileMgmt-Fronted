// src/components/layout/Sidebar.tsx - Verbesserte Sidebar ohne Scroll-Probleme
import { NavLink } from 'react-router-dom';
import { 
  ChartBarIcon, 
  CogIcon, 
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon 
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: ChartBarIcon,
      description: "Übersicht & Statistiken"
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
      description: "Wartungsprotokolle"
    }
  ];

  return (
    <div className="h-screen w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Logo/Header - Fixed */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary rounded-lg">
            <CogIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Wartungsteile</h1>
            <p className="text-xs text-gray-500">CNC Management</p>
          </div>
        </div>
      </div>
      
      {/* Navigation - Scrollable wenn nötig */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink 
                to={item.to} 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-all group ${
                    isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                  }`
                }
                end={item.to === "/"}
              >
                <item.icon className={`h-5 w-5 mr-3 transition-all`} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs opacity-75`}>
                    {item.description}
                  </div>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Schnellaktionen - Fixed am Bottom */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Schnellaktionen</h3>
          <div className="space-y-2">
            <button className="w-full text-left text-sm text-gray-600 hover:text-primary transition-colors">
              + Neue Maschine
            </button>
            <button className="w-full text-left text-sm text-gray-600 hover:text-primary transition-colors">
              + Wartung planen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;