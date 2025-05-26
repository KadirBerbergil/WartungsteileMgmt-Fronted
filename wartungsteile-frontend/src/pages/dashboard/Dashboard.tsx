// src/pages/dashboard/Dashboard.tsx - Premium Business Design
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { useMachines } from '../../hooks/useMachines';
import { useMaintenanceParts } from '../../hooks/useParts';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
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
  ArrowPathIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  BoltIcon,
  ChartBarIcon
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
  priority: 'high' | 'medium' | 'low';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: machines, isLoading: machinesLoading } = useMachines();
  const { data: parts, isLoading: partsLoading } = useMaintenanceParts();

  const [layouts, setLayouts] = useState<{[key: string]: Layout[]}>({});
  const [isLayoutLocked, setIsLayoutLocked] = useState(true);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const defaultLayout: Layout[] = [
    { i: 'welcome', x: 0, y: 0, w: 12, h: 4, minW: 6, minH: 3 },
    { i: 'stats-1', x: 0, y: 4, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'stats-2', x: 3, y: 4, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'stats-3', x: 6, y: 4, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'stats-4', x: 9, y: 4, w: 3, h: 4, minW: 2, minH: 3 },
    { i: 'chart-machines', x: 0, y: 8, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'chart-trend', x: 4, y: 8, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'chart-parts', x: 8, y: 8, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'activities', x: 0, y: 16, w: 8, h: 6, minW: 6, minH: 4 },
    { i: 'quick-actions', x: 8, y: 16, w: 4, h: 6, minW: 3, minH: 4 }
  ];

  useEffect(() => {
    const initializeLayout = () => {
      const savedLayouts = localStorage.getItem('dashboard-layouts-v2');
      if (savedLayouts) {
        try {
          const parsedLayouts = JSON.parse(savedLayouts);
          if (parsedLayouts.lg && Array.isArray(parsedLayouts.lg) && parsedLayouts.lg.length > 0) {
            setLayouts(parsedLayouts);
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
        } catch (error) {
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
    localStorage.setItem('dashboard-layouts-v2', JSON.stringify(allLayouts));
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
    localStorage.setItem('dashboard-layouts-v2', JSON.stringify(newLayouts));
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

  // Premium color palette
  const colors = {
    primary: '#4f46e5', // indigo-600
    success: '#059669', // emerald-600
    warning: '#d97706', // amber-600
    danger: '#dc2626',  // red-600
    info: '#0284c7',    // sky-600
    slate: '#475569'    // slate-600
  };

  const machineStatusData = [
    { name: 'Aktiv', value: machineStats.active, color: colors.success },
    { name: 'In Wartung', value: machineStats.inMaintenance, color: colors.warning },
    { name: 'Außer Betrieb', value: machineStats.outOfService, color: colors.danger }
  ].filter(item => item.value > 0);

  const partsData = [
    { name: 'Verschleißteile', value: partStats.wearParts, color: colors.danger },
    { name: 'Ersatzteile', value: partStats.spareParts, color: colors.primary },
    { name: 'Verbrauchsmaterial', value: partStats.consumableParts, color: colors.warning },
    { name: 'Werkzeuge', value: partStats.toolParts, color: colors.success }
  ].filter(item => item.value > 0);

  // Mock trend data
  const trendData = [
    { month: 'Jan', wartungen: 12, kosten: 8400 },
    { month: 'Feb', wartungen: 15, kosten: 9200 },
    { month: 'Mär', wartungen: 18, kosten: 11800 },
    { month: 'Apr', wartungen: 14, kosten: 9600 },
    { month: 'Mai', wartungen: 22, kosten: 14200 },
    { month: 'Jun', wartungen: 19, kosten: 12800 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200/60 backdrop-blur-sm">
          <p className="font-semibold text-slate-800">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const PremiumCard = ({ children, className = "", isDraggable = false }: { 
    children: React.ReactNode, 
    className?: string,
    isDraggable?: boolean 
  }) => (
    <div className={`bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 h-full ${className}`}>
      {isDraggable && !isLayoutLocked && (
        <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity cursor-move z-10">
          <Bars3Icon className="h-4 w-4 text-slate-400" />
        </div>
      )}
      {children}
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
              color: "text-emerald-600",
              title: "Wartung abgeschlossen",
              description: `Maschine ${machine.number} - vor ${daysAgo} Tag${daysAgo !== 1 ? 'en' : ''}`,
              time: maintenanceDate,
              priority: 'low'
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
          time: new Date(),
          priority: 'medium'
        });
      });

      parts.filter(p => p.stockQuantity === 0).slice(0, 1).forEach(part => {
        activities.push({
          icon: XCircleIcon,
          color: "text-red-600",
          title: "Teil ausverkauft",
          description: `${part.name} (${part.partNumber}) - Nachbestellung erforderlich`,
          time: new Date(),
          priority: 'high'
        });
      });
    }

    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 6);
  };

  if (!isLayoutReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Dashboard wird geladen</h3>
          <p className="text-slate-600">Ihr persönliches Kontrollzentrum wird vorbereitet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-indigo-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                    Control Center
                  </h1>
                  <p className="text-slate-600 font-medium">Wartungsteile-Management Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-600 font-medium">System Online</span>
                </div>
                <div className="text-slate-500">
                  Letztes Update: {currentTime.toLocaleString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                  })}
                </div>
                <div className="text-slate-500">
                  {machinesLoading || partsLoading ? 'Daten werden aktualisiert...' : 'Alle Systeme bereit'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLayoutLocked(!isLayoutLocked)}
                className={`inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isLayoutLocked 
                    ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200' 
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                }`}
                title={isLayoutLocked ? 'Layout bearbeiten' : 'Layout sperren'}
              >
                <Bars3Icon className="h-4 w-4" />
                <span>{isLayoutLocked ? 'Anpassen' : 'Sperren'}</span>
              </button>
              
              <button
                onClick={resetLayout}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                title="Layout zurücksetzen"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Edit Mode Banner */}
        {!isLayoutLocked && (
          <div className="mb-8 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 border border-indigo-200/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Bars3Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 mb-1">Layout-Editor aktiv</h3>
                <p className="text-indigo-700 text-sm">
                  Widgets können per Drag & Drop verschoben und in der Größe angepasst werden. Änderungen werden automatisch gespeichert.
                </p>
              </div>
            </div>
          </div>
        )}

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
          
          {/* Welcome Widget */}
          <div key="welcome">
            <PremiumCard className="overflow-hidden" isDraggable>
              <div className="relative h-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-slate-700 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]"></div>
                <div className="relative p-8 h-full flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <BoltIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Willkommen zurück!</h2>
                        <p className="text-indigo-100">Ihr Wartungs-Dashboard ist bereit</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{machineStats.total}</div>
                        <div className="text-indigo-200 text-sm">Maschinen</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{partStats.total}</div>
                        <div className="text-indigo-200 text-sm">Wartungsteile</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{machineStats.maintenanceDue}</div>
                        <div className="text-indigo-200 text-sm">Wartungen fällig</div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <CogIcon className="h-16 w-16 text-white/80 animate-spin" style={{animationDuration: '8s'}} />
                    </div>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* Premium Stats Cards */}
          <div key="stats-1">
            <PremiumCard isDraggable>
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-600">
                    <TrendingUpIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">+8%</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {machinesLoading ? "..." : machineStats.active}
                  </div>
                  <div className="text-slate-600 text-sm font-medium">Aktive Maschinen</div>
                  <div className="text-slate-500 text-xs mt-1">von {machineStats.total} gesamt</div>
                </div>
              </div>
            </PremiumCard>
          </div>

          <div key="stats-2">
            <PremiumCard isDraggable>
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-amber-600">
                    <TrendingUpIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">+12%</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {machinesLoading ? "..." : machineStats.maintenanceDue}
                  </div>
                  <div className="text-slate-600 text-sm font-medium">Wartungen fällig</div>
                  <div className="text-slate-500 text-xs mt-1">Benötigen Service</div>
                </div>
              </div>
            </PremiumCard>
          </div>

          <div key="stats-3">
            <PremiumCard isDraggable>
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-red-600">
                    <TrendingDownIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">-3%</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {partsLoading ? "..." : partStats.total}
                  </div>
                  <div className="text-slate-600 text-sm font-medium">Wartungsteile</div>
                  <div className="text-slate-500 text-xs mt-1">{partStats.outOfStock} ausverkauft</div>
                </div>
              </div>
            </PremiumCard>
          </div>

          <div key="stats-4">
            <PremiumCard isDraggable>
              <div className="p-6 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <CubeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-purple-600">
                    <TrendingUpIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">+5%</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {partsLoading ? "..." : `${Math.round(partStats.totalValue / 1000)}k€`}
                  </div>
                  <div className="text-slate-600 text-sm font-medium">Lagerwert</div>
                  <div className="text-slate-500 text-xs mt-1">Gesamtbestand</div>
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* Premium Charts */}
          <div key="chart-machines">
            <PremiumCard isDraggable>
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">Maschinenstatus</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-xs text-slate-500 font-medium">Live Status</span>
                  </div>
                </div>
                {machinesLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : machineStatusData.length > 0 ? (
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={machineStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius="70%"
                          innerRadius="45%"
                          dataKey="value"
                          label={({value}) => value}
                        >
                          {machineStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <CogIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm">Keine Daten verfügbar</p>
                    </div>
                  </div>
                )}
              </div>
            </PremiumCard>
          </div>

          <div key="chart-trend">
            <PremiumCard isDraggable>
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">Wartungstrend</h3>
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Details</button>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="wartungen" 
                        stroke={colors.primary}
                        strokeWidth={3}
                        dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </PremiumCard>
          </div>

          <div key="chart-parts">
            <PremiumCard isDraggable>
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">Teile-Kategorien</h3>
                  <button 
                    onClick={() => navigate('/parts')}
                    className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <EyeIcon className="h-3 w-3" />
                    <span>Anzeigen</span>
                  </button>
                </div>
                {partsLoading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : partsData.length > 0 ? (
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={partsData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                        />
                        <YAxis 
                          type="category"
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          width={100}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {partsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <CubeIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm">Keine Daten verfügbar</p>
                    </div>
                  </div>
                )}
              </div>
            </PremiumCard>
          </div>

          {/* Premium Activities */}
          <div key="activities">
            <PremiumCard isDraggable>
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-800">Letzte Aktivitäten</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-500 font-medium">Live Updates</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {getRecentActivities().length > 0 ? (
                    getRecentActivities().map((activity, index) => (
                      <div key={index} className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-slate-50/50 transition-all duration-200 border border-transparent hover:border-slate-200/60">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          activity.priority === 'high' ? 'bg-red-100 text-red-600' :
                          activity.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-emerald-100 text-emerald-600'
                        }`}>
                          <activity.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-slate-800 text-sm">{activity.title}</p>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              activity.priority === 'high' ? 'bg-red-100 text-red-700' :
                              activity.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {activity.priority === 'high' ? 'Hoch' : activity.priority === 'medium' ? 'Mittel' : 'Info'}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm">{activity.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                      <div className="text-center">
                        <ClockIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="font-medium text-sm">Keine aktuellen Aktivitäten</p>
                        <p className="text-xs mt-1">Updates werden hier angezeigt</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* Premium Quick Actions */}
          <div key="quick-actions">
            <PremiumCard isDraggable>
              <div className="p-6 h-full flex flex-col">
                <h3 className="font-semibold text-slate-800 mb-6">Schnellaktionen</h3>
                <div className="flex-1 space-y-4">
                  <button 
                    onClick={() => navigate('/machines')}
                    className="w-full group flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40">
                      <CogIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-slate-800 mb-1">Maschinen verwalten</div>
                      <div className="text-slate-600 text-sm">{machineStats.total} CNC-Systeme</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => navigate('/parts')}
                    className="w-full group flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-xl border border-emerald-200/50 hover:border-emerald-300/50 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40">
                      <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-slate-800 mb-1">Wartungsteile</div>
                      <div className="text-slate-600 text-sm">{partStats.total} Komponenten</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => alert('Wartungsplanung wird bald verfügbar sein!')}
                    className="w-full group flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-xl border border-purple-200/50 hover:border-purple-300/50 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40">
                      <CalendarDaysIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-slate-800 mb-1">Wartung planen</div>
                      <div className="text-slate-600 text-sm">{machineStats.maintenanceDue} fällig</div>
                    </div>
                  </button>
                </div>
              </div>
            </PremiumCard>
          </div>

        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default Dashboard;