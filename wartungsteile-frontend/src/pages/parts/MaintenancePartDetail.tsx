// src/pages/parts/MaintenancePartDetail.tsx
import { useParams, Link } from 'react-router-dom';
import { useMaintenancePartDetail } from '../../hooks/useParts';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const MaintenancePartDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: part, isLoading, error } = useMaintenancePartDetail(id || '');

  // Kategorie-Badge Styling (gleich wie in der Liste)
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[category as keyof typeof labels] || category}
      </span>
    );
  };

  // Lagerbestand Status
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return {
        icon: ExclamationTriangleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Ausverkauft',
        description: 'Nachbestellung erforderlich'
      };
    } else if (quantity <= 3) {
      return {
        icon: ExclamationTriangleIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Niedriger Bestand',
        description: 'Bald nachbestellen'
      };
    } else {
      return {
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Gut verfügbar',
        description: 'Ausreichend vorrätig'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link to="/parts" className="text-primary hover:text-primary/80">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Wartungsteil wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link to="/parts" className="text-primary hover:text-primary/80">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-medium">Fehler beim Laden des Wartungsteils</p>
          <p className="text-gray-500 text-sm mt-2">
            {error instanceof Error ? error.message : 'Unbekannter Fehler'}
          </p>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link to="/parts" className="text-primary hover:text-primary/80">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">Wartungsteil nicht gefunden.</p>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(part.stockQuantity);
  const StockIcon = stockStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header mit Zurück-Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/parts" 
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Zurück zur Liste</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-800">{part.name}</h1>
        </div>
        
        <Link 
          to={`/parts/${part.id}/edit`}
          className="flex items-center space-x-2 bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg"
        >
          <PencilIcon className="h-4 w-4" />
          <span>Bearbeiten</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hauptinformationen */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grunddaten */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Grunddaten</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Teilenummer</label>
                <p className="text-lg font-medium text-gray-800">{part.partNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kategorie</label>
                <div className="mt-1">
                  {getCategoryBadge(part.category)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Preis</label>
                <p className="text-lg font-medium text-gray-800">{part.price.toFixed(2)} €</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Hersteller</label>
                <p className="text-lg font-medium text-gray-800">
                  {part.manufacturer || <span className="text-gray-400 italic">Nicht angegeben</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Beschreibung */}
          {part.description && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Beschreibung</h2>
              <p className="text-gray-600 leading-relaxed">{part.description}</p>
            </div>
          )}
        </div>

        {/* Seitenleiste mit Lagerbestand */}
        <div className="space-y-6">
          {/* Lagerbestand */}
          <div className={`p-6 rounded-xl border-2 ${stockStatus.bgColor} ${stockStatus.borderColor}`}>
            <div className="flex items-center space-x-3 mb-4">
              <StockIcon className={`h-6 w-6 ${stockStatus.color}`} />
              <div>
                <h3 className="font-semibold text-gray-800">Lagerbestand</h3>
                <p className={`text-sm ${stockStatus.color}`}>{stockStatus.label}</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {part.stockQuantity}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {part.stockQuantity === 1 ? 'Stück verfügbar' : 'Stück verfügbar'}
              </div>
              <p className={`text-xs ${stockStatus.color}`}>
                {stockStatus.description}
              </p>
            </div>

            {part.stockQuantity <= 3 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  Nachbestellen
                </button>
              </div>
            )}
          </div>

          {/* Lagerwert */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">Lagerwert</h3>
            <div className="text-2xl font-bold text-primary">
              {(part.price * part.stockQuantity).toFixed(2)} €
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {part.stockQuantity} × {part.price.toFixed(2)} €
            </p>
          </div>

          {/* Schnellaktionen */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-medium text-gray-700 mb-3">Schnellaktionen</h3>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-gray-600 hover:text-primary py-2 px-3 rounded hover:bg-white transition-all">
                📊 Kompatible Maschinen anzeigen
              </button>
              <button className="w-full text-left text-sm text-gray-600 hover:text-primary py-2 px-3 rounded hover:bg-white transition-all">
                📋 Verwendungshistorie
              </button>
              <button className="w-full text-left text-sm text-gray-600 hover:text-primary py-2 px-3 rounded hover:bg-white transition-all">
                📈 Preishistorie
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePartDetail;