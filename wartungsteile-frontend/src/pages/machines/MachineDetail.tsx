// src/pages/parts/MaintenancePartDetail.tsx - Clean Professional Design
import { useParams, Link } from 'react-router-dom';
import { useMaintenancePartDetail } from '../../hooks/useParts';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  ArrowLeftIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShoppingCartIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  TagIcon,
  BanknotesIcon,
  BoltIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const MaintenancePartDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: part, isLoading, error } = useMaintenancePartDetail(id || '');

  const getCategoryConfig = (category: string) => {
    const configs = {
      'WearPart': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        label: 'Verschleißteil',
        icon: BoltIcon
      },
      'SparePart': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Ersatzteil',
        icon: CubeIcon
      },
      'ConsumablePart': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Verbrauchsmaterial',
        icon: CubeIcon
      },
      'ToolPart': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Werkzeug',
        icon: CubeIcon
      }
    };

    return configs[category as keyof typeof configs] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      label: category,
      icon: CubeIcon
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
        trend: 'critical',
        description: 'Sofortige Nachbestellung erforderlich'
      };
    } else if (quantity <= 3) {
      return {
        status: 'Niedriger Bestand',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: ExclamationTriangleIcon,
        trend: 'warning',
        description: 'Bald nachbestellen'
      };
    } else {
      return {
        status: 'Gut verfügbar',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircleIcon,
        trend: 'good',
        description: 'Ausreichend vorrätig'
      };
    }
  };

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
          <p className="text-gray-600 text-sm mt-2">
            {error instanceof Error ? error.message : 'Unbekannter Fehler'}
          </p>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">Wartungsteil nicht gefunden</h3>
          <p className="text-gray-600">Das angeforderte Teil existiert nicht.</p>
        </div>
      </div>
    );
  }

  const categoryConfig = getCategoryConfig(part.category);
  const stockConfig = getStockConfig(part.stockQuantity);
  const CategoryIcon = categoryConfig.icon;
  const StockIcon = stockConfig.icon;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link 
              to="/parts" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Zurück zur Liste</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${categoryConfig.bg} rounded-lg flex items-center justify-center border ${categoryConfig.border}`}>
              <CategoryIcon className={`h-6 w-6 ${categoryConfig.text}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{part.name}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-gray-600 font-medium">{part.partNumber}</span>
                <div className={`inline-flex items-center px-2 py-1 rounded-full border text-sm font-medium ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}>
                  <div className={`w-2 h-2 rounded-full ${categoryConfig.text.replace('text-', 'bg-')} mr-2`}></div>
                  {categoryConfig.label}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Link 
          to={`/parts/${part.id}/edit`}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
          <span>Bearbeiten</span>
        </Link>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center space-x-1 text-blue-600">
              <ArrowTrendingUpIcon className="h-4 w-4" />
              <span className="text-xs font-semibold">Stabil</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{part.price.toFixed(2)}€</div>
          <div className="text-sm font-medium text-gray-600">Stückpreis</div>
          <div className="text-xs text-gray-500 mt-1">Inkl. Beschaffung</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${stockConfig.bg} rounded-lg flex items-center justify-center border ${stockConfig.border}`}>
              <StockIcon className={`h-5 w-5 ${stockConfig.text}`} />
            </div>
            <div className={`flex items-center space-x-1 ${stockConfig.text}`}>
              {stockConfig.trend === 'critical' ? (
                <ArrowTrendingDownIcon className="h-4 w-4" />
              ) : stockConfig.trend === 'warning' ? (
                <ExclamationTriangleIcon className="h-4 w-4" />
              ) : (
                <ArrowTrendingUpIcon className="h-4 w-4" />
              )}
              <span className="text-xs font-semibold">{stockConfig.status}</span>
            </div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${stockConfig.text}`}>{part.stockQuantity}</div>
          <div className="text-sm font-medium text-gray-600">Lagerbestand</div>
          <div className="text-xs text-gray-500 mt-1">{part.stockQuantity === 1 ? 'Stück verfügbar' : 'Stück verfügbar'}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-center space-x-1 text-purple-600">
              <ArrowTrendingUpIcon className="h-4 w-4" />
              <span className="text-xs font-semibold">+12%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-1">{(part.price * part.stockQuantity).toFixed(2)}€</div>
          <div className="text-sm font-medium text-gray-600">Lagerwert</div>
          <div className="text-xs text-gray-500 mt-1">{part.stockQuantity} × {part.price.toFixed(2)}€</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex items-center space-x-1 text-indigo-600">
              <span className="text-xs font-semibold">Aktiv</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 mb-1">24/7</div>
          <div className="text-sm font-medium text-gray-600">Verfügbarkeit</div>
          <div className="text-xs text-gray-500 mt-1">Sofort einsatzbereit</div>
        </div>
      </div>

      {/* Stock Alert */}
      {part.stockQuantity <= 3 && (
        <div className={`${stockConfig.bg} border ${stockConfig.border} rounded-lg p-4`}>
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 ${stockConfig.bg} rounded-lg flex items-center justify-center border ${stockConfig.border}`}>
              <StockIcon className={`h-5 w-5 ${stockConfig.text}`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${stockConfig.text} mb-2 flex items-center space-x-2`}>
                <span>{stockConfig.status}</span>
                <div className={`w-2 h-2 ${stockConfig.text.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
              </h3>
              <p className={`${stockConfig.text} mb-4`}>
                {stockConfig.description}. Aktueller Bestand: {part.stockQuantity} Stück.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className={`inline-flex items-center space-x-2 px-4 py-2 ${stockConfig.text.replace('text-', 'bg-')} text-white font-medium rounded-lg hover:opacity-90 transition-colors`}>
                  <ShoppingCartIcon className="h-4 w-4" />
                  <span>Jetzt nachbestellen</span>
                </button>
                <button className={`inline-flex items-center space-x-2 px-4 py-2 bg-white border ${stockConfig.border} ${stockConfig.text} hover:bg-gray-50 rounded-lg transition-colors`}>
                  <ClockIcon className="h-4 w-4" />
                  <span>Erinnerung setzen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Data */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-4 w-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Grunddaten</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <InfoField label="Teilenummer" value={part.partNumber} icon={TagIcon} />
                <InfoField label="Kategorie" value={categoryConfig.label} icon={CategoryIcon} />
                <InfoField label="Stückpreis" value={`${part.price.toFixed(2)} €`} icon={BanknotesIcon} />
              </div>
              <div className="space-y-3">
                <InfoField 
                  label="Hersteller" 
                  value={part.manufacturer || "Nicht angegeben"} 
                  icon={BuildingOffice2Icon}
                  empty={!part.manufacturer}
                />
                <InfoField label="Lagerbestand" value={`${part.stockQuantity} Stück`} icon={CubeIcon} />
                <InfoField label="Lagerwert" value={`${(part.price * part.stockQuantity).toFixed(2)} €`} icon={ChartBarIcon} />
              </div>
            </div>
          </div>

          {/* Description */}
          {part.description && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Beschreibung</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{part.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stock Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-8 h-8 ${stockConfig.bg} rounded-lg flex items-center justify-center border ${stockConfig.border}`}>
                <StockIcon className={`h-4 w-4 ${stockConfig.text}`} />
              </div>
              <h3 className="font-semibold text-gray-800">Lager-Status</h3>
            </div>
            
            <div className="text-center mb-4">
              <div className={`text-3xl font-bold mb-2 ${stockConfig.text}`}>
                {part.stockQuantity}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {part.stockQuantity === 1 ? 'Stück verfügbar' : 'Stück verfügbar'}
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${stockConfig.bg} ${stockConfig.text} ${stockConfig.border}`}>
                <StockIcon className="h-4 w-4 mr-2" />
                {stockConfig.status}
              </div>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Optimaler Bestand:</span>
                <span className="font-semibold text-gray-800">10 Stück</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mindestbestand:</span>
                <span className="font-semibold text-gray-800">3 Stück</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lieferzeit:</span>
                <span className="font-semibold text-gray-800">5-7 Tage</span>
              </div>
            </div>

            {part.stockQuantity <= 5 && (
              <button className={`w-full ${stockConfig.text.replace('text-', 'bg-')} text-white px-4 py-2 text-sm font-medium rounded-lg hover:opacity-90 transition-colors`}>
                <div className="flex items-center justify-center space-x-2">
                  <ShoppingCartIcon className="h-4 w-4" />
                  <span>Nachbestellen</span>
                </div>
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Schnellaktionen</h3>
            <div className="space-y-2">
              <QuickAction
                icon={CubeIcon}
                title="Kompatible Maschinen"
                description="Anzeigen"
              />
              <QuickAction
                icon={ClockIcon}
                title="Verwendungshistorie"
                description="Verlauf ansehen"
              />
              <QuickAction
                icon={ChartBarIcon}
                title="Preishistorie"
                description="Trends analysieren"
              />
              <QuickAction
                icon={DocumentTextIcon}
                title="Wartungsplan"
                description="Intervalle prüfen"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Info Field Component
const InfoField = ({ label, value, icon: Icon, empty = false }: {
  label: string;
  value: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  empty?: boolean;
}) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="h-4 w-4 text-gray-600" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`font-semibold mt-1 ${empty ? 'text-gray-400 italic' : 'text-gray-800'}`}>
        {value}
      </div>
    </div>
  </div>
);

// Quick Action Component
const QuickAction = ({ icon: Icon, title, description }: {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  title: string;
  description: string;
}) => (
  <button className="w-full group">
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium text-gray-800 text-sm group-hover:text-gray-900">{title}</div>
        <div className="text-xs text-gray-500 group-hover:text-gray-600">{description}</div>
      </div>
    </div>
  </button>
);

export default MaintenancePartDetail;