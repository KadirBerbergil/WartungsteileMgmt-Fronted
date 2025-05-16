// src/pages/machines/MachineList.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMachines } from '../../hooks/useMachines';

const MachineList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: machines, isLoading, error } = useMachines();

  // Filterfunktion für die Suche
  const filteredMachines = machines?.filter(machine => 
    machine.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Maschinen</h1>
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded">
          Neue Maschine
        </button>
      </div>

      {/* Suchfeld */}
      <div className="relative">
        <input
          type="text"
          placeholder="Maschine suchen..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          🔍
        </div>
      </div>

      {/* Maschinen-Tabelle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Maschinen werden geladen...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            Fehler beim Laden der Maschinen: {error instanceof Error ? error.message : 'Unbekannter Fehler'}
          </div>
        ) : filteredMachines && filteredMachines.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nummer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Betriebsstunden</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Letzte Wartung</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMachines.map((machine) => (
                <tr key={machine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    <Link to={`/machines/${machine.id}`}>{machine.number}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${machine.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        machine.status === 'InMaintenance' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {machine.status === 'Active' ? 'Aktiv' : 
                       machine.status === 'InMaintenance' ? 'In Wartung' : 
                       'Außer Betrieb'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{machine.operatingHours} h</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {machine.lastMaintenanceDate ? new Date(machine.lastMaintenanceDate).toLocaleDateString('de-DE') : 'Keine'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/machines/${machine.id}`} className="text-primary hover:text-primary/80 mr-4">
                      Details
                    </Link>
                    <button className="text-secondary hover:text-secondary/80">
                      Bearbeiten
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {searchQuery ? 'Keine Maschinen gefunden.' : 'Keine Maschinen vorhanden.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineList;