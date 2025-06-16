import { useNavigate } from 'react-router-dom';
import { useDashboardMetrics, useMaintenanceTrends } from '../../hooks/useDashboard';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
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
  PlusIcon,
  ArrowPathIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const { data: metrics, isLoading: metricsLoading, error: metricsError, refetch } = useDashboardMetrics();
  const { data: trends, isLoading: trendsLoading } = useMaintenanceTrends();

  if (metricsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Fehler beim Laden der Dashboard-Daten</h3>
          <p className="text-gray-600 mb-4">Die Verbindung zum Server konnte nicht hergestellt werden.</p>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (metricsLoading) {
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

  const statusData = metrics ? [
    { name: 'Aktiv', value: metrics.machines.active, color: '#10B981' },
    { name: 'Wartung', value: metrics.machines.inMaintenance, color: '#F59E0B' },
    { name: 'Defekt', value: metrics.machines.outOfService, color: '#EF4444' }
  ] : [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'maintenance_completed':
        return CheckCircleIcon;
      case 'low_stock':
        return ExclamationTriangleIcon;
      case 'out_of_stock':
        return XCircleIcon;
      case 'maintenance_due':
        return ClockIcon;
      default:
        return BellAlertIcon;
    }
  };

  const getActivityIconColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600';
    if (priority === 'medium') return 'text-amber-600';
    if (type === 'maintenance_completed') return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Übersicht über Ihre Wartungssysteme</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Daten aktualisieren"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <div className="text-sm text-gray-500">
            Zuletzt aktualisiert: {metrics && new Date(metrics.lastUpdated).toLocaleTimeString('de-DE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {metrics && (metrics.machines.criticalAlerts > 0 || metrics.parts.outOfStock > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Kritische Warnungen</h3>
              <div className="text-sm text-red-700 mt-1 space-y-1">
                {metrics.machines.criticalAlerts > 0 && (
                  <p>{metrics.machines.criticalAlerts} Maschine(n) benötigen dringend Wartung</p>
                )}
                {metrics.parts.outOfStock > 0 && (
                  <p>{metrics.parts.outOfStock} Wartungsteil(e) sind ausverkauft</p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/maintenance-due')}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Details anzeigen
            </button>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Maschinen"
          value={metrics?.machines.total.toString() || '0'}
          subtitle={`${metrics?.machines.active || 0} aktiv`}
          trend={metrics?.machines.active ? `${Math.round((metrics.machines.active / metrics.machines.total) * 100)}%` : '0%'}
          trendUp={true}
          icon={CogIcon}
          colorClasses="bg-blue-50 text-blue-600"
        />
        
        <MetricCard
          title="Wartungen fällig"
          value={metrics?.machines.maintenanceDue.toString() || '0'}
          subtitle={`${metrics?.machines.criticalAlerts || 0} kritisch`}
          trend={metrics?.machines.criticalAlerts ? `${metrics.machines.criticalAlerts}` : '0'}
          trendUp={false}
          icon={ExclamationTriangleIcon}
          colorClasses="bg-amber-50 text-amber-600"
          alert={metrics && metrics.machines.maintenanceDue > 0}
        />
        
        <MetricCard
          title="Wartungsteile"
          value={metrics?.parts.total.toString() || '0'}
          subtitle={`${metrics?.parts.lowStock || 0} niedriger Bestand`}
          trend={metrics?.parts.reorderRequired ? `${metrics.parts.reorderRequired}` : '0'}
          trendUp={false}
          icon={CubeIcon}
          colorClasses="bg-emerald-50 text-emerald-600"
          alert={metrics && metrics.parts.outOfStock > 0}
        />
        
        <MetricCard
          title="Lagerwert"
          value={metrics ? formatCurrency(metrics.parts.totalValue) : '0€'}
          subtitle="Gesamtbestand"
          trend={metrics?.maintenance.costThisMonth ? formatCurrency(metrics.maintenance.costThisMonth) : '0€'}
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
            <button 
              onClick={() => navigate('/reports/trends')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Details →
            </button>
          </div>
          <div className="h-64">
            {trends && trends.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.monthlyTrends}>
                  <XAxis 
                    dataKey="monthName" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                    labelStyle={{ color: '#374151', fontWeight: 600 }}
                    formatter={(value: number) => [`${value} Wartungen`, 'Anzahl']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maintenanceCount" 
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Keine Wartungsdaten vorhanden</p>
              </div>
            )}
          </div>
          {trends && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-500">Gesamt</p>
                <p className="font-semibold text-gray-900">{trends.totalMaintenances} Wartungen</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Kosten</p>
                <p className="font-semibold text-gray-900">{formatCurrency(trends.totalCost)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Ø Downtime</p>
                <p className="font-semibold text-gray-900">{trends.averageDowntime.toFixed(1)}h</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Maschinenstatus</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                  formatter={(value: number) => [`${value} Maschinen`, 'Anzahl']}
                />
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
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Updates
            </span>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {metrics && metrics.recentActivities.length > 0 ? (
              metrics.recentActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const iconColor = getActivityIconColor(activity.type, activity.priority);
                
                return (
                  <ActivityItem
                    key={index}
                    icon={Icon}
                    iconColor={iconColor}
                    title={activity.title}
                    description={activity.description}
                    time={formatDistanceToNow(new Date(activity.timestamp), { 
                      addSuffix: true, 
                      locale: de 
                    })}
                    priority={activity.priority}
                    onClick={() => {
                      if (activity.machineNumber) {
                        navigate(`/machines/${activity.machineNumber}`);
                      } else if (activity.partNumber) {
                        navigate(`/parts/${activity.partNumber}`);
                      }
                    }}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">Keine aktuellen Aktivitäten</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Schnellaktionen</h3>
          
          <div className="space-y-3">
            <QuickActionButton 
              icon={CogIcon}
              title="Maschinen verwalten"
              subtitle={`${metrics?.machines.total || 0} CNC-Systeme`}
              onClick={() => navigate('/machines')}
              colorClasses="bg-blue-500"
              badge={metrics?.machines.maintenanceDue || 0}
            />
            
            <QuickActionButton 
              icon={WrenchScrewdriverIcon}
              title="Wartungsteile"
              subtitle={`${metrics?.parts.total || 0} Komponenten`}
              onClick={() => navigate('/parts')}
              colorClasses="bg-emerald-500"
              badge={metrics?.parts.lowStock || 0}
            />
            
            <QuickActionButton 
              icon={PlusIcon}
              title="Neue Wartung"
              subtitle="Wartung durchführen"
              onClick={() => navigate('/maintenance/new')}
              colorClasses="bg-purple-500"
            />
            
            <QuickActionButton 
              icon={CalendarDaysIcon}
              title="Wartungsplan"
              subtitle="Termine verwalten"
              onClick={() => navigate('/maintenance/schedule')}
              colorClasses="bg-indigo-500"
            />
          </div>

          {/* Maintenance Stats */}
          {metrics && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Wartungen diesen Monat</span>
                <span className="font-semibold text-gray-900">{metrics.maintenance.completedThisMonth}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Geplant diese Woche</span>
                <span className="font-semibold text-gray-900">{metrics.maintenance.scheduledThisWeek}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Ø Ausfallzeit</span>
                <span className="font-semibold text-gray-900">{metrics.maintenance.averageDowntime.toFixed(1)}h</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, trend, trendUp, icon: Icon, colorClasses, alert }: {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendUp: boolean;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  colorClasses: string;
  alert?: boolean;
}) => {
  return (
    <div className={`bg-white rounded-lg border p-6 transition-all hover:shadow-md ${alert ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}>
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
const ActivityItem = ({ icon: Icon, iconColor, title, description, time, priority, onClick }: {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  onClick?: () => void;
}) => (
  <div 
    className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
    onClick={onClick}
  >
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

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, title, subtitle, onClick, colorClasses, badge }: {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  title: string;
  subtitle: string;
  onClick: () => void;
  colorClasses: string;
  badge?: number;
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
    >
      <div className={`w-10 h-10 ${colorClasses} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-gray-500 text-xs">{subtitle}</p>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          {badge}
        </span>
      )}
    </button>
  );
};

export default EnhancedDashboard;