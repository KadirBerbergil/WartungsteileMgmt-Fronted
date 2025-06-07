// src/pages/parts/MaintenancePartsList.tsx - VOLLSTÄNDIG ÜBERARBEITET mit Löschen-Funktionalität
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMaintenanceParts, useDeleteMaintenancePart } from '../../hooks/useParts';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const MaintenancePartsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [partToDelete, setPartToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data: parts, isLoading, error } = useMaintenanceParts();
  const deletePart = useDeleteMaintenancePart();

  const filteredParts = parts?.filter(part => {
    const matchesSearch = part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (part.manufacturer && part.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'outOfStock' && part.stockQuantity === 0) ||
                        (stockFilter === 'lowStock' && part.stockQuantity > 0 && part.stockQuantity <= 3) ||
                        (stockFilter === 'inStock' && part.stockQuantity > 3);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const stats = parts ? {
    total: parts.length,
    outOfStock: parts.filter(p => p.stockQuantity === 0).length,
    lowStock: parts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 3).length,
    inStock: parts.filter(p => p.stockQuantity > 3).length,
    totalValue: parts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
  } : { total: 0, outOfStock: 0, lowStock: 0, inStock: 0, totalValue: 0 };

  // Delete handlers
  const handleDeleteClick = (partId: string) => {
    setPartToDelete(partId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!partToDelete) return;
    
    try {
      await deletePart.mutateAsync(partToDelete);
      setShowDeleteModal(false);
      setPartToDelete(null);
    } catch (error) {
      console.error('Fehler beim Löschen des Wartungsteils:', error);
      // Error wird durch React Query Error Boundary behandelt
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPartToDelete(null);
  };

  const getPartToDeleteInfo = () => {
    if (!partToDelete || !parts) return null;
    return parts.find(p => p.id === partToDelete);
  };

  const getCategoryConfig = (category: string) => {
    const configs = {
      'WearPart': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'Verschleißteil',
        color: 'red'
      },
      'SparePart': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Ersatzteil',
        color: 'blue'
      },
      'ConsumablePart': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Verbrauchsmaterial',
        color: 'amber'
      },
      'ToolPart': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Werkzeug',
        color: 'emerald'
      }
    };

    return configs[category as keyof typeof configs] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      label: category,
      color: 'gray'
    };
  };

  const getStockConfig = (quantity: number) => {
    if (quantity === 0) {
      return {
        status: 'Ausverkauft',
        icon: XCircleIcon,
        color: 'text-red-600',
        bg: 'bg-red-50'
      };
    } else if (quantity <= 3) {
      return {
        status: 'Niedrig',
        icon: ExclamationTriangleIcon,
        color: 'text-amber-600',
        bg: 'bg-amber-50'
      };
    } else {
      return {
        status: 'Verfügbar',
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bg: 'bg-green-50'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wartungsteile werden geladen</h3>
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
          <p className="text-gray-600">Die Wartungsteile konnten nicht geladen werden.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wartungsteile</h1>
          <p className="text-gray-600 mt-1">Ersatz- und Verschleißteile verwalten</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link 
            to="/parts/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Neues Teil</span>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <CubeIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verfügbar</p>
              <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Niedrig</p>
              <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ausverkauft</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircleIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lagerwert</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(stats.totalValue / 1000)}k€</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <ShoppingCartIcon className="h-5 w-5 text-purple-600" />
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
                placeholder="Teile durchsuchen..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle Kategorien</option>
              <option value="WearPart">Verschleißteile</option>
              <option value="SparePart">Ersatzteile</option>
              <option value="ConsumablePart">Verbrauchsmaterial</option>
              <option value="ToolPart">Werkzeuge</option>
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle Bestände</option>
              <option value="inStock">Verfügbar</option>
              <option value="lowStock">Niedriger Bestand</option>
              <option value="outOfStock">Ausverkauft</option>
            </select>

            <button className="inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              <FunnelIcon className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Parts List */}
      {filteredParts && filteredParts.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teil
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bestand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lagerwert
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hersteller
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParts.map((part) => {
                  const categoryConfig = getCategoryConfig(part.category);
                  const stockConfig = getStockConfig(part.stockQuantity);
                  const StockIcon = stockConfig.icon;
                  
                  return (
                    <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <Link 
                            to={`/parts/${part.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {part.name}
                          </Link>
                          <div className="text-sm text-gray-500">{part.partNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig.bg} ${categoryConfig.text}`}>
                          {categoryConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <StockIcon className={`h-4 w-4 ${stockConfig.color}`} />
                          <span className={`text-sm font-medium ${stockConfig.color}`}>
                            {part.stockQuantity} Stück
                          </span>
                        </div>
                        <div className={`text-xs ${stockConfig.color}`}>
                          {stockConfig.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {part.price.toFixed(2)} €
                        </div>
                        <div className="text-xs text-gray-500">pro Stück</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {(part.price * part.stockQuantity).toFixed(2)} €
                        </div>
                        <div className="text-xs text-gray-500">
                          {part.stockQuantity}x × {part.price.toFixed(2)}€
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {part.manufacturer || (
                            <span className="text-gray-400 italic">Nicht angegeben</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link 
                            to={`/parts/${part.id}`}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Details anzeigen"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link 
                            to={`/parts/${part.id}/edit`}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Bearbeiten"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(part.id)}
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
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all' 
              ? 'Keine passenden Wartungsteile gefunden' 
              : 'Noch keine Wartungsteile vorhanden'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
              ? 'Versuchen Sie einen anderen Suchbegriff oder Filter' 
              : 'Beginnen Sie mit dem Hinzufügen von Ersatz- und Verschleißteilen'
            }
          </p>
          
          {!searchQuery && categoryFilter === 'all' && stockFilter === 'all' && (
            <Link 
              to="/parts/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Erstes Wartungsteil hinzufügen</span>
            </Link>
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
                  <h3 className="text-lg font-semibold text-gray-900">Wartungsteil löschen</h3>
                  <p className="text-sm text-gray-600 mt-1">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>

              {getPartToDeleteInfo() && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <CubeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{getPartToDeleteInfo()?.name}</p>
                      <p className="text-sm text-gray-600">{getPartToDeleteInfo()?.partNumber}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Kategorie:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {getCategoryConfig(getPartToDeleteInfo()?.category || '').label}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Bestand:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {getPartToDeleteInfo()?.stockQuantity} Stück
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Preis:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {getPartToDeleteInfo()?.price.toFixed(2)} €
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Lagerwert:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {((getPartToDeleteInfo()?.price || 0) * (getPartToDeleteInfo()?.stockQuantity || 0)).toFixed(2)} €
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
                      <li>• Das Wartungsteil wird permanent gelöscht</li>
                      <li>• Verknüpfungen zu Maschinen bleiben bestehen</li>
                      <li>• Wartungshistorie mit diesem Teil bleibt erhalten</li>
                      <li>• Lagerwert geht verloren</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deletePart.isPending}
                  className="flex-1 px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletePart.isPending}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                >
                  {deletePart.isPending ? (
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
    </div>
  );
};

export default MaintenancePartsList;