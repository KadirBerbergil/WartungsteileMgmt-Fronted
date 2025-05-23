// src/pages/machines/MachineList.tsx - Verbesserte Version
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
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const MachineList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: machines, isLoading, error } = useMachines();

  // Filterfunktion für die Suche
  const filteredMachines = machines?.filter(machine => 
    machine.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Status-Badge Styling
  const getStatusBadge = (status: string) => {
    const styles = {
      'Active': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: CheckCircleIcon,
        label: 'Aktiv'
      },
      'InMaintenance': {
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: WrenchScrewdriverIcon,
        label: 'In Wartung'
      },
      'OutOfService': {
        bg: 'bg-red-100',
        text: 'text-red-800', 
        border: 'border-red-200',
        icon: XCircleIcon,
        label: 'Außer Betrieb'
      }
    };

    const style = styles[status as keyof typeof styles] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800', 
      border: 'border-gray-200',
      icon: XCircleIcon,
      label: status
    };

    const IconComponent = style.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 text-xs font-medium rounded-full border ${style.bg} ${style.text} ${style.border}`}>
        <IconComponent className="h-3 w-3" />
        <span>{style.label}</span>
      </div>
    );
  };

  // Maschinentyp Icon
  const getMachineIcon = (type: string) => {
    // Verschiedene Icons für verschiedene Maschinentypen
    if (type.includes('turbo')) {
      return <CogIcon className="h-5 w-5 text-blue-600" />;
    }
    return <CogIcon className="h-5 w-5 text-gray-600" />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Maschinen</h1>
          <p className="text-gray-600 mt-1">CNC-Lademagazine verwalten und überwachen</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg">
          <PlusIcon className="h-5 w-5" />
          <span>Neue Maschine</span>
        </button>
      </div>

      {/* Suchfeld */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Nach Maschine suchen (Nummer, Typ)..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamte Maschinen</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <CogIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktiv</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Wartung</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inMaintenance}</p>
            </div>
            <WrenchScrewdriverIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ø Betriebsstunden</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgOperatingHours}h</p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Maschinen-Tabelle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Maschinen werden geladen...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-medium">Fehler beim Laden der Maschinen</p>
            <p className="text-gray-500 text-sm mt-2">
              {error instanceof Error ? error.message : 'Unbekannter Fehler'}
            </p>
          </div>
        ) : filteredMachines && filteredMachines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maschine
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betriebsstunden
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Letzte Wartung
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Installation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMachines.map((machine, index) => (
                  <tr key={`${machine.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getMachineIcon(machine.type)}
                        <div>
                          <Link 
                            to={`/machines/${machine.id}`} 
                            className="text-sm font-medium text-primary hover:text-primary/80"
                          >
                            {machine.number}
                          </Link>
                          <div className="text-sm text-gray-600">{machine.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(machine.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">
                          {machine.operatingHours} h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {machine.lastMaintenanceDate 
                            ? new Date(machine.lastMaintenanceDate).toLocaleDateString('de-DE') 
                            : <span className="text-gray-400 italic">Keine</span>
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(machine.installationDate).toLocaleDateString('de-DE')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Link 
                          to={`/machines/${machine.id}`} 
                          className="flex items-center space-x-1 text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>Details</span>
                        </Link>
                        <button className="flex items-center space-x-1 text-secondary hover:text-secondary/80 text-sm font-medium">
                          <PencilIcon className="h-4 w-4" />
                          <span>Bearbeiten</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {searchQuery ? 'Keine passenden Maschinen gefunden.' : 'Keine Maschinen vorhanden.'}
            </p>
            {searchQuery && (
              <p className="text-gray-400 text-sm mt-2">
                Versuche einen anderen Suchbegriff
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineList;