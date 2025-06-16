// src/pages/machines/MachineDetail.tsx - REPARIERTE VERSION mit onUpdate Handler
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMachineDetail } from '../../hooks/useMachines';
import { useQueryClient } from '@tanstack/react-query';
import MagazinePropertiesEditor from '../../components/MagazinePropertiesEditor';
import { PdfImportModal } from '../../components/pdf-import/PdfImportModal';
import type { MachineDetail as MachineDetailType } from '../../types/api';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  PencilIcon,
  ChartBarIcon,
  PlayIcon,
  ListBulletIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: machine, isLoading, error } = useMachineDetail(id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'maintenance'>('overview');
  const [showPdfImport, setShowPdfImport] = useState(false);
  
  // ✅ NEU: Local state für aktualisierte Machine-Daten
  const [localMachine, setLocalMachine] = useState<MachineDetailType | null>(null);
  const queryClient = useQueryClient();

  // ✅ NEU: Sync localMachine mit server data
  useEffect(() => {
    if (machine) {
      console.log('🔄 MachineDetail: Aktualisiere localMachine mit server data:', machine);
      setLocalMachine(machine);
    }
  }, [machine]);

  // ✅ NEU: Handler für Magazine Properties Updates
  const handleMagazinePropertiesUpdate = (updatedMachine: MachineDetailType) => {
    console.log('🔄 MachineDetail: onUpdate called mit:', updatedMachine);
    
    // Sofort local state aktualisieren
    setLocalMachine(updatedMachine);
    
    // Zusätzlich: Query Cache manuell aktualisieren
    queryClient.setQueryData(['machine', id], updatedMachine);
    
    console.log('✅ MachineDetail: Local state und cache aktualisiert');
  };

  // Handler für PDF Import Complete
  const handlePdfImportComplete = () => {
    // Refetch machine data nach PDF import
    queryClient.invalidateQueries({ queryKey: ['machine', id] });
    setShowPdfImport(false);
  };

  // ✅ Verwende localMachine falls verfügbar, sonst fallback auf machine
  const currentMachine = localMachine || machine;

  const getStatusConfig = (status: string) => {
    const configs = {
      'Active': {
        classes: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircleIcon,
        label: 'Aktiv'
      },
      'InMaintenance': {
        classes: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: WrenchScrewdriverIcon,
        label: 'In Wartung'
      },
      'OutOfService': {
        classes: 'bg-red-50 text-red-700 border-red-200',
        icon: ExclamationTriangleIcon,
        label: 'Außer Betrieb'
      }
    };

    return configs[status as keyof typeof configs] || {
      classes: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: CogIcon,
      label: status
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link to="/machines" className="text-blue-600 hover:text-blue-700 transition-colors">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Maschine wird geladen</h3>
          <p className="text-gray-600">Details werden zusammengestellt...</p>
        </div>
      </div>
    );
  }

  if (error || !currentMachine) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link to="/machines" className="text-blue-600 hover:text-blue-700 transition-colors">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Maschine nicht gefunden</h3>
          <p className="text-gray-600 text-sm mt-2 mb-4">
            Die angeforderte Maschine mit der ID "{id}" existiert nicht oder wurde gelöscht.
          </p>
          <Link 
            to="/machines"
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Zur Maschinen-Liste
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(currentMachine.status);
  const StatusIcon = statusConfig.icon;
  const daysSinceLastMaintenance = currentMachine.lastMaintenanceDate 
    ? Math.floor((Date.now() - new Date(currentMachine.lastMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link 
              to="/machines"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              ← Zurück zur Liste
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <CogIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentMachine.number}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-gray-600">{currentMachine.magazineType || currentMachine.type}</span>
                <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${statusConfig.classes}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link 
            to={`/machines/${id}/edit`}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Bearbeiten</span>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Betriebsstunden</p>
              <p className="text-2xl font-bold text-gray-900">{currentMachine.operatingHours.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Installation</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(currentMachine.installationDate).toLocaleDateString('de-DE')}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CalendarDaysIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wartungen</p>
              <p className="text-2xl font-bold text-gray-900">{currentMachine.maintenanceCount}</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Letzte Wartung</p>
              <p className="text-lg font-bold text-gray-900">
                {daysSinceLastMaintenance !== null ? `vor ${daysSinceLastMaintenance}d` : 'Nie'}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'properties'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Magazin-Eigenschaften
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'maintenance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wartungshistorie
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to={`/machines/${id}/parts`}
                  className="flex items-center space-x-4 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ListBulletIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Wartungsteile</h3>
                    <p className="text-blue-700 text-sm">Liste anzeigen</p>
                  </div>
                </Link>

                <Link
                  to={`/machines/${id}/maintenance`}
                  className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <PlayIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Wartung durchführen</h3>
                    <p className="text-green-700 text-sm">Workflow starten</p>
                  </div>
                </Link>

              </div>

              {/* Basic Machine Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Maschinendaten</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maschinennummer:</span>
                      <span className="font-medium text-gray-900">{currentMachine.number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Typ:</span>
                      <span className="font-medium text-gray-900">{currentMachine.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-700">{statusConfig.label}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Betriebsstunden:</span>
                      <span className="font-medium text-gray-900">{currentMachine.operatingHours.toLocaleString()} h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Installation:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(currentMachine.installationDate).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wartungen:</span>
                      <span className="font-medium text-gray-900">{currentMachine.maintenanceCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ REPARIERT: Properties Tab mit onUpdate Handler */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPdfImport(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <DocumentArrowUpIcon className="h-5 w-5" />
                  <span>PDF Werkstattauftrag importieren</span>
                </button>
              </div>
              <MagazinePropertiesEditor 
                machine={currentMachine} 
                onUpdate={handleMagazinePropertiesUpdate}
              />
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Wartungshistorie</h3>
                <Link
                  to={`/machines/${id}/maintenance`}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlayIcon className="h-4 w-4" />
                  <span>Neue Wartung</span>
                </Link>
              </div>

              {currentMachine.maintenanceRecords && currentMachine.maintenanceRecords.length > 0 ? (
                <div className="space-y-4">
                  {currentMachine.maintenanceRecords.map((record) => (
                    <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <WrenchScrewdriverIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{record.maintenanceType}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(record.performedAt).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {record.replacedParts.length} Teile
                        </span>
                      </div>
                      
                      {record.comments && (
                        <p className="text-sm text-gray-700 mb-3">{record.comments}</p>
                      )}
                      
                      {record.replacedParts.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">Ausgetauschte Teile:</h5>
                          {record.replacedParts.map((part, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span className="text-gray-900">{part.partName} ({part.partNumber})</span>
                              <span className="text-gray-600">{part.quantity}x</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">Keine Wartungen durchgeführt</h3>
                  <p className="text-gray-600 mb-4">Für diese Maschine wurden noch keine Wartungen dokumentiert.</p>
                  <Link
                    to={`/machines/${id}/maintenance`}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span>Erste Wartung durchführen</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PDF Import Modal */}
      <PdfImportModal
        isOpen={showPdfImport}
        onClose={() => setShowPdfImport(false)}
        onImportComplete={handlePdfImportComplete}
      />

    </div>
  );
};

export default MachineDetail;