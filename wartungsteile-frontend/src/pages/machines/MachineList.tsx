// src/pages/machines/MachineList.tsx - Modernes professionelles Design
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
  SparklesIcon,
  ChevronDownIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

const MachineList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { data: machines, isLoading, error } = useMachines();

  // Filterfunktion für die Suche
  const filteredMachines = machines?.filter(machine => 
    machine.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status-Badge Styling (moderne Version)
  const getStatusBadge = (status: string) => {
    const styles = {
      'Active': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-400',
        label: 'Aktiv'
      },
      'InMaintenance': {
        bg: 'bg-amber-50', 
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
        label: 'In Wartung'
      },
      'OutOfService': {
        bg: 'bg-red-50',
        text: 'text-red-700', 
        border: 'border-red-200',
        dot: 'bg-red-400',
        label: 'Außer Betrieb'
      }
    };

    const style = styles[status as keyof typeof styles] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700', 
      border: 'border-gray-200',
      dot: 'bg-gray-400',
      label: status
    };

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-full ${style.bg} ${style.text} border ${style.border}`}>
        <div className={`w-2 h-2 rounded-full ${style.dot}`}></div>
        <span>{style.label}</span>
      </div>
    );
  };

  // Statistiken berechnen
  const stats = machines ? {
    total: machines.length,
    active: machines.filter(m => m.status === 'Active').length,
    inMaintenance: machines.filter(m => m.status === 'InMaintenance').length,
    outOfService: machines.filter(m => m.status === 'OutOfService').length,
    avgOperatingHours: Math.round(machines.reduce((sum, m) => sum + m.operatingHours, 0) / machines.length)
  } : { total: 0, active: 0, inMaintenance: 0, outOfService: 0, avgOperatingHours: 0 };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Maschinen</h1>
              <p className="text-gray-600 mt-2 text-lg">CNC-Lademagazine verwalten und überwachen</p>
            </div>
            
            {/* Moderne Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link 
                to="/machines/upload"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 group"
              >
                <SparklesIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>KI-Upload</span>
              </Link>
              
              <div className="relative">
                <button 
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="inline-flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Erstellen</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showCreateMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showCreateMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                    <div className="py-2">
                      <Link
                        to="/machines/create"
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                        onClick={() => setShowCreateMenu(false)}
                      >
                        <PlusIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">Manuell erstellen</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Moderne Statistik-Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamte Maschinen</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CogIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktiv</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Wartung</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{stats.inMaintenance}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <WrenchScrewdriverIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ø Betriebsstunden</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgOperatingHours}h</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Subtile KI-Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 mb-8">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              KI-Upload: Werkstattaufträge hochladen und automatisch Maschinen erstellen lassen
            </span>
            <Link to="/machines/upload" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
              Ausprobieren →
            </Link>
          </div>
        </div>

        {/* Such- und Filter-Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Maschinen durchsuchen..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                <FunnelIcon className="h-4 w-4" />
                <span>Filter</span>
              </button>
              
              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Maschinen werden geladen...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-medium">Fehler beim Laden der Maschinen</p>
          </div>
        ) : filteredMachines && filteredMachines.length > 0 ? (
          viewMode === 'grid' ? (
            // Grid View (Modern Cards)
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMachines.map((machine) => (
                <div key={machine.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <CogIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{machine.number}</h3>
                          <p className="text-sm text-gray-600">{machine.type}</p>
                        </div>
                      </div>
                      {getStatusBadge(machine.status)}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Betriebsstunden</span>
                        <span className="font-medium text-gray-900">{machine.operatingHours}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Letzte Wartung</span>
                        <span className="font-medium text-gray-900">
                          {machine.lastMaintenanceDate 
                            ? new Date(machine.lastMaintenanceDate).toLocaleDateString('de-DE')
                            : <span className="text-gray-400">Keine</span>
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Installation</span>
                        <span className="font-medium text-gray-900">
                          {new Date(machine.installationDate).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Link 
                        to={`/machines/${machine.id}`}
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Details</span>
                      </Link>
                      <Link 
                        to={`/machines/${machine.id}/edit`}
                        className="inline-flex items-center justify-center p-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Table View (Clean & Modern)
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Maschine</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Betriebsstunden</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Letzte Wartung</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Installation</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMachines.map((machine) => (
                    <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CogIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <Link to={`/machines/${machine.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                              {machine.number}
                            </Link>
                            <div className="text-sm text-gray-600">{machine.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(machine.status)}</td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{machine.operatingHours}h</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">
                          {machine.lastMaintenanceDate 
                            ? new Date(machine.lastMaintenanceDate).toLocaleDateString('de-DE')
                            : <span className="text-gray-400 italic">Keine</span>
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">
                          {new Date(machine.installationDate).toLocaleDateString('de-DE')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Link 
                            to={`/machines/${machine.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Details
                          </Link>
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
          )
        ) : (
          // Empty State (Modern)
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CogIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Keine passenden Maschinen gefunden' : 'Noch keine Maschinen'}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchQuery ? 'Versuche einen anderen Suchbegriff' : 'Erstelle deine erste Maschine'}
            </p>
            
            {!searchQuery && (
              <div className="flex justify-center space-x-4">
                <Link 
                  to="/machines/upload"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>KI-Upload</span>
                </Link>
                <Link 
                  to="/machines/create"
                  className="inline-flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  <PlusIcon className="h-5 w-5" />
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