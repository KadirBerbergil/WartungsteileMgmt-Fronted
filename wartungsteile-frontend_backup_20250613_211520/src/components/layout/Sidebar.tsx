// src/components/layout/Sidebar.tsx - KORRIGIERT mit dynamischen Daten
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  CogIcon, 
  WrenchScrewdriverIcon,
  Squares2X2Icon,
  PlusIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useMachines } from '../../hooks/useMachines';
import { useMaintenanceParts } from '../../hooks/useParts';
import packageJson from '../../../package.json';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // ✅ FIX: Echte Daten laden statt hardcoded Zahlen
  const { data: machines } = useMachines();
  const { data: parts } = useMaintenanceParts();
  
  const shouldShowLabels = isExpanded || isHovered;

  // ✅ FIX: Dynamische Badge-Berechnung
  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: Squares2X2Icon,
      badge: null
    },
    {
      to: "/machines",
      label: "Maschinen",
      icon: CogIcon,
      badge: machines ? machines.length.toString() : "0" // ✅ Echte Anzahl
    },
    {
      to: "/parts",
      label: "Wartungsteile", 
      icon: WrenchScrewdriverIcon,
      badge: parts ? parts.length.toString() : "0" // ✅ Echte Anzahl
    },
    {
      to: "/admin",
      label: "Admin Dashboard",
      icon: ShieldCheckIcon,
      badge: "NEU"
    },
    {
      to: "/reports",
      label: "Berichte",
      icon: ClipboardDocumentListIcon,
      badge: "0" // ✅ Placeholder - später durch echte Berichte-API ersetzen
    },
    {
      to: "/model-training",
      label: "Model Training",
      icon: AcademicCapIcon,
      badge: null
    }
  ];

  const quickActions = [
    {
      to: "/machines/create",
      label: "Neue Maschine",
      icon: PlusIcon,
      color: "text-blue-500"
    }
  ];

  return (
    <div 
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        shouldShowLabels ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <CogIcon className="h-4 w-4 text-white" />
            </div>
            <div className={`transition-all duration-300 ${shouldShowLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
              <h1 className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                Service Center
              </h1>
              <p className="text-xs text-gray-500 whitespace-nowrap">Wartungssystem</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200 ${
              shouldShowLabels ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChevronRightIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink 
            key={item.to}
            to={item.to} 
            className={({ isActive }) => 
              `group relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            end={item.to === "/"}
          >
            {({ isActive }) => (
              <>
                {/* Icon */}
                <div className="flex-shrink-0">
                  <item.icon className={`h-5 w-5 ${
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                </div>
                
                {/* Label */}
                <div className={`ml-3 transition-all duration-300 ${
                  shouldShowLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                }`}>
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                </div>
                
                {/* ✅ FIX: Badge mit echten Daten */}
                {item.badge && shouldShowLabels && (
                  <div className={`ml-auto transition-all duration-300`}>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isActive 
                        ? 'bg-blue-200 text-blue-700' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.badge}
                    </span>
                  </div>
                )}
                
                {/* Tooltip for collapsed state */}
                {!shouldShowLabels && (
                  <div className="absolute left-14 bg-gray-900 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {item.label}
                    {/* ✅ FIX: Badge auch im Tooltip anzeigen */}
                    {item.badge && (
                      <span className="ml-2 bg-gray-700 px-1 py-0.5 rounded text-xs">
                        {item.badge}
                      </span>
                    )}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Quick Actions */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className={`mb-3 transition-all duration-300 ${shouldShowLabels ? 'opacity-100' : 'opacity-0'}`}>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
            Aktionen
          </h3>
        </div>
        <div className="space-y-1">
          {quickActions.map((action) => (
            <NavLink
              key={action.to}
              to={action.to}
              className="group relative flex items-center px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <div className="flex-shrink-0">
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              
              <div className={`ml-3 transition-all duration-300 ${
                shouldShowLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
              }`}>
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {action.label}
                </span>
              </div>
              
              {/* Tooltip for collapsed state */}
              {!shouldShowLabels && (
                <div className="absolute left-14 bg-gray-900 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {action.label}
                  <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      
      {/* System Status */}
      <div className="px-3 py-3 border-t border-gray-100 bg-gray-50">
        <div className={`flex items-center transition-all duration-300 ${
          shouldShowLabels ? 'justify-between' : 'justify-center'
        }`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className={`transition-all duration-300 ${
              shouldShowLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
            }`}>
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">System Online</span>
            </div>
          </div>
          <div className={`transition-all duration-300 ${
            shouldShowLabels ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
          }`}>
            <span className="text-xs text-gray-500 whitespace-nowrap">v{packageJson.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;