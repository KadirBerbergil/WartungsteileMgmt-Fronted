// src/pages/dashboard/Dashboard.tsx - Professionelle B2B-Version
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { useMachines } from '../../hooks/useMachines';
import { useMaintenanceParts } from '../../hooks/useParts';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  CogIcon, 
  WrenchScrewdriverIcon, 
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  XCircleIcon,
  Bars3Icon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// CSS Import für react-grid-layout
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Activity {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  color: string;
  title: string;
  description: string;
  time: Date;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: machines, isLoading: machinesLoading } = useMachines();
  const { data: parts, isLoading: partsLoading } = useMaintenanceParts();

  const [layouts, setLayouts] = useState<{[key: string]: Layout[]}>({});
  const [isLayoutLocked, setIsLayoutLocked] = useState(true);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const defaultLayout: Layout[] = [
    { i: 'stats-1', x: 0, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: 'stats-2', x: 3, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: 'stats-3', x: 6, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: 'stats-4', x: 9, y: 0, w: 3, h: 3, minW: 2, minH: 2 },
    { i: 'chart-machines', x: 0, y: 3, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'chart-parts', x: 4, y: 3, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'chart-stock', x: 8, y: 3, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'action-machines', x: 0, y: 11, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'action-parts', x: 4, y: 11, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'action-maintenance', x: 8, y: 11, w: 4, h: 5, minW: 3, minH: 4 },
    { i: 'activities', x: 0, y: 16, w: 12, h: 6, minW: 6, minH: 4 }
  ];

  useEffect(() => {
    const initializeLayout = () => {
      const savedLayouts = localStorage.getItem('dashboard-layouts');
      if (savedLayouts) {
        try {
          const parsedLayouts = JSON.parse(savedLayouts);
          if (parsedLayouts.lg && Array.isArray(parsedLayouts.lg) && parsedLayouts.lg.length > 0) {
            setLayouts(parsedLayouts);
          } else {
            localStorage.removeItem('dashboard-layouts');
            const standardLayouts = {
              lg: defaultLayout,
              md: defaultLayout,
              sm: defaultLayout,
              xs: defaultLayout,
              xxs: defaultLayout
            };
            setLayouts(standardLayouts);
          }
        } catch (error) {
          localStorage.removeItem('dashboard-layouts');
          const standardLayouts = {
            lg: defaultLayout,
            md: defaultLayout,
            sm: defaultLayout,
            xs: defaultLayout,
            xxs: defaultLayout
          };
          setLayouts(standardLayouts);
        }
      } else {
        const standardLayouts = {
          lg: defaultLayout,
          md: defaultLayout,
          sm: defaultLayout,
          xs: defaultLayout,
          xxs: defaultLayout
        };
        setLayouts(standardLayouts);
      }
      setIsLayoutReady(true);
    };

    const timer = setTimeout(initializeLayout, 100);
    return () => clearTimeout(timer);
  }, []);

  const onLayoutChange = (_: Layout[], allLayouts: {[key: string]: Layout[]}) => {
    setLayouts(allLayouts);
    localStorage.setItem('dashboard-layouts', JSON.stringify(allLayouts));
  };

  const resetLayout = () => {
    const newLayouts = {
      lg: defaultLayout,
      md: defaultLayout,
      sm: defaultLayout,
      xs: defaultLayout,
      xxs: defaultLayout
    };
    setLayouts(newLayouts);
    localStorage.setItem('dashboard-layouts', JSON.stringify(newLayouts));
  };

  const machineStats = machines ? {
    total: machines.length,
    active: machines.filter(m => m.status === 'Active').length,
    inMaintenance: machines.filter(m => m.status === 'InMaintenance').length,
    outOfService: machines.filter(m => m.status === 'OutOfService').length,
    avgOperatingHours: machines.length > 0 ? Math.round(machines.reduce((sum, m) => sum + m.operatingHours, 0) / machines.length) : 0,
    maintenanceDue: machines.filter(m => m.operatingHours > 1000).length,
    recentMaintenances: machines.filter(m => m.lastMaintenanceDate && 
      new Date(m.lastMaintenanceDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
  } : { total: 0, active: 0, inMaintenance: 0, outOfService: 0, avgOperatingHours: 0, maintenanceDue: 0, recentMaintenances: 0 };

  const partStats = parts ? {
    total: parts.length,
    wearParts: parts.filter(p => p.category === 'WearPart').length,
    spareParts: parts.filter(p => p.category === 'SparePart').length,
    consumableParts: parts.filter(p => p.category === 'ConsumablePart').length,
    toolParts: parts.filter(p => p.category === 'ToolPart').length,
    lowStock: parts.filter(p => p.stockQuantity <= 3 && p.stockQuantity > 0).length,
    outOfStock: parts.filter(p => p.stockQuantity === 0).length,
    totalValue: parts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
  } : { total: 0, wearParts: 0, spareParts: 0, consumableParts: 0, toolParts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };

  // Professionelle, dezente Farben
  const machineStatusData = [
    { name: 'Aktiv', value: machineStats.active, color: '#059669' },
    { name: 'In Wartung', value: machineStats.inMaintenance, color: '#D97706' },
    { name: 'Außer Betrieb', value: machineStats.outOfService, color: '#DC2626' }
  ].filter(item => item.value > 0);

  const partsData = [
    { name: 'Verschleißteile', value: partStats.wearParts, color: '#DC2626' },
    { name: 'Ersatzteile', value: partStats.spareParts, color: '#2563EB' },
    { name: 'Verbrauchsmaterial', value: partStats.consumableParts, color: '#D97706' },
    { name: 'Werkzeuge', value: partStats.toolParts, color: '#059669' }
  ].filter(item => item.value > 0);

  const stockData = [
    { name: 'Verfügbar', value: partStats.total - partStats.lowStock - partStats.outOfStock, color: '#059669' },
    { name: 'Niedrig', value: partStats.lowStock, color: '#D97706' },
    { name: 'Ausverkauft', value: partStats.outOfStock, color: '#DC2626' }
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium text-gray-900">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const WidgetWrapper = ({ children, title, className = "", dragHandle = false }: { 
    children: React.ReactNode, 
    title?: string, 
    className?: string,
    dragHandle?: boolean 
  }) => (
    <div className={`bg-white border border-gray-200 shadow-sm h-full ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {dragHandle && !isLayoutLocked && (
            <div className="cursor-move text-gray-400 hover:text-gray-600">
              <Bars3Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      )}
      <div className={title ? "p-4 h-[calc(100%-45px)]" : "p-4 h-full"}>
        {children}
      </div>
    </div>
  );

  const getRecentActivities = (): Activity[] => {
    const activities: Activity[] = [];
    
    if (machines) {
      machines.forEach(machine => {
        if (machine.lastMaintenanceDate) {
          const maintenanceDate = new Date(machine.lastMaintenanceDate);
          const daysAgo = Math.ceil((Date.now() - maintenanceDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysAgo <= 7) {
            activities.push({
              icon: CheckCircleIcon,
              color: "text-green-600",
              title: "Wartung abgeschlossen",
              description: `Maschine ${machine.number} - vor ${daysAgo} Tag${daysAgo !== 1 ? 'en' : ''}`,
              time: maintenanceDate
            });
          }
        }
      });
    }

    if (parts) {
      parts.filter(p => p.stockQuantity <= 3 && p.stockQuantity > 0).slice(0, 2).forEach(part => {
        activities.push({
          icon: ExclamationTriangleIcon,
          color: "text-amber-600",
          title: "Niedriger Lagerbestand",
          description: `${part.name} (${part.partNumber}) - nur noch ${part.stockQuantity} Stück`,
          time: new Date()
        });
      });

      parts.filter(p => p.stockQuantity === 0).slice(0, 1).forEach(part => {
        activities.push({
          icon: XCircleIcon,
          color: "text-red-600",
          title: "Teil ausverkauft",
          description: `${part.name} (${part.partNumber}) - Nachbestellung erforderlich`,
          time: new Date()
        });
      });
    }

    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Professioneller Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Wartungsteile-Management-System</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right text-sm text-gray-500 hidden lg:block">
                <p>Letztes Update: {new Date().toLocaleString('de-DE')}</p>
                <p className="text-xs">
                  {machinesLoading || partsLoading ? 'Daten werden geladen...' : 'Alle Daten aktuell'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsLayoutLocked(!isLayoutLocked)}
                  className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium border transition-colors ${
                    isLayoutLocked 
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  }`}
                  title={isLayoutLocked ? 'Layout editieren' : 'Layout sperren'}
                >
                  <Bars3Icon className="h-4 w-4" />
                  <span>{isLayoutLocked ? 'Editieren' : 'Sperren'}</span>
                </button>
                
                <button
                  onClick={resetLayout}
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  title="Layout zurücksetzen"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dezenter Info-Banner im Edit-Modus */}
        {!isLayoutLocked && (
          <div className="bg-blue-50 border border-blue-200 p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                <Bars3Icon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Layout-Bearbeitung aktiv</h3>
                <p className="text-blue-800 text-sm mt-1">
                  Widgets können per Drag & Drop verschoben und in der Größe angepasst werden.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Layout-Loading State */}
        {!isLayoutReady ? (
          <div className="bg-white border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Layout wird geladen...</p>
          </div>
        ) : (
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            isDraggable={!isLayoutLocked}
            isResizable={!isLayoutLocked}
            margin={[12, 12]}
          >
          {/* Professionelle Statistik-Widgets */}
          <div key="stats-1">
            <WidgetWrapper>
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aktive Maschinen</p>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <p className="text-2xl font-semibold text-gray-900">
                      {machinesLoading ? "..." : machineStats.active}
                    </p>
                    <span className="text-sm text-gray-500">/ {machineStats.total}</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-green-100 flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </WidgetWrapper>
          </div>

          <div key="stats-2">
            <WidgetWrapper>
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Wartungen fällig</p>
                  <p className="text-2xl font-semibold text-amber-600 mt-2">
                    {machinesLoading ? "..." : machineStats.maintenanceDue.toString()}
                  </p>
                </div>
                <div className="w-10 h-10 bg-amber-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </WidgetWrapper>
          </div>

          <div key="stats-3">
            <WidgetWrapper>
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Wartungsteile</p>
                  <p className="text-2xl font-semibold text-blue-600 mt-2">
                    {partsLoading ? "..." : partStats.total.toString()}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">{partStats.outOfStock} ausverkauft</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                  <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </WidgetWrapper>
          </div>

          <div key="stats-4">
            <WidgetWrapper>
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lagerwert</p>
                  <p className="text-2xl font-semibold text-purple-600 mt-2">
                    {partsLoading ? "..." : `${Math.round(partStats.totalValue).toLocaleString('de-DE')}€`}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 flex items-center justify-center">
                  <CubeIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </WidgetWrapper>
          </div>

          {/* Professionelle Chart-Widgets */}
          <div key="chart-machines">
            <WidgetWrapper title="Maschinenstatus" dragHandle>
              {machinesLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : machineStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={machineStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      {machineStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <CogIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">Keine Daten verfügbar</p>
                  </div>
                </div>
              )}
            </WidgetWrapper>
          </div>

          <div key="chart-parts">
            <WidgetWrapper title="Wartungsteile Kategorien" dragHandle>
              {partsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : partsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={partsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={11}
                      stroke="#6b7280"
                    />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {partsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <CubeIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">Keine Daten verfügbar</p>
                  </div>
                </div>
              )}
            </WidgetWrapper>
          </div>

          <div key="chart-stock">
            <WidgetWrapper title="Lagerbestände" dragHandle>
              {partsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : stockData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockData}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      {stockData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <CubeIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">Keine Daten verfügbar</p>
                  </div>
                </div>
              )}
            </WidgetWrapper>
          </div>

          {/* Professionelle Action-Widgets */}
          <div key="action-machines">
            <WidgetWrapper>
              <div className="bg-blue-50 p-4 h-full flex items-center border-l-4 border-blue-500">
                <div className="flex items-start space-x-3 w-full">
                  <div className="w-8 h-8 bg-white shadow-sm flex items-center justify-center">
                    <CogIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-medium text-gray-900 mb-1">Maschinen</h2>
                    <p className="text-gray-600 text-xs mb-3">{machineStats.total} CNC-Lademagazine</p>
                    <button 
                      onClick={() => navigate('/machines')}
                      className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <span>Zu den Maschinen</span>
                    </button>
                  </div>
                </div>
              </div>
            </WidgetWrapper>
          </div>

          <div key="action-parts">
            <WidgetWrapper>
              <div className="bg-amber-50 p-4 h-full flex items-center border-l-4 border-amber-500">
                <div className="flex items-start space-x-3 w-full">
                  <div className="w-8 h-8 bg-white shadow-sm flex items-center justify-center">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-medium text-gray-900 mb-1">Wartungsteile</h2>
                    <p className="text-gray-600 text-xs mb-3">{partStats.total} Ersatzteile</p>
                    <button 
                      onClick={() => navigate('/parts')}
                      className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <span>Zu den Wartungsteilen</span>
                    </button>
                  </div>
                </div>
              </div>
            </WidgetWrapper>
          </div>

          <div key="action-maintenance">
            <WidgetWrapper>
              <div className="bg-green-50 p-4 h-full flex items-center border-l-4 border-green-500">
                <div className="flex items-start space-x-3 w-full">
                  <div className="w-8 h-8 bg-white shadow-sm flex items-center justify-center">
                    <CalendarDaysIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-medium text-gray-900 mb-1">Wartung planen</h2>
                    <p className="text-gray-600 text-xs mb-3">{machineStats.maintenanceDue} fällig</p>
                    <button 
                      onClick={() => alert('Wartungsplanung wird bald verfügbar sein!')}
                      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm font-medium transition-colors"
                    >
                      <span>Neue Wartung</span>
                    </button>
                  </div>
                </div>
              </div>
            </WidgetWrapper>
          </div>

          {/* Professionelle Aktivitäten Widget */}
          <div key="activities">
            <WidgetWrapper title="Letzte Aktivitäten" dragHandle>
              <div className="space-y-3 h-full overflow-y-auto">
                {getRecentActivities().length > 0 ? (
                  getRecentActivities().map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-white shadow-sm flex items-center justify-center">
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <ClockIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="font-medium text-sm">Noch keine Aktivitäten</p>
                    <p className="text-xs mt-1">Aktivitäten werden hier angezeigt</p>
                  </div>
                )}
              </div>
            </WidgetWrapper>
          </div>
        </ResponsiveGridLayout>
        )}
      </div>
    </div>
  );
};

export default Dashboard;