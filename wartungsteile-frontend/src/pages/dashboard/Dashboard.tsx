// src/pages/dashboard/Dashboard.tsx - Mit Drag & Drop Widgets
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

// TypeScript Interface für Aktivitäten
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

  // Layout State für Drag & Drop
  const [layouts, setLayouts] = useState<{[key: string]: Layout[]}>({});
  const [isLayoutLocked, setIsLayoutLocked] = useState(true); // Standard: Gesperrt
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // Standard-Layout definieren (mit mehr Platz)
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

  // Layout aus LocalStorage laden mit Validierung
  useEffect(() => {
    // Kleine Verzögerung um sicherzustellen, dass die Komponente bereit ist
    const initializeLayout = () => {
      const savedLayouts = localStorage.getItem('dashboard-layouts');
      if (savedLayouts) {
        try {
          const parsedLayouts = JSON.parse(savedLayouts);
          // Validierung: Prüfen ob Layout korrekt ist
          if (parsedLayouts.lg && Array.isArray(parsedLayouts.lg) && parsedLayouts.lg.length > 0) {
            setLayouts(parsedLayouts);
          } else {
            // Fehlerhaftes Layout - zurück zum Standard
            console.log('🔧 Fehlerhaftes Layout erkannt - verwende Standard-Layout');
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
          console.log('🔧 Layout-Parsing-Fehler - verwende Standard-Layout');
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

    // Kleine Verzögerung für stabilere Initialisierung
    const timer = setTimeout(initializeLayout, 100);
    return () => clearTimeout(timer);
  }, []);

  // Layout speichern
  const onLayoutChange = (_: Layout[], allLayouts: {[key: string]: Layout[]}) => {
    setLayouts(allLayouts);
    localStorage.setItem('dashboard-layouts', JSON.stringify(allLayouts));
  };

  // Layout zurücksetzen
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

  // Statistiken berechnen
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

  // Chart-Daten vorbereiten
  const machineStatusData = [
    { name: 'Aktiv', value: machineStats.active, color: '#10B981' },
    { name: 'In Wartung', value: machineStats.inMaintenance, color: '#F59E0B' },
    { name: 'Außer Betrieb', value: machineStats.outOfService, color: '#EF4444' }
  ].filter(item => item.value > 0);

  const partsData = [
    { name: 'Verschleißteile', value: partStats.wearParts, color: '#EF4444' },
    { name: 'Ersatzteile', value: partStats.spareParts, color: '#3B82F6' },
    { name: 'Verbrauchsmaterial', value: partStats.consumableParts, color: '#F59E0B' },
    { name: 'Werkzeuge', value: partStats.toolParts, color: '#10B981' }
  ].filter(item => item.value > 0);

  const stockData = [
    { name: 'Gut verfügbar', value: partStats.total - partStats.lowStock - partStats.outOfStock, color: '#10B981' },
    { name: 'Niedrig', value: partStats.lowStock, color: '#F59E0B' },
    { name: 'Ausverkauft', value: partStats.outOfStock, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Custom Tooltip für die Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Widget-Wrapper Komponente
  const WidgetWrapper = ({ children, title, className = "", dragHandle = false }: { 
    children: React.ReactNode, 
    title?: string, 
    className?: string,
    dragHandle?: boolean 
  }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 h-full ${className}`}>
      {title && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {dragHandle && !isLayoutLocked && (
            <div className="cursor-move text-gray-400 hover:text-gray-600">
              <Bars3Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      )}
      <div className={title ? "p-4 h-[calc(100%-64px)]" : "p-4 h-full"}>
        {children}
      </div>
    </div>
  );

  // Letzte Aktivitäten
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
          color: "text-yellow-600",
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
    <div className="space-y-6">
      {/* Header mit Layout-Kontrollen */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Wartungsteile-Management-System Übersicht</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right text-sm text-gray-500">
            <p>Letztes Update: {new Date().toLocaleString('de-DE')}</p>
            <p className="text-xs">
              {machinesLoading || partsLoading ? 'Daten werden geladen...' : 'Alle Daten aktuell'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsLayoutLocked(!isLayoutLocked)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                isLayoutLocked 
                  ? 'bg-gray-100 text-gray-700 border-gray-300' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
              title={isLayoutLocked ? 'Layout editieren' : 'Layout sperren'}
            >
              <Bars3Icon className="h-4 w-4" />
              <span className="text-sm">{isLayoutLocked ? 'Editieren' : 'Sperren'}</span>
            </button>
            <button
              onClick={resetLayout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Layout zurücksetzen"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span className="text-sm">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info-Banner nur im Edit-Modus */}
      {!isLayoutLocked && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Bars3Icon className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800 text-sm font-medium">
              🎯 Drag & Drop Modus aktiv! Ziehe die Widgets herum und verändere ihre Größe. Das Layout wird automatisch gespeichert.
            </p>
          </div>
        </div>
      )}

      {/* Layout-Loading State */}
      {!isLayoutReady ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-gray-600">Layout wird geladen...</p>
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
          margin={[16, 16]}
        >
        {/* Statistik-Widgets */}
        <div key="stats-1">
          <WidgetWrapper>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktive Maschinen</p>
                <div className="flex items-baseline space-x-1">
                  <p className="text-2xl font-bold text-gray-800">
                    {machinesLoading ? "..." : machineStats.active}
                  </p>
                  <span className="text-sm text-gray-500">/ {machineStats.total}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </WidgetWrapper>
        </div>

        <div key="stats-2">
          <WidgetWrapper>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm font-medium text-gray-600">Wartungen fällig</p>
                <p className="text-2xl font-bold text-gray-800">
                  {machinesLoading ? "..." : machineStats.maintenanceDue.toString()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </WidgetWrapper>
        </div>

        <div key="stats-3">
          <WidgetWrapper>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm font-medium text-gray-600">Wartungsteile</p>
                <p className="text-2xl font-bold text-gray-800">
                  {partsLoading ? "..." : partStats.total.toString()}
                </p>
                <p className="text-xs text-gray-500">{partStats.outOfStock} ausverkauft</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </WidgetWrapper>
        </div>

        <div key="stats-4">
          <WidgetWrapper>
            <div className="flex items-center justify-between h-full">
              <div>
                <p className="text-sm font-medium text-gray-600">Lagerwert</p>
                <p className="text-2xl font-bold text-gray-800">
                  {partsLoading ? "..." : `${Math.round(partStats.totalValue).toLocaleString('de-DE')}€`}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <CubeIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </WidgetWrapper>
        </div>

        {/* Chart-Widgets */}
        <div key="chart-machines">
          <WidgetWrapper title="Maschinenstatus" dragHandle>
            {machinesLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : machineStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={machineStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
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
                <p>Keine Daten verfügbar</p>
              </div>
            )}
          </WidgetWrapper>
        </div>

        <div key="chart-parts">
          <WidgetWrapper title="Wartungsteile Kategorien" dragHandle>
            {partsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : partsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {partsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Keine Daten verfügbar</p>
              </div>
            )}
          </WidgetWrapper>
        </div>

        <div key="chart-stock">
          <WidgetWrapper title="Lagerbestände" dragHandle>
            {partsLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : stockData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockData}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
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
                <p>Keine Daten verfügbar</p>
              </div>
            )}
          </WidgetWrapper>
        </div>

        {/* Action-Widgets */}
        <div key="action-machines">
          <WidgetWrapper>
            <div className="bg-blue-50 p-6 rounded-xl h-full flex items-center">
              <div className="flex items-start space-x-4 w-full">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <CogIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Maschinen</h2>
                  <p className="text-gray-600 text-sm mb-4">{machineStats.total} CNC-Lademagazine</p>
                  <button 
                    onClick={() => navigate('/machines')}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                  >
                    Zu den Maschinen
                  </button>
                </div>
              </div>
            </div>
          </WidgetWrapper>
        </div>

        <div key="action-parts">
          <WidgetWrapper>
            <div className="bg-orange-50 p-6 rounded-xl h-full flex items-center">
              <div className="flex items-start space-x-4 w-full">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <WrenchScrewdriverIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Wartungsteile</h2>
                  <p className="text-gray-600 text-sm mb-4">{partStats.total} Ersatzteile</p>
                  <button 
                    onClick={() => navigate('/parts')}
                    className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                  >
                    Zu den Wartungsteilen
                  </button>
                </div>
              </div>
            </div>
          </WidgetWrapper>
        </div>

        <div key="action-maintenance">
          <WidgetWrapper>
            <div className="bg-green-50 p-6 rounded-xl h-full flex items-center">
              <div className="flex items-start space-x-4 w-full">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <CalendarDaysIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Wartung planen</h2>
                  <p className="text-gray-600 text-sm mb-4">{machineStats.maintenanceDue} fällig</p>
                  <button 
                    onClick={() => alert('Wartungsplanung wird bald verfügbar sein!')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                  >
                    Neue Wartung
                  </button>
                </div>
              </div>
            </div>
          </WidgetWrapper>
        </div>

        {/* Aktivitäten Widget */}
        <div key="activities">
          <WidgetWrapper title="Letzte Aktivitäten" dragHandle>
            <div className="space-y-3 h-full overflow-y-auto">
              {getRecentActivities().length > 0 ? (
                getRecentActivities().map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <ClockIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Noch keine aktuellen Aktivitäten</p>
                </div>
              )}
            </div>
          </WidgetWrapper>
        </div>
      </ResponsiveGridLayout>
      )}
    </div>
  );
};

export default Dashboard;