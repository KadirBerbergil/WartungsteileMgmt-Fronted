// src/pages/parts/MaintenancePartsList.tsx - Mit Löschen-Feature
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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MaintenancePartsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
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
        // Cache invalidieren damit Liste aktualisiert wird
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[category as keyof typeof labels] || category}
      </span>
    );
  };

  // Lagerbestand Status - Kompakter
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return (
        <div className="flex items-center space-x-1 text-red-600">
          <ExclamationTriangleIcon className="h-3 w-3" />
          <span className="text-sm font-medium">Ausverkauft</span>
        </div>
      );
    } else if (quantity <= 3) {
      return (
        <div className="flex items-center space-x-1 text-yellow-600">
          <ExclamationTriangleIcon className="h-3 w-3" />
          <span className="text-sm font-medium">{quantity} (Niedrig)</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <CubeIcon className="h-3 w-3" />
          <span className="text-sm font-medium">{quantity}</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wartungsteile</h1>
          <p className="text-gray-600 mt-1">Ersatz- und Verschleißteile verwalten</p>
        </div>
        <Link 
          to="/parts/new"
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg w-fit"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Neues Wartungsteil</span>
        </Link>
      </div>

      {/* Suchfeld - Responsive */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Nach Teil suchen..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
      </div>

      {/* Statistiken - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Wartungsteile-Tabelle/Cards - Professionelles Scrolling */}
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
          <>
            {/* Desktop Tabelle - Sauberes Scrolling */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto max-h-[calc(100vh-400px)]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                        Teil
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Kategorie
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                        Preis
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Lagerbestand
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Hersteller
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredParts.map((part, index) => (
                      <tr key={`${part.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-primary break-words">{part.partNumber}</div>
                            <div className="text-sm text-gray-600 break-words">{part.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {getCategoryBadge(part.category)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-800">
                            {part.price.toFixed(2)} €
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {getStockStatus(part.stockQuantity)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-600 break-words">
                            {part.manufacturer || <span className="text-gray-400 italic">Nicht angegeben</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <Link 
                              to={`/parts/${part.id}`} 
                              className="flex items-center space-x-1 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span className="hidden xl:inline">Details</span>
                            </Link>
                            <Link 
                              to={`/parts/${part.id}/edit`}
                              className="flex items-center space-x-1 text-secondary hover:text-secondary/80 text-sm font-medium transition-colors"
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="hidden xl:inline">Bearbeiten</span>
                            </Link>
                            <button
                              onClick={() => openDeleteDialog(part)}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span className="hidden xl:inline">Löschen</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Cards - Sauberes Scrolling */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200 max-h-[calc(100vh-400px)] overflow-y-auto">
                {filteredParts.map((part, index) => (
                  <div key={`mobile-${part.id}-${index}`} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-primary break-words">{part.partNumber}</div>
                        <div className="text-sm text-gray-600 break-words mb-2">{part.name}</div>
                        <div className="mb-2">{getCategoryBadge(part.category)}</div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link 
                          to={`/parts/${part.id}`} 
                          className="p-2 text-primary hover:text-primary/80 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link 
                          to={`/parts/${part.id}/edit`}
                          className="p-2 text-secondary hover:text-secondary/80 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => openDeleteDialog(part)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Preis:</span>
                        <div className="font-medium text-gray-800">{part.price.toFixed(2)} €</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Lagerbestand:</span>
                        <div>{getStockStatus(part.stockQuantity)}</div>
                      </div>
                      {part.manufacturer && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Hersteller:</span>
                          <div className="text-gray-600 break-words">{part.manufacturer}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
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

      {/* Lösch-Bestätigungsdialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Wartungsteil löschen</h3>
                <p className="text-sm text-gray-500">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-700">
                Möchten Sie das Wartungsteil <strong>{deleteDialog.part?.partNumber}</strong> wirklich löschen?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Name:</strong> {deleteDialog.part?.name}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeDeleteDialog}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:bg-red-400 transition-colors"
              >
                {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePartsList;