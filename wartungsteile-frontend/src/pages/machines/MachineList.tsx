// src/pages/machines/MachineList.tsx - Mit PDF-Upload Integration
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
  WrenchScrewdriverIcon,
  DocumentArrowUpIcon,
  SparklesIcon
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
      {/* Header mit erweiterten Aktionen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Maschinen</h1>
          <p className="text-gray-600 mt-1">CNC-Lademagazine verwalten und überwachen</p>
        </div>
        
        {/* Button-Gruppe mit PDF-Upload */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* PDF-Upload Button - Prominenter platziert */}
          <Link 
            to="/machines/upload"
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg group"
          >
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5 group-hover:animate-pulse" />
              <DocumentArrowUpIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium">PDF hochladen</span>
              <span className="text-xs text-green-200">Werkstattauftrag</span>
            </div>
          </Link>
          
          {/* Manuell erstellen Button */}
          <button className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg border-2 border-transparent hover:border-blue-300">
            <PlusIcon className="h-5 w-5" />
            <span>Manuell erstellen</span>
          </button>
        </div>
      </div>

      {/* Info-Banner für PDF-Upload */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              🤖 Intelligente Maschinenerstellung
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Laden Sie Ihren Werkstattauftrag (PDF) hoch und lassen Sie die KI automatisch alle Maschinendaten extrahieren und eine neue Maschine erstellen.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link 
              to="/machines/upload"
              className="text-sm font-medium text-green-800 hover:text-green-900 underline"
            >
              Jetzt ausprobieren →
            </Link>
          </div>
        </div>
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
            
            {/* Call-to-Action wenn keine Maschinen vorhanden */}
            {!searchQuery && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">Erstellen Sie Ihre erste Maschine:</p>
                <div className="flex justify-center space-x-4">
                  <Link 
                    to="/machines/upload"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors space-x-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>PDF hochladen</span>
                  </Link>
                  <button className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors space-x-2">
                    <PlusIcon className="h-4 w-4" />
                    <span>Manuell erstellen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineList;