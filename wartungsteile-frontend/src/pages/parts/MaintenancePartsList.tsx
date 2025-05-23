// src/pages/parts/MaintenancePartsList.tsx - Verbesserte Version
import { useState } from 'react';
import { useMaintenanceParts } from '../../hooks/useParts';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CubeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MaintenancePartsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: parts, isLoading, error } = useMaintenanceParts();

  // Filterfunktion für die Suche
  const filteredParts = parts?.filter(part => 
    part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kategorie-Badge Styling
  const getCategoryBadge = (category: string) => {
    const styles = {
      'WearPart': 'bg-red-100 text-red-800 border-red-200',
      'SparePart': 'bg-blue-100 text-blue-800 border-blue-200', 
      'ConsumablePart': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'ToolPart': 'bg-green-100 text-green-800 border-green-200'
    };
    
    const labels = {
      'WearPart': 'Verschleißteil',
      'SparePart': 'Ersatzteil', 
      'ConsumablePart': 'Verbrauchsmaterial',
      'ToolPart': 'Werkzeug'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[category as keyof typeof labels] || category}
      </span>
    );
  };

  // Lagerbestand Status
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return (
        <div className="flex items-center space-x-1 text-red-600">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Ausverkauft</span>
        </div>
      );
    } else if (quantity <= 3) {
      return (
        <div className="flex items-center space-x-1 text-yellow-600">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{quantity} (Niedrig)</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <CubeIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{quantity} verfügbar</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wartungsteile</h1>
          <p className="text-gray-600 mt-1">Ersatz- und Verschleißteile verwalten</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg">
          <PlusIcon className="h-5 w-5" />
          <span>Neues Wartungsteil</span>
        </button>
      </div>

      {/* Suchfeld */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Nach Teil suchen (Nummer, Name, Hersteller)..."
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
              <p className="text-sm text-gray-600">Gesamte Teile</p>
              <p className="text-2xl font-bold text-gray-800">{parts?.length || 0}</p>
            </div>
            <CubeIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verschleißteile</p>
              <p className="text-2xl font-bold text-red-600">
                {parts?.filter(p => p.category === 'WearPart').length || 0}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Niedrige Bestände</p>
              <p className="text-2xl font-bold text-yellow-600">
                {parts?.filter(p => p.stockQuantity <= 3 && p.stockQuantity > 0).length || 0}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ausverkauft</p>
              <p className="text-2xl font-bold text-red-600">
                {parts?.filter(p => p.stockQuantity === 0).length || 0}
              </p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Wartungsteile-Tabelle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Wartungsteile werden geladen...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-medium">
              Fehler beim Laden der Wartungsteile
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {error instanceof Error ? error.message : 'Unbekannter Fehler'}
            </p>
          </div>
        ) : filteredParts && filteredParts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teilenummer & Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preis
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lagerbestand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hersteller
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParts.map((part, index) => (
                  <tr key={`${part.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-primary">{part.partNumber}</div>
                        <div className="text-sm text-gray-600">{part.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryBadge(part.category)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">
                        {part.price.toFixed(2)} €
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStockStatus(part.stockQuantity)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {part.manufacturer || <span className="text-gray-400 italic">Nicht angegeben</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-1 text-primary hover:text-primary/80 text-sm font-medium">
                          <EyeIcon className="h-4 w-4" />
                          <span>Details</span>
                        </button>
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
            <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {searchQuery ? 'Keine passenden Wartungsteile gefunden.' : 'Keine Wartungsteile vorhanden.'}
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

export default MaintenancePartsList;