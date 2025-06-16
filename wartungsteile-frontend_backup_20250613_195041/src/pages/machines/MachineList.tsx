// src/pages/machines/MachineList.tsx - REPARIERTE VERSION ohne ungenutzte Variablen
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMachines, useDeleteMachine } from '../../hooks/useMachines';
import { PdfImportModal } from '../../components/pdf-import/PdfImportModal';
import { useQueryClient } from '@tanstack/react-query';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

type ViewMode = 'grid' | 'table';

const MachineList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [machineToDelete, setMachineToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPdfImport, setShowPdfImport] = useState(false);
  
  const { data: machines, isLoading, error } = useMachines();
  const deleteMachine = useDeleteMachine();
  const queryClient = useQueryClient();

  const filteredMachines = machines?.filter(machine => {
    const matchesSearch = machine.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (machine.magazineType || machine.type).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = machines ? {
    total: machines.length,
    active: machines.filter(m => m.status === 'Active').length,
    inMaintenance: machines.filter(m => m.status === 'InMaintenance').length,
    outOfService: machines.filter(m => m.status === 'OutOfService').length,
    maintenanceDue: machines.filter(m => m.operatingHours > 1000).length
  } : { total: 0, active: 0, inMaintenance: 0, outOfService: 0, maintenanceDue: 0 };

  const getStatusConfig = (status: string) => {
    const configs = {
      'Active': {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircleIcon,
        label: 'Aktiv',
        dot: 'bg-green-500'
      },
      'InMaintenance': {
        bg: 'bg-amber-50', 
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: WrenchScrewdriverIcon,
        label: 'In Wartung',
        dot: 'bg-amber-500'
      },
      'OutOfService': {
        bg: 'bg-red-50',
        text: 'text-red-700', 
        border: 'border-red-200',
        icon: ExclamationTriangleIcon,
        label: 'Außer Betrieb',
        dot: 'bg-red-500'
      }
    };

    return configs[status as keyof typeof configs] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700', 
      border: 'border-gray-200',
      icon: CogIcon,
      label: status,
      dot: 'bg-gray-500'
    };
  };

  const getMaintenanceUrgency = (hours: number) => {
    if (hours > 1500) return { level: 'critical', color: 'text-red-600', bg: 'bg-red-50', label: 'Kritisch' };
    if (hours > 1000) return { level: 'high', color: 'text-amber-600', bg: 'bg-amber-50', label: 'Hoch' };
    if (hours > 500) return { level: 'medium', color: 'text-blue-600', bg: 'bg-blue-50', label: 'Mittel' };
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-50', label: 'Niedrig' };
  };

  // Berechne Magazin-Alter in Jahren aus Produktionswoche (Format: "YYYY/WW" z.B. "2003/46")
  const calculateMagazineAge = (productionWeek: string | undefined): string => {
    if (!productionWeek) return '—';
    
    const match = productionWeek.match(/^(\d{4})\/(\d{1,2})$/);
    if (!match) return '—';
    
    const [, yearStr, weekStr] = match;
    const productionYear = parseInt(yearStr);
    const productionWeekNum = parseInt(weekStr);
    
    // Berechne das Datum aus Jahr und Kalenderwoche
    const jan1 = new Date(productionYear, 0, 1);
    const daysToAdd = (productionWeekNum - 1) * 7;
    const productionDate = new Date(jan1.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    
    // Berechne die Differenz in Jahren
    const now = new Date();
    const diffYears = now.getFullYear() - productionDate.getFullYear();
    const diffMonths = now.getMonth() - productionDate.getMonth();
    
    // Genauere Berechnung
    let age = diffYears;
    if (diffMonths < 0 || (diffMonths === 0 && now.getDate() < productionDate.getDate())) {
      age--;
    }
    
    return age > 0 ? `${age} Jahre` : '< 1 Jahr';
  };

  // Delete handlers
  const handleDeleteClick = (machineId: string) => {
    setMachineToDelete(machineId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!machineToDelete) return;
    
    try {
      await deleteMachine.mutateAsync(machineToDelete);
      setShowDeleteModal(false);
      setMachineToDelete(null);
    } catch (error) {
      console.error('Fehler beim Löschen der Maschine:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setMachineToDelete(null);
  };

  const getMachineToDeleteInfo = () => {
    if (!machineToDelete || !machines) return null;
    return machines.find(m => m.id === machineToDelete);
  };

  const handlePdfImportComplete = () => {
    // Refetch machines data nach PDF import
    queryClient.invalidateQueries({ queryKey: ['machines'] });
    setShowPdfImport(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900">Maschinen werden geladen</h3>
          <p className="text-gray-600">Daten werden zusammengestellt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600">Fehler beim Laden</h3>
          <p className="text-gray-600">Die Maschinen konnten nicht geladen werden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CNC-Maschinen</h1>
          <p className="text-gray-600 mt-1">Lademagazine verwalten und überwachen</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPdfImport(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            <span>PDF Import</span>
          </button>
          <Link 
            to="/machines/create"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Neue Maschine</span>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <CogIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktiv</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wartung</p>
              <p className="text-2xl font-bold text-amber-600">{stats.inMaintenance}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Außer Betrieb</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfService}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wartung fällig</p>
              <p className="text-2xl font-bold text-orange-600">{stats.maintenanceDue}</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter and View Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Maschinen durchsuchen..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle Status</option>
              <option value="Active">Aktiv</option>
              <option value="InMaintenance">In Wartung</option>
              <option value="OutOfService">Außer Betrieb</option>
            </select>

            <button className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <FunnelIcon className="h-4 w-4" />
              <span>Filter</span>
            </button>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
                <span>Liste</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
                <span>Kacheln</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredMachines && filteredMachines.length > 0 ? (
        viewMode === 'table' ? (
          /* TABLE VIEW */
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maschine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Magazin-Alter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wartungsstatus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Installation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Letzte Wartung
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMachines.map((machine) => {
                    const statusConfig = getStatusConfig(machine.status);
                    const urgency = getMaintenanceUrgency(machine.operatingHours);
                    // ✅ REPARIERT: StatusIcon wird nicht mehr deklariert da es nicht verwendet wird
                    const daysSinceLastMaintenance = machine.lastMaintenanceDate 
                      ? Math.floor((Date.now() - new Date(machine.lastMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24))
                      : null;
                    
                    return (
                      <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <CogIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <Link 
                                to={`/machines/${machine.id}`}
                                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                              >
                                {machine.number}
                              </Link>
                              <div className="text-sm text-gray-500">{machine.magazineType || machine.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                            <span className={`text-sm font-medium ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {calculateMagazineAge(machine.productionWeek)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgency.bg} ${urgency.color}`}>
                            {urgency.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-900">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                            {new Date(machine.installationDate).toLocaleDateString('de-DE')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {daysSinceLastMaintenance !== null ? `vor ${daysSinceLastMaintenance}d` : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link 
                              to={`/machines/${machine.id}`}
                              className="inline-flex items-center p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Details anzeigen"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Link 
                              to={`/machines/${machine.id}/edit`}
                              className="inline-flex items-center p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Bearbeiten"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(machine.id)}
                              className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Löschen"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.map((machine) => {
              const statusConfig = getStatusConfig(machine.status);
              const urgency = getMaintenanceUrgency(machine.operatingHours);
              // ✅ REPARIERT: StatusIcon wird nicht mehr deklariert da es nicht verwendet wird
              const daysSinceLastMaintenance = machine.lastMaintenanceDate 
                ? Math.floor((Date.now() - new Date(machine.lastMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24))
                : null;
              
              return (
                <div key={machine.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <CogIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Link 
                          to={`/machines/${machine.id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {machine.number}
                        </Link>
                        <p className="text-sm text-gray-600">{machine.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                      <span className={`text-xs font-medium ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{calculateMagazineAge(machine.productionWeek)}</p>
                      <p className="text-xs text-gray-600">Magazinalter</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">
                        {daysSinceLastMaintenance !== null ? `${daysSinceLastMaintenance}d` : '—'}
                      </p>
                      <p className="text-xs text-gray-600">Letzte Wartung</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Installation:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(machine.installationDate).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Wartungsstatus:</span>
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${urgency.bg} ${urgency.color}`}>
                        <span>{urgency.label}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link 
                      to={`/machines/${machine.id}`}
                      className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>Details</span>
                    </Link>
                    <Link 
                      to={`/machines/${machine.id}/edit`}
                      className="inline-flex items-center justify-center p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(machine.id)}
                      className="inline-flex items-center justify-center p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' ? 'Keine passenden Maschinen gefunden' : 'Noch keine Maschinen registriert'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Versuchen Sie einen anderen Suchbegriff oder Filter' 
              : 'Beginnen Sie mit dem Import Ihrer CNC-Maschinen'
            }
          </p>
          
          {!searchQuery && statusFilter === 'all' && (
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link 
                to="/machines/create"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Maschine erstellen</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Maschine löschen</h3>
                  <p className="text-sm text-gray-600 mt-1">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>

              {getMachineToDeleteInfo() && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CogIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{getMachineToDeleteInfo()?.number}</p>
                      <p className="text-sm text-gray-600">{getMachineToDeleteInfo()?.type}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Betriebsstunden:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {getMachineToDeleteInfo()?.operatingHours.toLocaleString()} h
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {getStatusConfig(getMachineToDeleteInfo()?.status || '').label}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">Achtung!</h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Alle Maschinendaten werden permanent gelöscht</li>
                      <li>• Wartungshistorie geht verloren</li>
                      <li>• Magazin-Eigenschaften werden entfernt</li>
                      <li>• Verknüpfte Wartungsteile bleiben erhalten</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteMachine.isPending}
                  className="flex-1 px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteMachine.isPending}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteMachine.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Wird gelöscht...</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4" />
                      <span>Endgültig löschen</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Import Modal */}
      <PdfImportModal
        isOpen={showPdfImport}
        onClose={() => setShowPdfImport(false)}
        onImportComplete={handlePdfImportComplete}
      />
    </div>
  );
};

export default MachineList;