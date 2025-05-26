// src/pages/parts/MaintenancePartsList.tsx - Professionelle B2B-Version
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
  ListBulletIcon
} from '@heroicons/react/24/outline';

const MaintenancePartsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, part: any}>({isOpen: false, part: null});
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { data: parts, isLoading, error } = useMaintenanceParts();
  const queryClient = useQueryClient();

  const filteredParts = parts?.filter(part => 
    part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const getCategoryBadge = (category: string) => {
    const styles = {
      'WearPart': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'Verschleißteil'
      },
      'SparePart': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Ersatzteil'
      },
      'ConsumablePart': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Verbrauchsmaterial'
      },
      'ToolPart': {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        label: 'Werkzeug'
      }
    };

    const style = styles[category as keyof typeof styles] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      label: category
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
        {style.label}
      </span>
    );
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200">
          Ausverkauft
        </span>
      );
    } else if (quantity <= 3) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          {quantity} (Niedrig)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          {quantity} verfügbar
        </span>
      );
    }
  };

  const stats = parts ? {
    total: parts.length,
    wearParts: parts.filter(p => p.category === 'WearPart').length,
    lowStock: parts.filter(p => p.stockQuantity <= 3 && p.stockQuantity > 0).length,
    outOfStock: parts.filter(p => p.stockQuantity === 0).length
  } : { total: 0, wearParts: 0, lowStock: 0, outOfStock: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Wartungsteile</h1>
              <p className="text-gray-600 mt-1">Ersatz- und Verschleißteile verwalten</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                to="/parts/new"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Neues Teil</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistik-Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gesamte Teile</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 flex items-center justify-center">
                <CubeIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Verschleißteile</p>
                <p className="text-2xl font-semibold text-red-600 mt-1">{stats.wearParts}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Niedrige Bestände</p>
                <p className="text-2xl font-semibold text-amber-600 mt-1">{stats.lowStock}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ausverkauft</p>
                <p className="text-2xl font-semibold text-red-600 mt-1">{stats.outOfStock}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Such- und Filter-Bar */}
        <div className="bg-white border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Wartungsteile durchsuchen..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors">
                <FunnelIcon className="h-4 w-4" />
                <span>Filter</span>
              </button>
              
              <div className="flex bg-gray-100">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 transition-colors ${
                    viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="bg-white border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 text-sm">Wartungsteile werden geladen...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 p-8 text-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-medium">Fehler beim Laden der Wartungsteile</p>
          </div>
        ) : filteredParts && filteredParts.length > 0 ? (
          viewMode === 'table' ? (
            // Professionelle Tabelle
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teil</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preis</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lagerbestand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hersteller</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredParts.map((part) => (
                    <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                            <CubeIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm truncate">{part.partNumber}</div>
                            <div className="text-xs text-gray-600 truncate">{part.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getCategoryBadge(part.category)}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 text-sm">{part.price.toFixed(2)} €</span>
                      </td>
                      <td className="px-4 py-3">{getStockStatus(part.stockQuantity)}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900 text-sm truncate">
                          {part.manufacturer || <span className="text-gray-400 italic">Nicht angegeben</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/parts/${part.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Details
                          </Link>
                          <span className="text-gray-300">|</span>
                          <Link 
                            to={`/parts/${part.id}/edit`}
                            className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                          >
                            Bearbeiten
                          </Link>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => openDeleteDialog(part)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Löschen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Professionelle Grid-Ansicht
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredParts.map((part) => (
                <div key={part.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                          <CubeIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm truncate">{part.partNumber}</h3>
                          <p className="text-xs text-gray-600 truncate">{part.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      {getCategoryBadge(part.category)}
                    </div>
                    
                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Preis</span>
                        <span className="font-medium text-gray-900">{part.price.toFixed(2)} €</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Lagerbestand</span>
                        <div>{getStockStatus(part.stockQuantity)}</div>
                      </div>
                      {part.manufacturer && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Hersteller</span>
                          <span className="font-medium text-gray-900 truncate ml-2">{part.manufacturer}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/parts/${part.id}`}
                        className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                      >
                        <EyeIcon className="h-3 w-3" />
                        <span>Details</span>
                      </Link>
                      <Link 
                        to={`/parts/${part.id}/edit`}
                        className="inline-flex items-center justify-center p-2 border border-gray-300 hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => openDeleteDialog(part)}
                        className="inline-flex items-center justify-center p-2 border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Empty State
          <div className="bg-white border border-gray-200 p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CubeIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Keine passenden Wartungsteile gefunden' : 'Noch keine Wartungsteile'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Versuchen Sie einen anderen Suchbegriff' : 'Erstellen Sie Ihr erstes Wartungsteil'}
            </p>
            
            {!searchQuery && (
              <Link 
                to="/parts/new"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-all"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Neues Teil erstellen</span>
              </Link>
            )}
          </div>
        )}

        {/* Lösch-Bestätigungsdialog */}
        {deleteDialog.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white shadow-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Wartungsteil löschen</h3>
                  <p className="text-sm text-gray-600">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Teilenummer:</span> {deleteDialog.part?.partNumber}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Name:</span> {deleteDialog.part?.name}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteDialog}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 transition-colors"
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