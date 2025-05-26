// src/pages/machines/MachineDetail.tsx - Clean & Professional Design
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
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: machine, isLoading, error, refetch } = useMachineDetail(id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'magazine' | 'maintenance' | 'history'>('overview');

  const renderStatusBadge = (status: string) => {
    const configs = {
      Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircleIcon, label: 'Aktiv' },
      InMaintenance: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: WrenchScrewdriverIcon, label: 'In Wartung' },
      OutOfService: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircleIcon, label: 'Außer Betrieb' }
    };

    const config = configs[status as keyof typeof configs] || {
      bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: InformationCircleIcon, label: 'Unbekannt'
    };

    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg ${config.bg} ${config.text} ${config.border} border`}>
        <IconComponent className="h-4 w-4" />
        <span>{config.label}</span>
      </span>
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

    const maintenanceUrgency = machine.operatingHours > 1000 ? 'high' : 
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
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackLink />
          <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Lade Maschinendetails</h3>
            <p className="text-gray-600">Alle Informationen werden zusammengestellt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackLink />
          <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-red-600 mb-3">Fehler beim Laden der Maschinendetails</h3>
            <p className="text-gray-600 mb-8">
              {error instanceof Error ? error.message : 'Die Maschine konnte nicht gefunden werden.'}
            </p>
            <Link 
              to="/machines"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <Header machine={machine} />
        
        {/* Key Metrics */}
        <MetricsCards machine={machine} metrics={metrics} />
        
        {/* Maintenance Alert */}
        {metrics?.maintenanceUrgency === 'high' && (
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

// Clean Back Link Component
const BackLink = () => (
  <div className="flex items-center space-x-4 mb-8">
    <Link 
      to="/machines" 
      className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium group"
    >
      <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
      <span>Zurück zur Liste</span>
    </Link>
  </div>
);

// Clean Header Component
const Header = ({ machine }: { machine: any }) => (
  <div className="mb-8">
    <BackLink />
    
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
          <CogIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Maschine {machine.number}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-gray-600 text-lg">{machine.type}</span>
            <StatusBadge status={machine.status} />
          </div>
        </div>
      </div>
      
      <ActionButtons machine={machine} />
    </div>
  </div>
);

// Clean Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const configs = {
    Active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircleIcon, label: 'Aktiv' },
    InMaintenance: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: WrenchScrewdriverIcon, label: 'In Wartung' },
    OutOfService: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircleIcon, label: 'Außer Betrieb' }
  };

  const config = configs[status as keyof typeof configs] || {
    bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: InformationCircleIcon, label: 'Unbekannt'
  };

  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg ${config.bg} ${config.text} ${config.border} border`}>
      <IconComponent className="h-4 w-4" />
      <span>{config.label}</span>
    </span>
  );
};

// Clean Action Buttons Component  
const ActionButtons = ({ machine }: { machine: any }) => (
  <div className="flex flex-wrap gap-3">
    <Link 
      to={`/machines/${machine.id}/parts`}
      className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
    >
      <WrenchScrewdriverIcon className="h-4 w-4" />
      <span>Wartungsteile</span>
    </Link>
    
    <Link 
      to={`/machines/${machine.id}/maintenance`}
      className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
    >
      <PlayIcon className="h-4 w-4" />
      <span>Wartung durchführen</span>
    </Link>
    
    <button className="inline-flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all">
      <PencilIcon className="h-4 w-4" />
      <span>Bearbeiten</span>
    </button>
  </div>
);

// Clean Metrics Cards Component
const MetricsCards = ({ machine, metrics }: { machine: any; metrics: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <MetricCard
      title="Betriebsstunden"
      value={`${machine.operatingHours.toLocaleString()} h`}
      subtitle={metrics ? `Ø ${metrics.avgHoursPerYear} h/Jahr` : ''}
      icon={ClockIcon}
      iconColor="text-blue-600"
    />
    
    <MetricCard
      title="Maschinenalter"
      value={`${metrics?.ageInYears || 0} Jahre`}
      subtitle={`Seit ${new Date(machine.installationDate).toLocaleDateString('de-DE')}`}
      icon={CalendarDaysIcon}
      iconColor="text-gray-600"
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
        metrics?.maintenanceUrgency === 'high' ? 'text-red-600' :
        metrics?.maintenanceUrgency === 'medium' ? 'text-amber-600' : 'text-emerald-600'
      }
    />
    
    <MetricCard
      title="Wartungsanzahl"
      value={`${machine.maintenanceCount || 0}`}
      subtitle="Durchgeführte Wartungen"
      icon={ChartBarIcon}
      iconColor="text-gray-600"
    />
  </div>
);

// Reusable Metric Card Component
const MetricCard = ({ title, value, subtitle, icon: Icon, iconColor }: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  iconColor: string;
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
    </div>
  </div>
);

// Clean Maintenance Alert Component
const MaintenanceAlert = ({ machine, metrics }: { machine: any; metrics: any }) => (
  <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
    <div className="flex items-start space-x-4">
      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-red-900 mb-3">Wartung überfällig</h3>
        <p className="text-red-800 mb-6">
          Diese Maschine hat {machine.operatingHours} Betriebsstunden erreicht und sollte gewartet werden.
          {metrics.daysSinceLastMaintenance && metrics.daysSinceLastMaintenance > 180 && (
            ` Die letzte Wartung ist ${metrics.daysSinceLastMaintenance} Tage her.`
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link 
            to={`/machines/${machine.id}/maintenance`}
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
          >
            <WrenchScrewdriverIcon className="h-4 w-4" />
            <span>Wartung planen</span>
          </Link>
          <Link 
            to={`/machines/${machine.id}/parts`}
            className="inline-flex items-center space-x-2 border border-red-300 text-red-700 hover:bg-red-50 px-6 py-3 rounded-xl font-medium transition-all"
          >
            <EyeIcon className="h-4 w-4" />
            <span>Wartungsteile prüfen</span>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

// Clean Tabs Section Component
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

// Clean Overview Tab Component
const OverviewTab = ({ machine, renderStatusBadge, setActiveTab }: {
  machine: any;
  renderStatusBadge: (status: string) => JSX.Element;
  setActiveTab: (tab: 'overview' | 'magazine' | 'maintenance' | 'history') => void;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Basic Information */}
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <CogIcon className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Allgemeine Informationen</h3>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <InfoRow label="Maschinennummer" value={machine.number} />
        <InfoRow label="Typ" value={machine.type} />
        <InfoRow label="Status" value={renderStatusBadge(machine.status)} />
        <InfoRow label="Betriebsstunden" value={`${machine.operatingHours.toLocaleString()} h`} />
        <InfoRow label="Installationsdatum" value={new Date(machine.installationDate).toLocaleDateString('de-DE')} />
      </div>
    </div>

    {/* Magazine Properties Summary */}
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <EyeIcon className="h-4 w-4 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Magazin-Eigenschaften</h3>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <InfoRow 
          label="Magazin-Typ" 
          value={machine.magazineType || <span className="text-gray-500 italic">Nicht angegeben</span>} 
        />
        <InfoRow 
          label="Materialstangenlänge" 
          value={machine.materialBarLength ? `${machine.materialBarLength} mm` : 
                 <span className="text-gray-500 italic">Nicht angegeben</span>} 
        />
        <InfoRow 
          label="Kunde" 
          value={machine.customerName || <span className="text-gray-500 italic">Nicht angegeben</span>} 
        />
        <InfoRow 
          label="Artikelnummer" 
          value={machine.articleNumber || <span className="text-gray-500 italic">Nicht angegeben</span>} 
        />
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setActiveTab('magazine')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            → Alle Magazin-Eigenschaften anzeigen
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Info Row Helper Component
const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

// Clean Maintenance Tab Component
const MaintenanceTab = ({ machine }: { machine: any }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <WrenchScrewdriverIcon className="h-8 w-8 text-gray-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4">Wartungsplanung</h3>
    <p className="text-gray-600 mb-8 max-w-md mx-auto">
      Hier können Sie Wartungen planen und durchführen.
    </p>
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Link 
        to={`/machines/${machine.id}/maintenance`}
        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all"
      >
        <PlayIcon className="h-5 w-5" />
        <span>Wartung durchführen</span>
      </Link>
      <Link 
        to={`/machines/${machine.id}/parts`}
        className="inline-flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-medium transition-all"
      >
        <EyeIcon className="h-5 w-5" />
        <span>Wartungsteile anzeigen</span>
      </Link>
    </div>
  </div>
);

// Clean History Tab Component
const HistoryTab = ({ machine }: { machine: any }) => {
  if (machine.maintenanceRecords && machine.maintenanceRecords.length > 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Wartungshistorie</h3>
        <div className="space-y-4">
          {machine.maintenanceRecords.map((record: any) => (
            <div key={record.id} className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">
                    {record.maintenanceType === 'Regular' ? 'Reguläre Wartung' : 
                     record.maintenanceType === 'OnDemand' ? 'Wartung auf Anfrage' : 'Reparatur'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(record.performedAt).toLocaleDateString('de-DE')} • 
                    Techniker: {record.technicianId}
                  </div>
                </div>
              </div>
              
              {record.replacedParts && record.replacedParts.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Ausgetauschte Teile:</h4>
                  <div className="space-y-2">
                    {record.replacedParts.map((part: any, index: number) => (
                      <div key={index} className="text-sm text-gray-600 flex justify-between bg-white p-3 rounded-lg">
                        <span>{part.partName} ({part.partNumber})</span>
                        <span className="font-medium">{part.quantity} Stück</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {record.comments && (
                <div className="text-sm text-gray-600 italic bg-white p-3 rounded-lg">
                  "{record.comments}"
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
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <ClockIcon className="h-8 w-8 text-gray-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Keine Wartungshistorie</h3>
      <p className="text-gray-600">
        Für diese Maschine wurden noch keine Wartungen dokumentiert.
      </p>
    </div>
  );
};

export default MachineDetail;