// src/pages/parts/MaintenancePartsList.tsx - Premium Business Design
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
  ChevronDownIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const MaintenancePartsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
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
        icon: BoltIcon,
        gradient: 'from-red-500 to-red-600'
      },
      'SparePart': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Ersatzteil',
        icon: CubeIcon,
        gradient: 'from-blue-500 to-blue-600'
      },
      'ConsumablePart': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Verbrauchsmaterial',
        icon: SparklesIcon,
        gradient: 'from-amber-500 to-amber-600'
      },
      'ToolPart': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Werkzeug',
        icon: CubeIcon,
        gradient: 'from-emerald-500 to-emerald-600'
      }
    };

    return configs[category as keyof typeof configs] || {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: category,
      icon: CubeIcon,
      gradient: 'from-slate-500 to-slate-600'
    };
  };

  const getStockConfig = (quantity: number) => {
    if (quantity === 0) {
      return {
        status: 'Ausverkauft',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircleIcon,
        dot: 'bg-red-400'
      };
    } else if (quantity <= 3) {
      return {
        status: 'Niedriger Bestand',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: ExclamationTriangleIcon,
        dot: 'bg-amber-400'
      };
    } else {
      return {
        status: 'Verfügbar',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircleIcon,
        dot: 'bg-emerald-400'
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

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <CubeIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                    Wartungsteile
                  </h1>
                  <p className="text-slate-600 font-medium">Ersatz- & Verschleißteile verwalten</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-600 font-medium">{stats.total - stats.outOfStock} Verfügbare Teile</span>
                </div>
                <div className="text-slate-500">
                  {stats.outOfStock} Ausverkauft
                </div>
                <div className="text-slate-500">
                  {Math.round(stats.totalValue / 1000)}k€ Lagerwert
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button 
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Neu</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showCreateMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showCreateMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl shadow-slate-200/20 z-50 overflow-hidden">
                    <div className="p-2">
                      <Link
                        to="/parts/create"
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-slate-50 rounded-lg transition-colors group"
                        onClick={() => setShowCreateMenu(false)}
                      >
                        <div className="w-8 h-8 bg-emerald-100 group-hover:bg-emerald-200 rounded-lg flex items-center justify-center transition-colors">
                          <PlusIcon className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Wartungsteil erstellen</div>
                          <div className="text-xs text-slate-500">Manuell hinzufügen</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Premium Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <CubeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">+5%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stats.total}</div>
            <div className="text-slate-600 text-sm font-medium">Gesamte Teile</div>
            <div className="text-slate-500 text-xs mt-1">Wartungskomponenten</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-emerald-600">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">Verfügbar</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-1">{stats.total - stats.outOfStock}</div>
            <div className="text-slate-600 text-sm font-medium">Auf Lager</div>
            <div className="text-slate-500 text-xs mt-1">{Math.round(((stats.total - stats.outOfStock) / stats.total) * 100)}% Verfügbarkeit</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-amber-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">Warnung</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 mb-1">{stats.lowStock + stats.outOfStock}</div>
            <div className="text-slate-600 text-sm font-medium">Nachbestellen</div>
            <div className="text-slate-500 text-xs mt-1">{stats.outOfStock} ausverkauft</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <BanknotesIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-purple-600">
                <ChartBarIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">Wert</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{Math.round(stats.totalValue / 1000)}k€</div>
            <div className="text-slate-600 text-sm font-medium">Lagerwert</div>
            <div className="text-slate-500 text-xs mt-1">Gesamtbestand</div>
          </div>
        </div>

        {/* Premium Search & Filter Bar */}
        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Wartungsteile durchsuchen..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all duration-200"
              >
                <option value="all">Alle Kategorien</option>
                <option value="WearPart">Verschleißteile</option>
                <option value="SparePart">Ersatzteile</option>
                <option value="ConsumablePart">Verbrauchsmaterial</option>
                <option value="ToolPart">Werkzeuge</option>
              </select>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all duration-200"
              >
                <option value="all">Alle Bestände</option>
                <option value="inStock">Verfügbar</option>
                <option value="lowStock">Niedriger Bestand</option>
                <option value="outOfStock">Ausverkauft</option>
              </select>

              <button className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50/50 hover:bg-white border border-slate-200/60 text-slate-700 text-sm font-medium rounded-xl transition-all duration-200">
                <FunnelIcon className="h-4 w-4" />
                <span>Filter</span>
              </button>
              
              <div className="flex bg-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-all duration-200 ${
                    viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2.5 transition-all duration-200 ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
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
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Wartungsteile werden geladen</h3>
            <p className="text-slate-600">Lagerbestand wird analysiert...</p>
          </div>
        ) : error ? (
          <div className="bg-white/70 backdrop-blur-sm border border-red-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Fehler beim Laden</h3>
            <p className="text-slate-600">Die Wartungsteile konnten nicht geladen werden.</p>
          </div>
        ) : filteredParts && filteredParts.length > 0 ? (
          viewMode === 'grid' ? (
            // Premium Grid View
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredParts.map((part) => {
                const categoryConfig = getCategoryConfig(part.category);
                const stockConfig = getStockConfig(part.stockQuantity);
                const CategoryIcon = categoryConfig.icon;
                const StockIcon = stockConfig.icon;
                
                return (
                  <div key={part.id} className="group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-300 overflow-hidden">
                    {/* Header */}
                    <div className="relative p-6 pb-4 bg-gradient-to-br from-slate-50 via-white to-slate-50">
                      <div className="absolute top-4 right-4">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${stockConfig.bg} ${stockConfig.text} ${stockConfig.border} text-xs font-medium`}>
                          <div className={`w-2 h-2 rounded-full ${stockConfig.dot} animate-pulse`}></div>
                          <StockIcon className="h-3 w-3" />
                          <span>{stockConfig.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${categoryConfig.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-opacity-40 transition-all duration-300`}>
                          <CategoryIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/parts/${part.id}`} 
                            className="block group-hover:text-emerald-600 transition-colors duration-200"
                          >
                            <h3 className="font-bold text-lg text-slate-800 mb-1 truncate">{part.name}</h3>
                            <p className="text-slate-600 text-sm font-medium">{part.partNumber}</p>
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-slate-50/50 rounded-xl">
                          <div className="text-xl font-bold text-slate-800 mb-1">{part.price.toFixed(2)}€</div>
                          <div className="text-xs text-slate-600 font-medium">Stückpreis</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50/50 rounded-xl">
                          <div className={`text-xl font-bold mb-1 ${stockConfig.text}`}>{part.stockQuantity}</div>
                          <div className="text-xs text-slate-600 font-medium">Lagerbestand</div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 font-medium">Kategorie:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}>
                            {categoryConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 font-medium">Lagerwert:</span>
                          <span className="text-slate-800 font-semibold">
                            {(part.price * part.stockQuantity).toFixed(2)}€
                          </span>
                        </div>
                        {part.manufacturer && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 font-medium">Hersteller:</span>
                            <span className="text-slate-800 font-semibold truncate ml-2">{part.manufacturer}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link 
                          to={`/parts/${part.id}`}
                          className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>Details</span>
                        </Link>
                        <Link 
                          to={`/parts/${part.id}/edit`}
                          className="inline-flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-xl transition-all duration-200"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Premium Table View
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Teil</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Kategorie</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Lagerbestand</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Preis</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Hersteller</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {filteredParts.map((part) => {
                      const categoryConfig = getCategoryConfig(part.category);
                      const stockConfig = getStockConfig(part.stockQuantity);
                      const CategoryIcon = categoryConfig.icon;
                      
                      return (
                        <tr key={part.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 bg-gradient-to-br ${categoryConfig.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-opacity-30 transition-all duration-200`}>
                                <CategoryIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Link 
                                  to={`/parts/${part.id}`} 
                                  className="font-semibold text-slate-800 hover:text-emerald-600 text-sm transition-colors duration-200"
                                >
                                  {part.name}
                                </Link>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">{part.partNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}>
                              {categoryConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <span className={`font-semibold text-sm ${stockConfig.text}`}>{part.stockQuantity} Stück</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockConfig.bg} ${stockConfig.text} ${stockConfig.border}`}>
                                {stockConfig.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-semibold text-slate-800">{part.price.toFixed(2)}€</div>
                              <div className="text-slate-500">Stückpreis</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-800 text-sm font-medium">
                              {part.manufacturer || <span className="text-slate-400 italic">Nicht angegeben</span>}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Link 
                                to={`/parts/${part.id}`}
                                className="inline-flex items-center space-x-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
                              >
                                <EyeIcon className="h-3 w-3" />
                                <span>Details</span>
                              </Link>
                              <Link 
                                to={`/parts/${part.id}/edit`}
                                className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg transition-all duration-200"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          // Premium Empty State
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-400/25">
              <CubeIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all' ? 'Keine passenden Wartungsteile gefunden' : 'Noch keine Wartungsteile erfasst'}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                ? 'Versuchen Sie einen anderen Suchbegriff oder andere Filter' 
                : 'Beginnen Sie mit dem Hinzufügen von Ersatz- und Verschleißteilen'
              }
            </p>
            
            {!searchQuery && categoryFilter === 'all' && stockFilter === 'all' && (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/parts/create"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>Erstes Teil hinzufügen</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePartsList;