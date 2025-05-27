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
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: CheckCircleIcon,
        trend: 'good',
        description: 'Ausreichend vorrätig'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link to="/parts" className="text-blue-600 hover:text-blue-700 transition-colors">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wartungsteil wird geladen</h3>
          <p className="text-gray-600">Details werden zusammengestellt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link to="/parts" className="text-blue-600 hover:text-blue-700 transition-colors">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Wartungsteil nicht gefunden</h3>
          <p className="text-gray-600 text-sm mt-2 mb-4">
            Das angeforderte Wartungsteil mit der ID "{id}" existiert nicht oder wurde gelöscht.
          </p>
          <Link 
            to="/parts"
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Zur Wartungsteile-Liste
          </Link>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link to="/parts" className="text-blue-600 hover:text-blue-700 transition-colors">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">Wartungsteil nicht gefunden</h3>
          <p className="text-gray-600">Das angeforderte Teil existiert nicht.</p>
        </div>
      </div>
    );
  }

  const categoryConfig = getCategoryConfig(part.category);
  const stockConfig = getStockConfig(part.stockQuantity);
  const StockIcon = stockConfig.icon;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link 
            to="/parts" 
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            ← Zurück zur Liste
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{part.name}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-gray-600">{part.partNumber}</span>
              <div className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border}`}>
                <div className={`w-2 h-2 rounded-full bg-${categoryConfig.color}-600 mr-2`}></div>
                {categoryConfig.label}
              </div>
            </div>
          </div>
        </div>
        
        <Link 
          to={`/parts/${part.id}/edit`}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
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
              <span className="text-xs font-medium">Stabil</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{part.price.toFixed(2)}€</div>
          <div className="text-gray-600 text-sm">Stückpreis</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 bg-${stockConfig.trend === 'critical' ? 'red' : stockConfig.trend === 'warning' ? 'amber' : 'green'}-50 rounded-lg flex items-center justify-center`}>
              <StockIcon className={`h-5 w-5 text-${stockConfig.trend === 'critical' ? 'red' : stockConfig.trend === 'warning' ? 'amber' : 'green'}-600`} />
            </div>
            <div className={`flex items-center space-x-1 ${stockConfig.text}`}>
              {stockConfig.trend === 'critical' ? (
                <ArrowTrendingDownIcon className="h-4 w-4" />
              ) : stockConfig.trend === 'warning' ? (
                <ExclamationTriangleIcon className="h-4 w-4" />
              ) : (
                <ArrowTrendingUpIcon className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">{stockConfig.status}</span>
            </div>
          </div>
          <div className={`text-2xl font-bold mb-1 ${stockConfig.text}`}>{part.stockQuantity}</div>
          <div className="text-gray-600 text-sm">Lagerbestand</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-center space-x-1 text-purple-600">
              <ArrowTrendingUpIcon className="h-4 w-4" />
              <span className="text-xs font-medium">+12%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-1">{(part.price * part.stockQuantity).toFixed(2)}€</div>
          <div className="text-gray-600 text-sm">Lagerwert</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex items-center space-x-1 text-indigo-600">
              <span className="text-xs font-medium">Aktiv</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 mb-1">24/7</div>
          <div className="text-gray-600 text-sm">Verfügbarkeit</div>
        </div>
      </div>

      {/* Stock Alert */}
      {part.stockQuantity <= 3 && (
        <div className={`bg-white rounded-lg border ${stockConfig.border} p-6`}>
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 bg-${stockConfig.trend === 'critical' ? 'red' : 'amber'}-50 rounded-lg flex items-center justify-center flex-shrink-0`}>
              <StockIcon className={`h-6 w-6 text-${stockConfig.trend === 'critical' ? 'red' : 'amber'}-600`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${stockConfig.text} mb-2 flex items-center space-x-2`}>
                <span>{stockConfig.status}</span>
                <div className={`w-2 h-2 bg-${stockConfig.trend === 'critical' ? 'red' : 'amber'}-600 rounded-full animate-pulse`}></div>
              </h3>
              <p className={`${stockConfig.text} mb-4`}>
                {stockConfig.description}. Aktueller Bestand: {part.stockQuantity} Stück.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className={`inline-flex items-center space-x-2 px-4 py-2 bg-${stockConfig.trend === 'critical' ? 'red' : 'amber'}-600 text-white font-medium rounded-lg hover:bg-${stockConfig.trend === 'critical' ? 'red' : 'amber'}-700 transition-colors`}>
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
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Grunddaten</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <InfoField label="Teilenummer" value={part.partNumber} icon={TagIcon} />
                <InfoField label="Kategorie" value={categoryConfig.label} icon={CubeIcon} />
                <InfoField label="Stückpreis" value={`${part.price.toFixed(2)} €`} icon={BanknotesIcon} />
              </div>
              <div className="space-y-4">
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
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Beschreibung</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{part.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 bg-${stockConfig.trend === 'critical' ? 'red' : stockConfig.trend === 'warning' ? 'amber' : 'green'}-50 rounded-lg flex items-center justify-center`}>
                <StockIcon className={`h-5 w-5 text-${stockConfig.trend === 'critical' ? 'red' : stockConfig.trend === 'warning' ? 'amber' : 'green'}-600`} />
              </div>
              <h3 className="font-semibold text-gray-900">Lager-Status</h3>
            </div>
            
            <div className="text-center mb-6">
              <div className={`text-3xl font-bold mb-2 ${stockConfig.text}`}>
                {part.stockQuantity}
              </div>
              <div className="text-gray-600 text-sm mb-3">
                {part.stockQuantity === 1 ? 'Stück verfügbar' : 'Stück verfügbar'}
              </div>
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${stockConfig.bg} ${stockConfig.text} ${stockConfig.border}`}>
                <StockIcon className="h-4 w-4 mr-2" />
                {stockConfig.status}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Optimaler Bestand:</span>
                <span className="font-medium text-gray-900">10 Stück</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mindestbestand:</span>
                <span className="font-medium text-gray-900">3 Stück</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lieferzeit:</span>
                <span className="font-medium text-gray-900">5-7 Tage</span>
              </div>
            </div>

            {part.stockQuantity <= 5 && (
              <button className={`w-full bg-${stockConfig.trend === 'critical' ? 'red' : 'amber'}-600 text-white px-4 py-3 text-sm font-medium rounded-lg hover:bg-${stockConfig.trend === 'critical' ? 'red' : 'amber'}-700 transition-colors`}>
                <div className="flex items-center justify-center space-x-2">
                  <ShoppingCartIcon className="h-4 w-4" />
                  <span>Nachbestellen</span>
                </div>
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Schnellaktionen</h3>
            <div className="space-y-3">
              <QuickAction
                icon={CubeIcon}
                title="Kompatible Maschinen"
                description="Anzeigen"
                color="blue"
              />
              <QuickAction
                icon={ClockIcon}
                title="Verwendungshistorie"
                description="Verlauf ansehen"
                color="purple"
              />
              <QuickAction
                icon={ChartBarIcon}
                title="Preishistorie"
                description="Trends analysieren"
                color="green"
              />
              <QuickAction
                icon={DocumentTextIcon}
                title="Wartungsplan"
                description="Intervalle prüfen"
                color="amber"
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
    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
      <Icon className="h-4 w-4 text-gray-600" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`font-medium mt-1 ${empty ? 'text-gray-400 italic' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  </div>
);

// Quick Action Component
const QuickAction = ({ icon: Icon, title, description, color }: {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  title: string;
  description: string;
  color: string;
}) => (
  <button className="w-full group">
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-10 h-10 bg-${color}-50 rounded-lg flex items-center justify-center group-hover:bg-${color}-100 transition-colors`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium text-gray-900 text-sm group-hover:text-gray-700">{title}</div>
        <div className="text-xs text-gray-500 group-hover:text-gray-400">{description}</div>
      </div>
    </div>
  </button>
);

export default MaintenancePartDetail;