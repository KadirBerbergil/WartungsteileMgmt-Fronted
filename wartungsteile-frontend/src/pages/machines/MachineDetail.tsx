// src/pages/machines/MachineDetail.tsx - Mit erweiterten Magazin-Eigenschaften
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMachineDetail } from '../../hooks/useMachines';
import MagazinePropertiesEditor from '../../components/MagazinePropertiesEditor';
import { 
  WrenchScrewdriverIcon, 
  CogIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
  ClockIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  BoltIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: machine, isLoading, error, refetch } = useMachineDetail(id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'magazine' | 'maintenance' | 'history'>('overview');

  // Helper-Funktion für Status-Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="h-4 w-4" />
            <span>Aktiv</span>
          </span>
        );
      case 'InMaintenance':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            <WrenchScrewdriverIcon className="h-4 w-4" />
            <span>In Wartung</span>
          </span>
        );
      case 'OutOfService':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
            <XCircleIcon className="h-4 w-4" />
            <span>Außer Betrieb</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            Unbekannt
          </span>
        );
    }
  };

  // Calculate machine age and health indicators
  const getMachineMetrics = () => {
    if (!machine) return null;

    const installationDate = new Date(machine.installationDate);
    const now = new Date();
    const ageInYears = Math.floor((now.getTime() - installationDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    
    // Estimate operating hours per year (rough calculation)
    const avgHoursPerYear = ageInYears > 0 ? Math.round(machine.operatingHours / ageInYears) : 0;
    
    // Determine maintenance urgency
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
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Link to="/machines" className="text-primary hover:text-primary/80">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">🔍 Lade Maschinendetails</h3>
          <p className="text-gray-500">Alle Informationen werden zusammengestellt...</p>
        </div>
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Link to="/machines" className="text-primary hover:text-primary/80">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-lg font-medium text-red-600 mb-2">Fehler beim Laden der Maschinendetails</h3>
          <p className="text-gray-500 mb-4">
            {error instanceof Error ? error.message : 'Die Maschine konnte nicht gefunden werden.'}
          </p>
          <Link 
            to="/machines"
            className="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Zurück zur Liste</span>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: ChartBarIcon },
    { id: 'magazine', label: 'Magazin-Eigenschaften', icon: CogIcon },
    { id: 'maintenance', label: 'Wartung', icon: WrenchScrewdriverIcon },
    { id: 'history', label: 'Historie', icon: ClockIcon }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link 
            to="/machines" 
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Zurück zur Liste</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CogIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Maschine {machine.number}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-gray-600 text-lg">{machine.type}</span>
                {renderStatusBadge(machine.status)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Link 
            to={`/machines/${machine.id}/parts`}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg"
          >
            <WrenchScrewdriverIcon className="h-4 w-4" />
            <span>Wartungsteile</span>
          </Link>
          
          <Link 
            to={`/machines/${machine.id}/maintenance`}
            className="flex items-center space-x-2 bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg"
          >
            <PlayIcon className="h-4 w-4" />
            <span>Wartung durchführen</span>
          </Link>
          
          <button className="flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-all">
            <PencilIcon className="h-4 w-4" />
            <span>Bearbeiten</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Betriebsstunden</p>
              <p className="text-2xl font-bold text-gray-800">{machine.operatingHours.toLocaleString()} h</p>
              {metrics && (
                <p className="text-xs text-gray-500 mt-1">
                  Ø {metrics.avgHoursPerYear} h/Jahr
                </p>
              )}
            </div>
            <ClockIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maschinenalter</p>
              <p className="text-2xl font-bold text-gray-800">
                {metrics?.ageInYears || 0} Jahre
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Seit {new Date(machine.installationDate).toLocaleDateString('de-DE')}
              </p>
            </div>
            <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Letzte Wartung</p>
              <p className="text-2xl font-bold text-gray-800">
                {machine.lastMaintenanceDate 
                  ? `${metrics?.daysSinceLastMaintenance || 0}d`
                  : 'Nie'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {machine.lastMaintenanceDate 
                  ? new Date(machine.lastMaintenanceDate).toLocaleDateString('de-DE')
                  : 'Keine Wartung dokumentiert'
                }
              </p>
            </div>
            <WrenchScrewdriverIcon className={`h-8 w-8 ${
              metrics?.maintenanceUrgency === 'high' ? 'text-red-600' :
              metrics?.maintenanceUrgency === 'medium' ? 'text-yellow-600' : 'text-green-600'
            }`} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wartungsanzahl</p>
              <p className="text-2xl font-bold text-gray-800">{machine.maintenanceCount || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Durchgeführte Wartungen
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Maintenance Urgency Alert */}
      {metrics?.maintenanceUrgency === 'high' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-2">⚠️ Wartung überfällig!</h3>
              <p className="text-red-700 mb-4">
                Diese Maschine hat {machine.operatingHours} Betriebsstunden erreicht und sollte gewartet werden.
                {metrics.daysSinceLastMaintenance && metrics.daysSinceLastMaintenance > 180 && (
                  ` Die letzte Wartung ist ${metrics.daysSinceLastMaintenance} Tage her.`
                )}
              </p>
              <div className="flex space-x-3">
                <Link 
                  to={`/machines/${machine.id}/maintenance`}
                  className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
                >
                  <WrenchScrewdriverIcon className="h-4 w-4" />
                  <span>Wartung planen</span>
                </Link>
                <Link 
                  to={`/machines/${machine.id}/parts`}
                  className="inline-flex items-center space-x-2 border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all text-sm font-medium"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Wartungsteile prüfen</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                      ? 'border-primary text-primary'
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

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <CogIcon className="h-5 w-5 text-blue-600" />
                    <span>Allgemeine Informationen</span>
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maschinennummer:</span>
                      <span className="font-medium text-gray-800">{machine.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Typ:</span>
                      <span className="font-medium text-gray-800">{machine.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span>{renderStatusBadge(machine.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Betriebsstunden:</span>
                      <span className="font-medium text-gray-800">{machine.operatingHours.toLocaleString()} h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Installationsdatum:</span>
                      <span className="font-medium text-gray-800">
                        {new Date(machine.installationDate).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Magazine Properties Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <SparklesIcon className="h-5 w-5 text-green-600" />
                    <span>Magazin-Eigenschaften (Übersicht)</span>
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Magazin-Typ:</span>
                      <span className="font-medium text-gray-800">
                        {machine.magazineType || <span className="text-gray-400 italic">Nicht angegeben</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Materialstangenlänge:</span>
                      <span className="font-medium text-gray-800">
                        {machine.materialBarLength ? `${machine.materialBarLength} mm` : 
                         <span className="text-gray-400 italic">Nicht angegeben</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kunde:</span>
                      <span className="font-medium text-gray-800">
                        {machine.customerName || <span className="text-gray-400 italic">Nicht angegeben</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Artikelnummer:</span>
                      <span className="font-medium text-gray-800">
                        {machine.articleNumber || <span className="text-gray-400 italic">Nicht angegeben</span>}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        onClick={() => setActiveTab('magazine')}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        → Alle Magazin-Eigenschaften anzeigen ({
                          Object.values(machine).filter(v => v !== null && v !== undefined && v !== '').length
                        } Felder ausgefüllt)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Magazine Properties Tab */}
          {activeTab === 'magazine' && (
            <MagazinePropertiesEditor 
              machine={machine}
              onUpdate={(updatedMachine) => {
                // Trigger refetch to get latest data
                refetch();
              }}
            />
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <WrenchScrewdriverIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">Wartungsplanung</h3>
                <p className="text-gray-500 mb-6">
                  Hier können Sie Wartungen planen und durchführen.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link 
                    to={`/machines/${machine.id}/maintenance`}
                    className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-all"
                  >
                    <PlayIcon className="h-5 w-5" />
                    <span>Wartung durchführen</span>
                  </Link>
                  <Link 
                    to={`/machines/${machine.id}/parts`}
                    className="inline-flex items-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg transition-all"
                  >
                    <EyeIcon className="h-5 w-5" />
                    <span>Wartungsteile anzeigen</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {machine.maintenanceRecords && machine.maintenanceRecords.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Wartungshistorie</h3>
                  <div className="space-y-4">
                    {machine.maintenanceRecords.map((record) => (
                      <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium text-gray-800">
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
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Ausgetauschte Teile:</h4>
                            <div className="space-y-1">
                              {record.replacedParts.map((part, index) => (
                                <div key={index} className="text-sm text-gray-600 flex justify-between">
                                  <span>{part.partName} ({part.partNumber})</span>
                                  <span>{part.quantity} Stück</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {record.comments && (
                          <div className="text-sm text-gray-600 italic">
                            "{record.comments}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">Keine Wartungshistorie</h3>
                  <p className="text-gray-500">
                    Für diese Maschine wurden noch keine Wartungen dokumentiert.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineDetail;