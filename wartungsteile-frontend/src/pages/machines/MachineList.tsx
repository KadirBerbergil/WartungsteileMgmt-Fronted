// src/pages/machines/MachineList.tsx - Professionelle B2B-Version
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMachines } from '../../hooks/useMachines';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';

const MachineList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const { data: machines, isLoading, error } = useMachines();

  const filteredMachines = machines?.filter(machine => 
    machine.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      'Active': {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        label: 'Aktiv'
      },
      'InMaintenance': {
        bg: 'bg-amber-50', 
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'In Wartung'
      },
      'OutOfService': {
        bg: 'bg-red-50',
        text: 'text-red-700', 
        border: 'border-red-200',
        label: 'Außer Betrieb'
      }
    };

    const style = styles[status as keyof typeof styles] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700', 
      border: 'border-gray-200',
      label: status
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
        {style.label}
      </span>
    );
  };

  const stats = machines ? {
    total: machines.length,
    active: machines.filter(m => m.status === 'Active').length,
    inMaintenance: machines.filter(m => m.status === 'InMaintenance').length,
    outOfService: machines.filter(m => m.status === 'OutOfService').length,
    avgOperatingHours: Math.round(machines.reduce((sum, m) => sum + m.operatingHours, 0) / machines.length)
  } : { total: 0, active: 0, inMaintenance: 0, outOfService: 0, avgOperatingHours: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Professioneller Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Maschinen</h1>
              <p className="text-gray-600 mt-1">CNC-Lademagazine verwalten und überwachen</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                to="/machines/upload"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                <DocumentArrowUpIcon className="h-4 w-4" />
                <span>Dokument-Upload</span>
              </Link>
              
              <div className="relative">
                <button 
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="inline-flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Neu</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showCreateMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-lg z-50">
                    <div className="py-1">
                      <Link
                        to="/machines/create"
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        onClick={() => setShowCreateMenu(false)}
                      >
                        <PlusIcon className="h-4 w-4 text-gray-400" />
                        <span>Maschine erstellen</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Professionelle Statistik-Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gesamte Maschinen</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                <CogIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aktiv</p>
                <p className="text-2xl font-semibold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">In Wartung</p>
                <p className="text-2xl font-semibold text-amber-600 mt-1">{stats.inMaintenance}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 flex items-center justify-center">
                <WrenchScrewdriverIcon className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ø Betriebsstunden</p>
                <p className="text-2xl font-semibold text-blue-600 mt-1">{stats.avgOperatingHours}h</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Professionelle Such- und Filter-Bar */}
        <div className="bg-white border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Maschinen durchsuchen..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors">
                <FunnelIcon className="h-4 w-4" />
                <span>Filter</span>
              </button>
              
              <div className="flex bg-gray-100">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 transition-colors ${
                    viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="bg-white border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 text-sm">Maschinen werden geladen...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 p-8 text-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-medium">Fehler beim Laden der Maschinen</p>
          </div>
        ) : filteredMachines && filteredMachines.length > 0 ? (
          viewMode === 'table' ? (
            // Professionelle Tabelle
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maschine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Betriebsstunden</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Letzte Wartung</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMachines.map((machine) => (
                    <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                            <CogIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <Link to={`/machines/${machine.id}`} className="font-medium text-gray-900 hover:text-blue-600 text-sm">
                              {machine.number}
                            </Link>
                            <div className="text-xs text-gray-500">{machine.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(machine.status)}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 text-sm">{machine.operatingHours}h</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900 text-sm">
                          {machine.lastMaintenanceDate 
                            ? new Date(machine.lastMaintenanceDate).toLocaleDateString('de-DE')
                            : <span className="text-gray-400 italic">Keine</span>
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900 text-sm">
                          {new Date(machine.installationDate).toLocaleDateString('de-DE')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/machines/${machine.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Details
                          </Link>
                          <span className="text-gray-300">|</span>
                          <Link 
                            to={`/machines/${machine.id}/edit`}
                            className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                          >
                            Bearbeiten
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Professionelle Grid-Ansicht
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMachines.map((machine) => (
                <div key={machine.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                          <CogIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{machine.number}</h3>
                          <p className="text-xs text-gray-600">{machine.type}</p>
                        </div>
                      </div>
                      {getStatusBadge(machine.status)}
                    </div>
                    
                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Betriebsstunden</span>
                        <span className="font-medium text-gray-900">{machine.operatingHours}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Letzte Wartung</span>
                        <span className="font-medium text-gray-900">
                          {machine.lastMaintenanceDate 
                            ? new Date(machine.lastMaintenanceDate).toLocaleDateString('de-DE')
                            : <span className="text-gray-400">Keine</span>
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Installation</span>
                        <span className="font-medium text-gray-900">
                          {new Date(machine.installationDate).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/machines/${machine.id}`}
                        className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                      >
                        <EyeIcon className="h-3 w-3" />
                        <span>Details</span>
                      </Link>
                      <Link 
                        to={`/machines/${machine.id}/edit`}
                        className="inline-flex items-center justify-center p-2 border border-gray-300 hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Professioneller Empty State
          <div className="bg-white border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CogIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Keine passenden Maschinen gefunden' : 'Noch keine Maschinen'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Versuchen Sie einen anderen Suchbegriff' : 'Erstellen Sie Ihre erste Maschine'}
            </p>
            
            {!searchQuery && (
              <div className="flex justify-center space-x-3">
                <Link 
                  to="/machines/upload"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <DocumentArrowUpIcon className="h-4 w-4" />
                  <span>Dokument-Upload</span>
                </Link>
                <Link 
                  to="/machines/create"
                  className="inline-flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Manuell erstellen</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineList;