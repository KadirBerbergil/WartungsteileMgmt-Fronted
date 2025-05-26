// src/pages/parts/MaintenancePartsList.tsx - Modernes Design passend zur Maschinen-Seite
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, part: any}>({isOpen: false, part: null});
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { data: parts, isLoading, error } = useMaintenanceParts();
  const queryClient = useQueryClient();

  // Filterfunktion für die Suche
  const filteredParts = parts?.filter(part => 
    part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Löschen-Dialog öffnen
  const openDeleteDialog = (part: any) => {
    setDeleteDialog({isOpen: true, part});
  };

  // Löschen-Dialog schließen
  const closeDeleteDialog = () => {
    setDeleteDialog({isOpen: false, part: null});
  };

  // Wartungsteil löschen
  const handleDelete = async () => {
    if (!deleteDialog.part) return;
    
    setIsDeleting(true);
    try {
      const success = await maintenancePartService.delete(deleteDialog.part.id);
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['maintenanceParts'] });
        closeDeleteDialog();
        console.log('✅ Wartungsteil erfolgreich gelöscht!');
      } else {
        alert('Fehler beim Löschen des Wartungsteils');
      }
    } catch (error: any) {
      console.error('❌ Fehler beim Löschen:', error);
      alert(`Fehler beim Löschen: ${error.response?.data || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Moderne Kategorie-Badge Styling
  const getCategoryBadge = (category: string) => {
    const styles = {
      'WearPart': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-400',
        label: 'Verschleißteil'
      },
      'SparePart': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-400',
        label: 'Ersatzteil'
      },
      'ConsumablePart': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
        label: 'Verbrauchsmaterial'
      },
      'ToolPart': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-400',
        label: 'Werkzeug'
      }
    };

    const style = styles[category as keyof typeof styles] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      dot: 'bg-gray-400',
      label: category
    };

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-full ${style.bg} ${style.text} border ${style.border}`}>
        <div className={`w-2 h-2 rounded-full ${style.dot}`}></div>
        <span>{style.label}</span>
      </div>
    );
  };

  // Moderner Lagerbestand Status
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return (
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <span>Ausverkauft</span>
        </div>
      );
    } else if (quantity <= 3) {
      return (
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          <span>{quantity} (Niedrig)</span>
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <span>{quantity} verfügbar</span>
        </div>
      );
    }
  };

  // Statistiken berechnen
  const stats = parts ? {
    total: parts.length,
    wearParts: parts.filter(p => p.category === 'WearPart').length,
    lowStock: parts.filter(p => p.stockQuantity <= 3 && p.stockQuantity > 0).length,
    outOfStock: parts.filter(p => p.stockQuantity === 0).length
  } : { total: 0, wearParts: 0, lowStock: 0, outOfStock: 0 };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Wartungsteile</h1>
              <p className="text-gray-600 mt-2 text-lg">Ersatz- und Verschleißteile verwalten</p>
            </div>
            
            {/* Moderne Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link 
                to="/parts/new"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Neues Teil</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Moderne Statistik-Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamte Teile</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CubeIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verschleißteile</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.wearParts}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Niedrige Bestände</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{stats.lowStock}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ausverkauft</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStock}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Such- und Filter-Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Wartungsteile durchsuchen..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                <FunnelIcon className="h-4 w-4" />
                <span>Filter</span>
              </button>
              
              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Wartungsteile werden geladen...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 font-medium">Fehler beim Laden der Wartungsteile</p>
          </div>
        ) : filteredParts && filteredParts.length > 0 ? (
          viewMode === 'grid' ? (
            // Grid View (Modern Cards)
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredParts.map((part) => (
                <div key={part.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 overflow-hidden group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <CubeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{part.partNumber}</h3>
                          <p className="text-sm text-gray-600 truncate">{part.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {getCategoryBadge(part.category)}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Preis</span>
                        <span className="font-semibold text-gray-900">{part.price.toFixed(2)} €</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Lagerbestand</span>
                        <div>{getStockStatus(part.stockQuantity)}</div>
                      </div>
                      {part.manufacturer && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Hersteller</span>
                          <span className="font-medium text-gray-900 truncate ml-2">{part.manufacturer}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/parts/${part.id}`}
                        className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Details</span>
                      </Link>
                      <Link 
                        to={`/parts/${part.id}/edit`}
                        className="inline-flex items-center justify-center p-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => openDeleteDialog(part)}
                        className="inline-flex items-center justify-center p-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Table View (Clean & Modern)
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teil</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategorie</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Preis</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lagerbestand</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hersteller</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredParts.map((part) => (
                    <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CubeIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{part.partNumber}</div>
                            <div className="text-sm text-gray-600 truncate">{part.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getCategoryBadge(part.category)}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{part.price.toFixed(2)} €</span>
                      </td>
                      <td className="px-6 py-4">{getStockStatus(part.stockQuantity)}</td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 truncate">
                          {part.manufacturer || <span className="text-gray-400 italic">Nicht angegeben</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Link 
                            to={`/parts/${part.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Details
                          </Link>
                          <Link 
                            to={`/parts/${part.id}/edit`}
                            className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                          >
                            Bearbeiten
                          </Link>
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
          )
        ) : (
          // Empty State (Modern)
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CubeIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Keine passenden Wartungsteile gefunden' : 'Noch keine Wartungsteile'}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchQuery ? 'Versuche einen anderen Suchbegriff' : 'Erstelle dein erstes Wartungsteil'}
            </p>
            
            {!searchQuery && (
              <Link 
                to="/parts/new"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Neues Teil erstellen</span>
              </Link>
            )}
          </div>
        )}

        {/* Lösch-Bestätigungsdialog (Modern) */}
        {deleteDialog.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Wartungsteil löschen</h3>
                  <p className="text-sm text-gray-600">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
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
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:bg-red-400 transition-colors"
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