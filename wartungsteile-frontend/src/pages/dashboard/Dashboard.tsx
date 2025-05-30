// src/pages/dashboard/Dashboard.tsx - KORRIGIERTE VERSION mit fixen Tailwind-Klassen
import { useNavigate } from 'react-router-dom';
import { useMachines } from '../../hooks/useMachines';
import { useMaintenanceParts } from '../../hooks/useParts';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  CogIcon, 
  WrenchScrewdriverIcon, 
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: machines, isLoading: machinesLoading, error: machinesError } = useMachines();
  const { data: parts, isLoading: partsLoading, error: partsError } = useMaintenanceParts();

  // ✅ Null-Safety: Sicherstellen dass machines ein Array ist
  const machineStats = machines && Array.isArray(machines) ? {
    total: machines.length,
    active: machines.filter(m => m?.status === 'Active').length,
    inMaintenance: machines.filter(m => m?.status === 'InMaintenance').length,
    outOfService: machines.filter(m => m?.status === 'OutOfService').length,
    maintenanceDue: machines.filter(m => m?.operatingHours && m.operatingHours > 1000).length,
  } : { total: 0, active: 0, inMaintenance: 0, outOfService: 0, maintenanceDue: 0 };

  // ✅ Null-Safety: Sicherstellen dass parts ein Array ist
  const partStats = parts && Array.isArray(parts) ? {
    total: parts.length,
    lowStock: parts.filter(p => p?.stockQuantity !== undefined && p.stockQuantity <= 3 && p.stockQuantity > 0).length,
    outOfStock: parts.filter(p => p?.stockQuantity === 0).length,
    totalValue: parts.reduce((sum, p) => sum + ((p?.price || 0) * (p?.stockQuantity || 0)), 0)
  } : { total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };

  // Mock data for charts
  const trendData = [
    { month: 'Jan', wartungen: 12 },
    { month: 'Feb', wartungen: 15 },
    { month: 'Mär', wartungen: 18 },
    { month: 'Apr', wartungen: 14 },
    { month: 'Mai', wartungen: 22 },
    { month: 'Jun', wartungen: 19 }
  ];

  const statusData = [
    { name: 'Aktiv', value: machineStats.active, color: '#10B981' },
    { name: 'Wartung', value: machineStats.inMaintenance, color: '#F59E0B' },
    { name: 'Defekt', value: machineStats.outOfService, color: '#EF4444' }
  ];

  // ✅ Fehlerbehandlung für beide Hooks
  if (machinesError || partsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Fehler beim Laden der Daten</h3>
          <p className="text-gray-600 mb-4">
            {machinesError ? 'Maschinen konnten nicht geladen werden. ' : ''}
            {partsError ? 'Wartungsteile konnten nicht geladen werden.' : ''}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    );
  }

  if (machinesLoading || partsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard wird geladen</h3>
          <p className="text-gray-600">Daten werden zusammengestellt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Übersicht über Ihre Wartungssysteme</p>
        </div>
        <div className="text-sm text-gray-500">
          Zuletzt aktualisiert: {new Date().toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ✅ FIX: Statische Klassen in MetricCard verwenden */}
        <MetricCard
          title="Maschinen"
          value={machineStats.total.toString()}
          subtitle={`${machineStats.active} aktiv`}
          trend="+2"
          trendUp={true}
          icon={CogIcon}
          colorClasses="bg-blue-50 text-blue-600"
        />
        
        <MetricCard
          title="Wartungen fällig"
          value={machineStats.maintenanceDue.toString()}
          subtitle="Benötigen Service"
          trend="+1"
          trendUp={false}
          icon={ExclamationTriangleIcon}
          colorClasses="bg-amber-50 text-amber-600"
          alert={machineStats.maintenanceDue > 0}
        />
        
        <MetricCard
          title="Wartungsteile"
          value={partStats.total.toString()}
          subtitle={`${partStats.outOfStock} ausverkauft`}
          trend="-1"
          trendUp={false}
          icon={CubeIcon}
          colorClasses="bg-emerald-50 text-emerald-600"
        />
        
        <MetricCard
          title="Lagerwert"
          value={`${Math.round(partStats.totalValue / 1000)}k€`}
          subtitle="Gesamtbestand"
          trend="+5%"
          trendUp={true}
          icon={WrenchScrewdriverIcon}
          colorClasses="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Wartungstrend</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Details →
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="wartungen" 
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Maschinenstatus</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  innerRadius={30}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Letzte Aktivitäten</h3>
            <span className="text-sm text-gray-500">Live Updates</span>
          </div>
          
          <div className="space-y-4">
            {partStats.outOfStock > 0 && (
              <ActivityItem
                icon={XCircleIcon}
                iconColor="text-red-600"
                title="Teil ausverkauft"
                description="Wartungsteile benötigen Nachbestellung"
                time="vor 2 Stunden"
                priority="high"
              />
            )}
            
            <ActivityItem
              icon={CheckCircleIcon}
              iconColor="text-green-600"
              title="Wartung abgeschlossen"
              description="CNC-Maschine 001 erfolgreich gewartet"
              time="vor 4 Stunden"
              priority="low"
            />
            
            <ActivityItem
              icon={ClockIcon}
              iconColor="text-amber-600"
              title="Wartung geplant"
              description="Routinewartung für 3 Maschinen eingeplant"
              time="vor 1 Tag"
              priority="medium"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Schnellaktionen</h3>
          
          <div className="space-y-3">
            <QuickActionButton 
              icon={CogIcon}
              title="Maschinen verwalten"
              subtitle={`${machineStats.total} CNC-Systeme`}
              onClick={() => navigate('/machines')}
              colorClasses="bg-blue-500"
            />
            
            <QuickActionButton 
              icon={WrenchScrewdriverIcon}
              title="Wartungsteile"
              subtitle={`${partStats.total} Komponenten`}
              onClick={() => navigate('/parts')}
              colorClasses="bg-emerald-500"
            />
            
            <QuickActionButton 
              icon={PlusIcon}
              title="Neue Wartung"
              subtitle="Wartung planen"
              onClick={() => alert('Wartungsplanung öffnet bald')}
              colorClasses="bg-purple-500"
            />
            
            <QuickActionButton 
              icon={CalendarDaysIcon}
              title="Service Kalender"
              subtitle="Termine anzeigen"
              onClick={() => alert('Kalender öffnet bald')}
              colorClasses="bg-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ FIX: MetricCard mit statischen Klassen
const MetricCard = ({ title, value, subtitle, trend, trendUp, icon: Icon, colorClasses, alert }: {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendUp: boolean;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  colorClasses: string; // ✅ Jetzt statische Klassen
  alert?: boolean;
}) => {
  return (
    <div className={`bg-white rounded-lg border p-6 ${alert ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
          <span className="font-medium">{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ icon: Icon, iconColor, title, description, time, priority }: {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}) => (
  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
      priority === 'high' ? 'bg-red-100' : 
      priority === 'medium' ? 'bg-amber-100' : 'bg-green-100'
    }`}>
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 text-sm">{title}</p>
      <p className="text-gray-600 text-sm">{description}</p>
      <p className="text-gray-500 text-xs mt-1">{time}</p>
    </div>
  </div>
);

// ✅ FIX: QuickActionButton mit statischen Klassen
const QuickActionButton = ({ icon: Icon, title, subtitle, onClick, colorClasses }: {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  title: string;
  subtitle: string;
  onClick: () => void;
  colorClasses: string; // ✅ Jetzt statische Klassen
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
    >
      <div className={`w-10 h-10 ${colorClasses} rounded-lg flex items-center justify-center`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-gray-500 text-xs">{subtitle}</p>
      </div>
    </button>
  );
};

export default Dashboard;