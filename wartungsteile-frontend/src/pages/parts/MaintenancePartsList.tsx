// src/pages/machines/MachineMaintenancePartsList.tsx - Clean Professional Design
import { useParams, Link } from 'react-router-dom';
import { useMaintenancePartsList } from '../../hooks/useParts';
import { useMachineDetail } from '../../hooks/useMachines';
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  ShoppingCartIcon,
  EyeIcon,
  CogIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const MachineMaintenancePartsList = () => {
  const { id } = useParams<{ id: string }>();
  const { data: machine, isLoading: machineLoading } = useMachineDetail(id || '');
  const { data: partsList, isLoading: partsLoading, error } = useMaintenancePartsList(machine?.number || '');

  const isLoading = machineLoading || partsLoading;

  // Kategorie-Badge Styling
  const getCategoryBadge = (category: string) => {
    const styles = {
      'WearPart': 'bg-red-50 text-red-800 border-red-200',
      'SparePart': 'bg-blue-50 text-blue-800 border-blue-200', 
      'ConsumablePart': 'bg-amber-50 text-amber-800 border-amber-200',
      'ToolPart': 'bg-green-50 text-green-800 border-green-200'
    };
    
    const labels = {
      'WearPart': 'Verschleißteil',
      'SparePart': 'Ersatzteil', 
      'ConsumablePart': 'Verbrauchsmaterial',
      'ToolPart': 'Werkzeug'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium border rounded-full ${styles[category as keyof typeof styles] || 'bg-gray-50 text-gray-800 border-gray-200'}`}>
        {labels[category as keyof typeof labels] || category}
      </span>
    );
  };

  // Status-Badge für Überfälligkeit
  const getOverdueStatus = (isOverdue: boolean, lastReplacementYear?: number) => {
    if (isOverdue) {
      return (
        <div className="flex items-center space-x-1 text-red-600">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Überfällig</span>
        </div>
      );
    } else if (lastReplacementYear && (new Date().getFullYear() - lastReplacementYear) >= 1) {
      return (
        <div className="flex items-center space-x-1 text-amber-600">
          <ClockIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Bald fällig</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircleIcon className="h-4 w-4" />
          <span className="text-sm font-medium">OK</span>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !partsList || !machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600">Fehler beim Laden der Wartungsteileliste</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Die Wartungsteileliste konnte nicht generiert werden.'}
          </p>
          <Link 
            to={`/machines/${id}`}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Zurück zur Maschine</span>
          </Link>
        </div>
      </div>
    );
  }

  // Kosten berechnen
  const requiredCosts = partsList.requiredParts.reduce((sum, part) => 
    sum + (part.price * part.recommendedQuantity), 0);
  const recommendedCosts = partsList.recommendedParts.reduce((sum, part) => 
    sum + (part.price * part.recommendedQuantity), 0);
  const totalCosts = requiredCosts + recommendedCosts;

  const overdueCount = [...partsList.requiredParts, ...partsList.recommendedParts]
    .filter(part => part.isOverdue).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to={`/machines/${id}`}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Zurück zur Maschine</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wartungsteile</h1>
              <p className="text-gray-600 mt-1">Maschine {machine.number} - {machine.type}</p>
            </div>
          </div>
        </div>

        <button className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-medium rounded-lg transition-colors">
          <ShoppingCartIcon className="h-4 w-4" />
          <span>Wartung planen</span>
        </button>
      </div>

      {/* Übersicht-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pflichtteile</p>
              <p className="text-2xl font-bold text-red-600">{partsList.requiredParts.length}</p>
              <p className="text-xs text-red-500 mt-1">Müssen ausgetauscht werden</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empfohlene Teile</p>
              <p className="text-2xl font-bold text-blue-600">{partsList.recommendedParts.length}</p>
              <p className="text-xs text-blue-500 mt-1">Optional austauschen</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Überfällige Teile</p>
              <p className="text-2xl font-bold text-amber-600">{overdueCount}</p>
              <p className="text-xs text-amber-500 mt-1">Sofort tauschen</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gesamtkosten</p>
              <p className="text-2xl font-bold text-blue-600">{totalCosts.toFixed(2)} €</p>
              <p className="text-xs text-gray-500 mt-1">Alle Wartungsteile</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <CubeIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Maschineninfo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-4">
          <CogIcon className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Maschinendetails</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
            <div>
              <span className="text-blue-600 font-medium">Baujahr:</span>
              <p className="font-semibold text-gray-800">{partsList.machineProductionYear}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CogIcon className="h-4 w-4 text-blue-600" />
            <div>
              <span className="text-blue-600 font-medium">Typ:</span>
              <p className="font-semibold text-gray-800">{machine.type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-blue-600" />
            <div>
              <span className="text-blue-600 font-medium">Betriebsstunden:</span>
              <p className="font-semibold text-gray-800">{machine.operatingHours} h</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-4 w-4 text-blue-600" />
            <div>
              <span className="text-blue-600 font-medium">Status:</span>
              <p className="font-semibold text-gray-800">{machine.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pflichtteile */}
      {partsList.requiredParts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <div>
                  <h2 className="text-lg font-semibold text-red-800">
                    Pflichtteile ({partsList.requiredParts.length})
                  </h2>
                  <p className="text-red-600 text-sm">Diese Teile müssen ausgetauscht werden</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-red-600">{requiredCosts.toFixed(2)} €</p>
                <p className="text-red-500 text-sm">Kosten Pflichtteile</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teil</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partsList.requiredParts.map((part, index) => (
                  <tr key={`required-${part.partId}-${index}`} className="hover:bg-red-25 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{part.name}</div>
                        <div className="text-sm text-gray-500">{part.partNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryBadge(part.category)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-800">{part.recommendedQuantity} Stück</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-800">{(part.price * part.recommendedQuantity).toFixed(2)} €</div>
                        <div className="text-gray-500">{part.price.toFixed(2)} € × {part.recommendedQuantity}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getOverdueStatus(part.isOverdue, part.lastReplacementYear)}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/parts/${part.partId}`}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empfohlene Teile */}
      {partsList.recommendedParts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-blue-800">
                    Empfohlene Teile ({partsList.recommendedParts.length})
                  </h2>
                  <p className="text-blue-600 text-sm">Diese Teile können optional ausgetauscht werden</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-blue-600">{recommendedCosts.toFixed(2)} €</p>
                <p className="text-blue-500 text-sm">Kosten empfohlene Teile</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teil</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partsList.recommendedParts.map((part, index) => (
                  <tr key={`recommended-${part.partId}-${index}`} className="hover:bg-blue-25 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{part.name}</div>
                        <div className="text-sm text-gray-500">{part.partNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryBadge(part.category)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-800">{part.recommendedQuantity} Stück</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-800">{(part.price * part.recommendedQuantity).toFixed(2)} €</div>
                        <div className="text-gray-500">{part.price.toFixed(2)} € × {part.recommendedQuantity}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getOverdueStatus(part.isOverdue, part.lastReplacementYear)}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        to={`/parts/${part.partId}`}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wenn keine Teile vorhanden */}
      {partsList.requiredParts.length === 0 && partsList.recommendedParts.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <WrenchScrewdriverIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Keine Wartungsteile erforderlich</h3>
          <p className="text-gray-500 mb-2">
            Für diese Maschine wurden keine Wartungsteile gefunden.
          </p>
          <p className="text-gray-400 text-sm">
            Möglicherweise sind alle Teile aktuell oder die Maschine benötigt derzeit keine Wartung.
          </p>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">Nächste Schritte:</p>
            <div className="flex justify-center space-x-4">
              <Link 
                to={`/machines/${id}`}
                className="inline-flex items-center px-4 py-2 text-sm text-gray-600 hover:text-blue-600 border border-gray-300 hover:border-blue-600 rounded-lg transition-colors"
              >
                Zurück zur Maschine
              </Link>
              <button className="inline-flex items-center px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
                Wartungshistorie prüfen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineMaintenancePartsList;