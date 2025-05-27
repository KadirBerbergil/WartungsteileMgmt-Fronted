// src/pages/machines/MachineList.tsx - Clean Professional Design
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMachines } from '../../hooks/useMachines';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  FunnelIcon,
  DocumentArrowUpIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const MachineList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: machines, isLoading, error } = useMachines();

  const filteredMachines = machines?.filter(machine => {
    const matchesSearch = machine.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         machine.type.toLowerCase().includes(searchQuery.toLowerCase());
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
        label: 'Aktiv'
      },
      'InMaintenance': {
        bg: 'bg-amber-50', 
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: WrenchScrewdriverIcon,
        label: 'In Wartung'
      },
      'OutOfService': {
        bg: 'bg-red-50',
        text: 'text-red-700', 
        border: 'border-red-200',
        icon: ExclamationTriangleIcon,
        label: 'Außer Betrieb'
      }
    };

    return configs[status as keyof typeof configs] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700', 
      border: 'border-gray-200',
      icon: CogIcon,
      label: status
    };
  };

  const getMaintenanceUrgency = (hours: number) => {
    if (hours > 1500) return { level: 'critical', color: 'text-red-600', bg: 'bg-red-50' };
    if (hours > 1000) return { level: 'high', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (hours > 500) return { level: 'medium', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-50' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
          <Link 
            to="/machines/upload"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DocumentArrowUpIcon className="h-4 w-4" />
            <span>PDF Import</span>
          </Link>
          
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-sm font-medium text-gray-600">Wartung fällig</p>
              <p className="text-2xl font-bold text-red-600">{stats.maintenanceDue}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
          </div>
        </div>
      </div>

      {/* Machine Grid */}
      {filteredMachines && filteredMachines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachines.map((machine) => {
            const statusConfig = getStatusConfig(machine.status);
            const urgency = getMaintenanceUrgency(machine.operatingHours);
            const StatusIcon = statusConfig.icon;
            const daysSinceLastMaintenance = machine.lastMaintenanceDate 
              ? Math.floor((Date.now() - new Date(machine.lastMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24))
              : null;
            
            return (
              <div key={machine.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
                  
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                    <StatusIcon className="h-3 w-3" />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{machine.operatingHours.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Betriebsstunden</p>
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
                      <span className="capitalize">{urgency.level}</span>
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
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
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
                to="/machines/upload"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DocumentArrowUpIcon className="h-4 w-4" />
                <span>PDF Import starten</span>
              </Link>
              <Link 
                to="/machines/create"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Manuell erstellen</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MachineList;