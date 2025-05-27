// src/pages/parts/MaintenancePartsList.tsx - Clean Professional Design
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMaintenanceParts } from '../../hooks/useParts';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const MaintenancePartsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const { data: parts, isLoading, error } = useMaintenanceParts();

  const filteredParts = parts?.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (part.manufacturer && part.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'outOfStock' && part.stockQuantity === 0) ||
                        (stockFilter === 'lowStock' && part.stockQuantity > 0 && part.stockQuantity <= 3) ||
                        (stockFilter === 'inStock' && part.stockQuantity > 3);
    return matchesSearch && matchesCategory && matchesStock;
  });

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
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircleIcon
      };
    } else if (quantity <= 3) {
      return {
        status: 'Niedrig',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: ExclamationTriangleIcon
      };
    } else {
      return {
        status: 'Verfügbar',
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircleIcon
      };
    }
  };

  const stats = parts ? {
    total: parts.length,
    wearParts: parts.filter(p => p.category === 'WearPart').length,
    spareParts: parts.filter(p => p.category === 'SparePart').length,
    consumableParts: parts.filter(p => p.category === 'ConsumablePart').length,
    toolParts: parts.filter(p => p.category === 'ToolPart').length,
    outOfStock: parts.filter(p => p.stockQuantity === 0).length,
    lowStock: parts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 3).length,
    totalValue: parts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
  } : { total: 0, wearParts: 0, spareParts: 0, consumableParts: 0, toolParts: 0, outOfStock: 0, lowStock: 0, totalValue: 0 };

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
          <p className="text-gray-600">Die Wartungsteile konnten nicht geladen werden.</p>
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
          <p className="text-gray-600 mt-1">Ersatz- & Verschleißteile verwalten</p>
        </div>
        
        <Link 
          to="/parts/create"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Neues Teil</span>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gesamte Teile</p>
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
              <p className="text-2xl font-bold text-green-600">{stats.total - stats.outOfStock}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nachbestellen</p>
              <p className="text-2xl font-bold text-amber-600">{stats.lowStock + stats.outOfStock}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
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
              <BanknotesIcon className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Wartungsteile durchsuchen..."
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

      {/* Parts Grid */}
      {filteredParts && filteredParts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map((part) => {
            const categoryConfig = getCategoryConfig(part.category);
            const stockConfig = getStockConfig(part.stockQuantity);
            const StockIcon = stockConfig.icon;
            
            return (
              <div key={part.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-${categoryConfig.color}-50 rounded-lg flex items-center justify-center`}>
                      <CubeIcon className={`h-5 w-5 text-${categoryConfig.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/parts/${part.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate block"
                      >
                        {part.name}
                      </Link>
                      <p className="text-sm text-gray-600">{part.partNumber}</p>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${stockConfig.bg} ${stockConfig.text} ${stockConfig.border} border`}>
                    <StockIcon className="h-3 w-3" />
                    <span>{stockConfig.status}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">{part.price.toFixed(2)}€</p>
                    <p className="text-xs text-gray-600">Stückpreis</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className={`text-lg font-bold ${stockConfig.text}`}>{part.stockQuantity}</p>
                    <p className="text-xs text-gray-600">Lagerbestand</p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Kategorie:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border} border`}>
                      {categoryConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Lagerwert:</span>
                    <span className="font-medium text-gray-900">
                      {(part.price * part.stockQuantity).toFixed(2)}€
                    </span>
                  </div>
                  {part.manufacturer && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Hersteller:</span>
                      <span className="font-medium text-gray-900 truncate ml-2">{part.manufacturer}</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex space-x-2">
                  <Link 
                    to={`/parts/${part.id}`}
                    className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                    <span>Details</span>
                  </Link>
                  <Link 
                    to={`/parts/${part.id}/edit`}
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
          <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all' ? 'Keine passenden Wartungsteile gefunden' : 'Noch keine Wartungsteile erfasst'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
              ? 'Versuchen Sie einen anderen Suchbegriff oder andere Filter' 
              : 'Beginnen Sie mit dem Hinzufügen von Ersatz- und Verschleißteilen'
            }
          </p>
          
          {!searchQuery && categoryFilter === 'all' && stockFilter === 'all' && (
            <Link 
              to="/parts/create"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Erstes Teil hinzufügen</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenancePartsList;