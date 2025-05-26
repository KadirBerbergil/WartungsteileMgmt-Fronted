// src/pages/machines/MachineDetail.tsx - Premium Business Design
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMachineDetail } from '../../hooks/useMachines';
import MagazinePropertiesEditor from '../../components/MagazinePropertiesEditor';
import { 
  WrenchScrewdriverIcon, 
  CogIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon,
  InformationCircleIcon,
  CubeIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  BuildingOffice2Icon,
  UserIcon
} from '@heroicons/react/24/outline';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: machine, isLoading, error, refetch } = useMachineDetail(id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'magazine' | 'maintenance' | 'history'>('overview');

  const renderStatusBadge = (status: string) => {
    const configs = {
      Active: { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200', 
        dot: 'bg-emerald-400',
        icon: CheckCircleIcon, 
        label: 'Aktiv',
        pulse: true
      },
      InMaintenance: { 
        bg: 'bg-amber-50', 
        text: 'text-amber-700', 
        border: 'border-amber-200', 
        dot: 'bg-amber-400',
        icon: WrenchScrewdriverIcon, 
        label: 'In Wartung',
        pulse: true
      },
      OutOfService: { 
        bg: 'bg-red-50', 
        text: 'text-red-700', 
        border: 'border-red-200', 
        dot: 'bg-red-400',
        icon: XCircleIcon, 
        label: 'Außer Betrieb',
        pulse: false
      }
    };

    const config = configs[status as keyof typeof configs] || {
      bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400',
      icon: InformationCircleIcon, label: 'Unbekannt', pulse: false
    };

    const IconComponent = config.icon;

    return (
      <div className={`inline-flex items-center space-x-3 px-4 py-2 rounded-full border ${config.bg} ${config.text} ${config.border} text-sm font-medium`}>
        <div className={`w-2.5 h-2.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`}></div>
        <IconComponent className="h-4 w-4" />
        <span>{config.label}</span>
      </div>
    );
  };

  const getMachineMetrics = () => {
    if (!machine) return null;

    const installationDate = new Date(machine.installationDate);
    const now = new Date();
    const ageInYears = Math.floor((now.getTime() - installationDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    
    const avgHoursPerYear = ageInYears > 0 ? Math.round(machine.operatingHours / ageInYears) : 0;
    
    const lastMaintenance = machine.lastMaintenanceDate ? new Date(machine.lastMaintenanceDate) : null;
    const daysSinceLastMaintenance = lastMaintenance 
      ? Math.floor((now.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const maintenanceUrgency = machine.operatingHours > 1500 ? 'critical' : 
                              machine.operatingHours > 1000 ? 'high' : 
                              machine.operatingHours > 500 ? 'medium' : 'low';

    return {
      ageInYears,
      avgHoursPerYear,
      daysSinceLastMaintenance,
      maintenanceUrgency
    };
  };

  const metrics = getMachineMetrics();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          <BackLink />
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Maschinendetails werden geladen</h3>
            <p className="text-slate-600">Alle Informationen werden zusammengestellt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          <BackLink />
          <div className="bg-white/70 backdrop-blur-sm border border-red-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-red-600 mb-3">Fehler beim Laden der Maschinendetails</h3>
            <p className="text-slate-600 mb-6">
              {error instanceof Error ? error.message : 'Die Maschine konnte nicht gefunden werden.'}
            </p>
            <Link 
              to="/machines"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Zurück zur Liste</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Premium Header */}
        <Header machine={machine} />
        
        {/* Key Metrics Dashboard */}
        <MetricsCards machine={machine} metrics={metrics} />
        
        {/* Maintenance Alert */}
        {metrics?.maintenanceUrgency === 'critical' && (
          <MaintenanceAlert machine={machine} metrics={metrics} />
        )}

        {/* Tabs Content */}
        <TabsSection 
          machine={machine}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          refetch={refetch}
          renderStatusBadge={renderStatusBadge}
        />
      </div>
    </div>
  );
};

// Back Link Component
const BackLink = () => (
  <div className="flex items-center space-x-4 mb-8">
    <Link 
      to="/machines" 
      className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      <span>Zurück zur Liste</span>
    </Link>
  </div>
);

// Header Component
const Header = ({ machine }: { machine: any }) => (
  <div className="mb-8">
    <BackLink />
    
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex items-center space-x-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <CogIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
              Maschine {machine.number}
            </h1>
            <StatusBadge status={machine.status} />
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <BuildingOffice2Icon className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600 font-medium">{machine.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">Installiert {new Date(machine.installationDate).toLocaleDateString('de-DE')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">{machine.operatingHours.toLocaleString()} Betriebsstunden</span>
            </div>
          </div>
        </div>
      </div>
      
      <ActionButtons machine={machine} />
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const configs = {
    Active: { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-700', 
      border: 'border-emerald-200', 
      dot: 'bg-emerald-400',
      icon: CheckCircleIcon, 
      label: 'Aktiv'
    },
    InMaintenance: { 
      bg: 'bg-amber-50', 
      text: 'text-amber-700', 
      border: 'border-amber-200', 
      dot: 'bg-amber-400',
      icon: WrenchScrewdriverIcon, 
      label: 'In Wartung'
    },
    OutOfService: { 
      bg: 'bg-red-50', 
      text: 'text-red-700', 
      border: 'border-red-200', 
      dot: 'bg-red-400',
      icon: XCircleIcon, 
      label: 'Außer Betrieb'
    }
  };

  const config = configs[status as keyof typeof configs] || {
    bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400',
    icon: InformationCircleIcon, label: 'Unbekannt'
  };

  const IconComponent = config.icon;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} text-sm font-medium`}>
      <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
      <IconComponent className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
};

// Action Buttons Component  
const ActionButtons = ({ machine }: { machine: any }) => (
  <div className="flex flex-wrap gap-3">
    <Link 
      to={`/machines/${machine.id}/parts`}
      className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
    >
      <WrenchScrewdriverIcon className="h-4 w-4" />
      <span>Wartungsteile</span>
    </Link>
    
    <Link 
      to={`/machines/${machine.id}/maintenance`}
      className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
    >
      <PlayIcon className="h-4 w-4" />
      <span>Wartung durchführen</span>
    </Link>
    
    <button className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
      <PencilIcon className="h-4 w-4" />
      <span>Bearbeiten</span>
    </button>
  </div>
);

// Metrics Cards Component
const MetricsCards = ({ machine, metrics }: { machine: any; metrics: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <MetricCard
      title="Betriebsstunden"
      value={`${machine.operatingHours.toLocaleString()} h`}
      subtitle={metrics ? `Ø ${metrics.avgHoursPerYear} h/Jahr` : ''}
      icon={ClockIcon}
      iconColor="text-blue-600"
      gradient="from-blue-500 to-blue-600"
      trend="+12%"
      trendUp={true}
    />
    
    <MetricCard
      title="Maschinenalter"
      value={`${metrics?.ageInYears || 0} Jahre`}
      subtitle={`Seit ${new Date(machine.installationDate).toLocaleDateString('de-DE')}`}
      icon={CalendarDaysIcon}
      iconColor="text-purple-600"
      gradient="from-purple-500 to-purple-600"
    />
    
    <MetricCard
      title="Letzte Wartung"
      value={machine.lastMaintenanceDate ? `${metrics?.daysSinceLastMaintenance || 0}d` : 'Nie'}
      subtitle={machine.lastMaintenanceDate 
        ? new Date(machine.lastMaintenanceDate).toLocaleDateString('de-DE')
        : 'Keine Wartung dokumentiert'
      }
      icon={WrenchScrewdriverIcon}
      iconColor={
        metrics?.maintenanceUrgency === 'critical' ? 'text-red-600' :
        metrics?.maintenanceUrgency === 'high' ? 'text-amber-600' : 'text-emerald-600'
      }
      gradient={
        metrics?.maintenanceUrgency === 'critical' ? 'from-red-500 to-red-600' :
        metrics?.maintenanceUrgency === 'high' ? 'from-amber-500 to-amber-600' : 'from-emerald-500 to-emerald-600'
      }
      alert={metrics?.maintenanceUrgency === 'critical'}
    />
    
    <MetricCard
      title="System-Score"
      value="87%"
      subtitle="Gesamtbewertung"
      icon={ChartBarIcon}
      iconColor="text-indigo-600"
      gradient="from-indigo-500 to-indigo-600"
      trend="+5%"
      trendUp={true}
    />
  </div>
);

// Reusable Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, iconColor, gradient, trend, trendUp, alert }: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  iconColor: string;
  gradient: string;
  trend?: string;
  trendUp?: boolean;
  alert?: boolean;
}) => (
  <div className={`bg-white/70 backdrop-blur-sm border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
    alert ? 'border-red-200/60 ring-2 ring-red-100' : 'border-slate-200/60'
  }`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg transition-all duration-200`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
          <ArrowTrendingUpIcon className={`h-4 w-4 ${trendUp ? '' : 'rotate-180'}`} />
          <span className="text-xs font-semibold">{trend}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</p>
      <p className={`text-2xl font-bold mb-1 ${alert ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </div>
);

// Maintenance Alert Component
const MaintenanceAlert = ({ machine, metrics }: { machine: any; metrics: any }) => (
  <div className="bg-gradient-to-r from-red-50 via-red-50 to-amber-50 border border-red-200/60 rounded-2xl p-6 mb-8 shadow-sm">
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25 flex-shrink-0">
        <ExclamationTriangleIcon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-red-900 mb-3 flex items-center space-x-2">
          <span>Wartung kritisch überfällig</span>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </h3>
        <p className="text-red-800 mb-4">
          Diese Maschine hat {machine.operatingHours.toLocaleString()} Betriebsstunden erreicht und sollte dringend gewartet werden.
          {metrics.daysSinceLastMaintenance && metrics.daysSinceLastMaintenance > 180 && (
            ` Die letzte Wartung ist ${metrics.daysSinceLastMaintenance} Tage her.`
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link 
            to={`/machines/${machine.id}/maintenance`}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-200"
          >
            <WrenchScrewdriverIcon className="h-4 w-4" />
            <span>Sofort-Wartung planen</span>
          </Link>
          <Link 
            to={`/machines/${machine.id}/parts`}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-red-300 text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <EyeIcon className="h-4 w-4" />
            <span>Wartungsteile prüfen</span>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

// Tabs Section Component
const TabsSection = ({ machine, activeTab, setActiveTab, refetch, renderStatusBadge }: {
  machine: any;
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'magazine' | 'maintenance' | 'history') => void;
  refetch: () => void;
  renderStatusBadge: (status: string) => JSX.Element;
}) => {
  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: ChartBarIcon },
    { id: 'magazine', label: 'Magazin-Eigenschaften', icon: CogIcon },
    { id: 'maintenance', label: 'Wartung', icon: WrenchScrewdriverIcon },
    { id: 'history', label: 'Historie', icon: ClockIcon }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50/50 to-transparent">
        <nav className="flex space-x-8 px-8">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <TabIcon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-8">
        {activeTab === 'overview' && (
          <OverviewTab machine={machine} renderStatusBadge={renderStatusBadge} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'magazine' && (
          <MagazinePropertiesEditor 
            machine={machine}
            onUpdate={() => refetch()}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceTab machine={machine} />
        )}

        {activeTab === 'history' && (
          <HistoryTab machine={machine} />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ machine, renderStatusBadge, setActiveTab }: {
  machine: any;
  renderStatusBadge: (status: string) => JSX.Element;
  setActiveTab: (tab: 'overview' | 'magazine' | 'maintenance' | 'history') => void;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* System Information */}
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <CogIcon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">System-Informationen</h3>
      </div>
      <div className="bg-slate-50/50 rounded-xl p-6 space-y-4">
        <InfoRow label="Maschinennummer" value={machine.number} />
        <InfoRow label="Maschinentyp" value={machine.type} />
        <InfoRow label="Status" value={renderStatusBadge(machine.status)} />
        <InfoRow label="Betriebsstunden" value={`${machine.operatingHours.toLocaleString()} h`} />
        <InfoRow label="Installationsdatum" value={new Date(machine.installationDate).toLocaleDateString('de-DE')} />
      </div>
    </div>

    {/* Magazine Properties Summary */}
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Magazin-Eigenschaften</h3>
        </div>
        <button
          onClick={() => setActiveTab('magazine')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          Alle anzeigen →
        </button>
      </div>
      <div className="bg-slate-50/50 rounded-xl p-6 space-y-4">
        <InfoRow 
          label="Magazin-Typ" 
          value={machine.magazineType || <span className="text-slate-500 italic">Nicht konfiguriert</span>} 
        />
        <InfoRow 
          label="Materialstangenlänge" 
          value={machine.materialBarLength ? `${machine.materialBarLength} mm` : 
                 <span className="text-slate-500 italic">Nicht konfiguriert</span>} 
        />
        <InfoRow 
          label="Kunde" 
          value={machine.customerName || <span className="text-slate-500 italic">Nicht angegeben</span>} 
        />
        <InfoRow 
          label="Artikelnummer" 
          value={machine.articleNumber || <span className="text-slate-500 italic">Nicht angegeben</span>} 
        />
        
        {/* Completion Status */}
        <div className="pt-4 border-t border-slate-200/60">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-medium">Konfiguration:</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-slate-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
              <span className="text-sm font-semibold text-slate-700">65%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Info Row Helper Component
const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center">
    <span className="text-slate-600 font-medium">{label}:</span>
    <div className="font-semibold text-slate-800">{value}</div>
  </div>
);

// Maintenance Tab Component
const MaintenanceTab = ({ machine }: { machine: any }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
      <WrenchScrewdriverIcon className="h-8 w-8 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-slate-800 mb-4">Wartungsplanung</h3>
    <p className="text-slate-600 mb-8 max-w-md mx-auto">
      Hier können Sie Wartungen planen und durchführen. Das System analysiert automatisch den Wartungsbedarf.
    </p>
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Link 
        to={`/machines/${machine.id}/maintenance`}
        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
      >
        <PlayIcon className="h-4 w-4" />
        <span>Wartung durchführen</span>
      </Link>
      <Link 
        to={`/machines/${machine.id}/parts`}
        className="inline-flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
      >
        <EyeIcon className="h-4 w-4" />
        <span>Wartungsteile anzeigen</span>
      </Link>
    </div>
  </div>
);

// History Tab Component
const HistoryTab = ({ machine }: { machine: any }) => {
  if (machine.maintenanceRecords && machine.maintenanceRecords.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <DocumentTextIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Wartungshistorie</h3>
        </div>
        <div className="space-y-4">
          {machine.maintenanceRecords.map((record: any) => (
            <div key={record.id} className="bg-slate-50/50 rounded-xl p-6 border border-slate-200/60">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="font-semibold text-slate-800">
                      {record.maintenanceType === 'Regular' ? 'Reguläre Wartung' : 
                       record.maintenanceType === 'OnDemand' ? 'Wartung auf Anfrage' : 'Reparatur'}
                    </div>
                    <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {record.maintenanceType}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span>{new Date(record.performedAt).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UserIcon className="h-4 w-4" />
                      <span>Techniker: {record.technicianId}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {record.replacedParts && record.replacedParts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center space-x-2">
                    <CubeIcon className="h-4 w-4" />
                    <span>Ausgetauschte Teile:</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {record.replacedParts.map((part: any, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200/60">
                        <span className="text-sm text-slate-700">{part.partName} ({part.partNumber})</span>
                        <span className="font-semibold text-slate-800 text-sm">{part.quantity} Stück</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {record.comments && (
                <div className="bg-white p-4 rounded-lg border border-slate-200/60">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Kommentare:</h4>
                  <p className="text-sm text-slate-600 italic">"{record.comments}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-400/25">
        <ClockIcon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Keine Wartungshistorie</h3>
      <p className="text-slate-600">
        Für diese Maschine wurden noch keine Wartungen dokumentiert.
      </p>
    </div>
  );
};

export default MachineDetail;