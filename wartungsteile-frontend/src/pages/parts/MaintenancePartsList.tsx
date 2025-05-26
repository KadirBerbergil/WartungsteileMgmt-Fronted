// src/pages/parts/MaintenancePartsList.tsx - Premium Business Design
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMaintenanceParts } from '../../hooks/useParts';
import { maintenancePartService } from '../../services';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  SignalIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const MaintenancePartsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, part: any}>({isOpen: false, part: null});
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { data: parts, isLoading, error } = useMaintenanceParts();
  const queryClient = useQueryClient();

  const filteredParts = parts?.filter(part => {
    const matchesSearch = part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;
    const matchesStock = stockFilter === 'all' ||
                        (stockFilter === 'outOfStock' && part.stockQuantity === 0) ||
                        (stockFilter === 'lowStock' && part.stockQuantity > 0 && part.stockQuantity <= 3) ||
                        (stockFilter === 'inStock' && part.stockQuantity > 3);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const openDeleteDialog = (part: any) => {
    setDeleteDialog({isOpen: true, part});
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({isOpen: false, part: null});
  };

  const handleDelete = async () => {
    if (!deleteDialog.part) return;
    
    setIsDeleting(true);
    try {
      const success = await maintenancePartService.delete(deleteDialog.part.id);
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['maintenanceParts'] });
        closeDeleteDialog();
      } else {
        alert('Fehler beim Löschen des Wartungsteils');
      }
    } catch (error: any) {
      alert(`Fehler beim Löschen: ${error.response?.data || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryConfig = (category: string) => {
    const configs = {
      'WearPart': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'Verschleißteil',
        gradient: 'from-red-500 to-red-600',
        shadow: 'shadow-red-500/25'
      },
      'SparePart': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Ersatzteil',
        gradient: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/25'
      },
      'ConsumablePart': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Verbrauchsmaterial',
        gradient: 'from-amber-500 to-amber-600',
        shadow: 'shadow-amber-500/25'
      },
      'ToolPart': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Werkzeug',
        gradient: 'from-emerald-500 to-emerald-600',
        shadow: 'shadow-emerald-500/25'
      }
    };

    return configs[category as keyof typeof configs] || {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: category,
      gradient: 'from-slate-500 to-slate-600',
      shadow: 'shadow-slate-500/25'
    };
  };

  const renderCategoryBadge = (category: string, size: 'sm' | 'md' = 'sm') => {
    const config = getCategoryConfig(category);
    
    return (
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${size === 'md' ? 'text-sm' : 'text-xs'} font-medium`}>
        <div className={`w-2 h-2 rounded-full ${config.text.replace('text-', 'bg-')} mr-2`}></div>
        <span>{config.label}</span>
      </div>
    );
  };

  const getStockConfig = (quantity: number) => {
    if (quantity === 0) {
      return {
        status: 'Ausverkauft',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: XCircleIcon,
        trend: 'critical'
      };
    } else if (quantity <= 3) {
      return {
        status: 'Niedrig',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: ExclamationTriangleIcon,
        trend: 'warning'
      };
    } else {
      return {
        status: 'Verfügbar',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircleIcon,
        trend: 'good'
      };
    }
  };

  const renderStockBadge = (quantity: number, showQuantity: boolean = true) => {
    const config = getStockConfig(quantity);
    const StockIcon = config.icon;
    
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} text-xs font-medium`}>
        <StockIcon className="h-3 w-3" />
        <span>{showQuantity ? `${quantity} ${config.status}` : config.status}</span>
      </div>
    );
  };

  const stats = parts ? {
    total: parts.length,
    wearParts: parts.filter(p => p.category === 'WearPart').length,
    spareParts: parts.filter(p => p.category === 'SparePart').length,
    consumableParts: parts.filter(p => p.category === 'ConsumablePart').length,
    toolParts: parts.filter(p => p.category === 'ToolPart').length,
    lowStock: parts.filter(p => p.stockQuantity <= 3 && p.stockQuantity > 0).length,
    outOfStock: parts.filter(p => p.stockQuantity === 0).length,
    totalValue: parts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0),
    avgPrice: parts.length > 0 ? parts.reduce((sum, p) => sum + p.price, 0) / parts.length : 0
  } : { total: 0, wearParts: 0, spareParts: 0, consumableParts: 0, toolParts: 0, lowStock: 0, outOfStock: 0, totalValue: 0, avgPrice: 0 };

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
                  <p className="text-slate-600 font-medium">Ersatz- und Verschleißteile verwalten</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-600 font-medium">{stats.total} Teile im System</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-slate-500">{stats.lowStock} niedrige Bestände</span>
                </div>
                <div className="text-slate-500">
                  Lagerwert: {Math.round(stats.totalValue).toLocaleString('de-DE')}€
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                to="/parts/new"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Neues Teil</span>
              </Link>
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
                <TrendingUpIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">+5%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stats.total}</div>
            <div className="text-slate-600 text-sm font-medium">Gesamte Teile</div>
            <div className="text-slate-500 text-xs mt-1">Im Lager verfügbar</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                <BoltIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-red-600">
                <SignalIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">Kritisch</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">{stats.wearParts}</div>
            <div className="text-slate-600 text-sm font-medium">Verschleißteile</div>
            <div className="text-slate-500 text-xs mt-1">Wartungsrelevant</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <ExclamationTriangleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-amber-600">
                <TrendingDownIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">Warnung</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 mb-1">{stats.lowStock}</div>
            <div className="text-slate-600 text-sm font-medium">Niedrige Bestände</div>
            <div className="text-slate-500 text-xs mt-1">Nachbestellung nötig</div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-purple-600">
                <TrendingUpIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">+8%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{Math.round(stats.totalValue / 1000)}k€</div>
            <div className="text-slate-600 text-sm font-medium">Lagerwert</div>
            <div className="text-slate-500 text-xs mt-1">Ø {stats.avgPrice.toFixed(2)}€/Teil</div>
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
                <option value="lowStock">Niedrig</option>
                <option value="outOfStock">Ausverkauft</option>
              </select>

              <button className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50/50 hover:bg-white border border-slate-200/60 text-slate-700 text-sm font-medium rounded-xl transition-all duration-200">
                <FunnelIcon className="h-4 w-4" />
                <span>Erweitert</span>
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
                
                return (
                  <div key={part.id} className="group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-300 overflow-hidden">
                    {/* Header with category gradient */}
                    <div className={`relative p-6 pb-4 bg-gradient-to-br ${categoryConfig.gradient} text-white`}>
                      <div className="absolute top-4 right-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30`}>
                          <span>{categoryConfig.label}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className={`w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ${categoryConfig.shadow} group-hover:shadow-white/40 transition-all duration-300`}>
                          <CubeIcon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/parts/${part.id}`} 
                            className="block group-hover:opacity-90 transition-opacity duration-200"
                          >
                            <h3 className="font-bold text-lg text-white mb-1 truncate">{part.partNumber}</h3>
                            <p className="text-white/90 text-sm font-medium truncate">{part.name}</p>
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
                          <span className="text-slate-600 font-medium">Status:</span>
                          {renderStockBadge(part.stockQuantity, false)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 font-medium">Hersteller:</span>
                          <span className="text-slate-800 font-semibold truncate ml-2">
                            {part.manufacturer || <span className="text-slate-400 italic">Nicht angegeben</span>}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 font-medium">Lagerwert:</span>
                          <span className="text-slate-800 font-semibold">
                            {(part.price * part.stockQuantity).toFixed(2)}€
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link 
                          to={`/parts/${part.id}`}
                          className={`flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r ${categoryConfig.gradient} text-white text-sm font-medium rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg ${categoryConfig.shadow} hover:shadow-opacity-40`}
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
                        <button
                          onClick={() => openDeleteDialog(part)}
                          className="inline-flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-xl transition-all duration-200"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Preis</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Lagerbestand</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Hersteller</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {filteredParts.map((part) => {
                      const categoryConfig = getCategoryConfig(part.category);
                      
                      return (
                        <tr key={part.id} className="hover:bg-slate-50/50 transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 bg-gradient-to-br ${categoryConfig.gradient} rounded-xl flex items-center justify-center shadow-lg ${categoryConfig.shadow} group-hover:shadow-opacity-40 transition-all duration-200`}>
                                <CubeIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <Link 
                                  to={`/parts/${part.id}`} 
                                  className="font-semibold text-slate-800 hover:text-indigo-600 text-sm transition-colors duration-200"
                                >
                                  {part.partNumber}
                                </Link>
                                <div className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-[200px]">{part.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {renderCategoryBadge(part.category)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-semibold text-slate-800">{part.price.toFixed(2)} €</div>
                              <div className="text-xs text-slate-500">Stückpreis</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {renderStockBadge(part.stockQuantity)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-800 text-sm font-medium truncate max-w-[150px] block">
                              {part.manufacturer || <span className="text-slate-400 italic">Nicht angegeben</span>}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Link 
                                to={`/parts/${part.id}`}
                                className="inline-flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
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
                              <button
                                onClick={() => openDeleteDialog(part)}
                                className="inline-flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200"
                              >
                                <TrashIcon className="h-3 w-3" />
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
          )
        ) : (
          // Premium Empty State
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-400/25">
              <CubeIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all' 
                ? 'Keine passenden Wartungsteile gefunden' 
                : 'Noch keine Wartungsteile erfasst'}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all'
                ? 'Versuchen Sie einen anderen Suchbegriff oder andere Filter' 
                : 'Beginnen Sie mit der Erfassung Ihrer Ersatz- und Verschleißteile'}
            </p>
            
            {!searchQuery && categoryFilter === 'all' && stockFilter === 'all' && (
              <Link 
                to="/parts/new"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>Erstes Teil erstellen</span>
              </Link>
            )}
          </div>
        )}

        {/* Premium Delete Dialog */}
        {deleteDialog.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-200/20 p-8 max-w-md w-full mx-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Wartungsteil löschen</h3>
                  <p className="text-sm text-slate-600">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="mb-8 p-4 bg-slate-50/50 rounded-xl border border-slate-200/60">
                <p className="text-sm text-slate-700 mb-2">
                  <span className="font-semibold">Teilenummer:</span> {deleteDialog.part?.partNumber}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Name:</span> {deleteDialog.part?.name}
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={closeDeleteDialog}
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200"
                  disabled={isDeleting}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-400 disabled:to-red-500 rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25"
                >
                  {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePartsList;