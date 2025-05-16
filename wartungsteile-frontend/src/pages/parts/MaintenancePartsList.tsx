// src/pages/parts/MaintenancePartsList.tsx
import { useState } from 'react';
import { useMaintenanceParts } from '../../hooks/useParts';

const MaintenancePartsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: parts, isLoading, error } = useMaintenanceParts();

  // Filterfunktion für die Suche
  const filteredParts = parts?.filter(part => 
    part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Wartungsteile</h1>
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded">
          Neues Wartungsteil
        </button>
      </div>

      {/* Suchfeld */}
      <div className="relative">
        <input
          type="text"
          placeholder="Wartungsteil suchen..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          🔍
        </div>
      </div>

      {/* Wartungsteile-Tabelle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Wartungsteile werden geladen...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            Fehler beim Laden der Wartungsteile: {error instanceof Error ? error.message : 'Unbekannter Fehler'}
          </div>
        ) : filteredParts && filteredParts.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teilenummer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lagerbestand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hersteller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParts.map((part) => (
                <tr key={part.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {part.partNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {part.category === 'WearPart' ? 'Verschleißteil' : 
                     part.category === 'SparePart' ? 'Ersatzteil' : 
                     part.category === 'ConsumablePart' ? 'Verbrauchsmaterial' : 'Werkzeug'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.price.toFixed(2)} €</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.stockQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.manufacturer || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 mr-4">
                      Details
                    </button>
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
            {searchQuery ? 'Keine Wartungsteile gefunden.' : 'Keine Wartungsteile vorhanden.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePartsList;