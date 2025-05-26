// src/pages/parts/MaintenancePartDetail.tsx - Premium Business Design
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
  SparklesIcon,
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
        gradient: 'from-red-500 to-red-600',
        shadow: 'shadow-red-500/25',
        icon: BoltIcon
      },
      'SparePart': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Ersatzteil',
        gradient: 'from-blue-500 to-blue-600',
        shadow: 'shadow-blue-500/25',
        icon: CubeIcon
      },
      'ConsumablePart': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Verbrauchsmaterial',
        gradient: 'from-amber-500 to-amber-600',
        shadow: 'shadow-amber-500/25',
        icon: SparklesIcon
      },
      'ToolPart': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Werkzeug',
        gradient: 'from-emerald-500 to-emerald-600',
        shadow: 'shadow-emerald-500/25',
        icon: CubeIcon
      }
    };

    return configs[category as keyof typeof configs] || {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: category,
      gradient: 'from-slate-500 to-slate-600',
      shadow: 'shadow-slate-500/25',
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
        description: 'Sofortige Nachbestellung erforderlich',
        gradient: 'from-red-500 to-red-600',
        shadow: 'shadow-red-500/25'
      };
    } else if (quantity <= 3) {
      return {
        status: 'Niedriger Bestand',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: ExclamationTriangleIcon,
        trend: 'warning',
        description: 'Bald nachbestellen',
        gradient: 'from-amber-500 to-amber-600',
        shadow: 'shadow-amber-500/25'
      };
    } else {
      return {
        status: 'Gut verfügbar',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircleIcon,
        trend: 'good',
        description: 'Ausreichend vorrätig',
        gradient: 'from-emerald-500 to-emerald-600',
        shadow: 'shadow-emerald-500/25'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <Link to="/parts" className="text-blue-600 hover:text-blue-700">
              ← Zurück zur Liste
            </Link>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Wartungsteil wird geladen</h3>
            <p className="text-slate-600">Details werden zusammengestellt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <Link to="/parts" className="text-blue-600 hover:text-blue-700">
              ← Zurück zur Liste
            </Link>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-red-200/60 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">Fehler beim Laden</h3>
            <p className="text-slate-600 text-sm mt-2">
              {error instanceof Error ? error.message : 'Unbekannter Fehler'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <Link to="/parts" className="text-blue-600 hover:text-blue-700">
              ← Zurück zur Liste
            </Link>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800">Wartungsteil nicht gefunden</h3>
            <p className="text-slate-600">Das angeforderte Teil existiert nicht.</p>
          </div>
        </div>
      </div>
    );
  }

  const categoryConfig = getCategoryConfig(part.category);
  const stockConfig = getStockConfig(part.stockQuantity);
  const CategoryIcon = categoryConfig.icon;
  const StockIcon = stockConfig.icon;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/parts" 
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Zurück zur Liste</span>
              </Link>
              <div className="h-6 w-px bg-slate-300"></div>
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${categoryConfig.gradient} rounded-2xl flex items-center justify-center shadow-lg ${categoryConfig.shadow}`}>
                  <CategoryIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                    {part.name}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-slate-600 font-medium">{part.partNumber}</span>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${categoryConfig.bg} ${categoryConfig.text} ${categoryConfig.border} text-sm font-medium`}>
                      <div className={`w-2 h-2 rounded-full ${categoryConfig.text.replace('text-', 'bg-')} mr-2`}></div>
                      {categoryConfig.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Link 
              to={`/parts/${part.id}/edit`}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Bearbeiten</span>
            </Link>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <BanknotesIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-blue-600">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">Stabil</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{part.price.toFixed(2)}€</div>
            <div className="text-slate-600 text-sm font-medium">Stückpreis</div>
            <div className="text-slate-500 text-xs mt-1">Inkl. Beschaffung</div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stockConfig.gradient} rounded-xl flex items-center justify-center shadow-lg ${stockConfig.shadow}`}>
                <StockIcon className="h-6 w-6 text-white" />
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
            <div className="text-slate-600 text-sm font-medium">Lagerbestand</div>
            <div className="text-slate-500 text-xs mt-1">{part.stockQuantity === 1 ? 'Stück verfügbar' : 'Stück verfügbar'}</div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-purple-600">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span className="text-xs font-semibold">+12%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">{(part.price * part.stockQuantity).toFixed(2)}€</div>
            <div className="text-slate-600 text-sm font-medium">Lagerwert</div>
            <div className="text-slate-500 text-xs mt-1">{part.stockQuantity} × {part.price.toFixed(2)}€</div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-1 text-indigo-600">
                <span className="text-xs font-semibold">Aktiv</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-600 mb-1">24/7</div>
            <div className="text-slate-600 text-sm font-medium">Verfügbarkeit</div>
            <div className="text-slate-500 text-xs mt-1">Sofort einsatzbereit</div>
          </div>
        </div>

        {/* Stock Alert */}
        {part.stockQuantity <= 3 && (
          <div className={`bg-gradient-to-r ${stockConfig.bg} border ${stockConfig.border} rounded-2xl p-6 mb-8 shadow-sm`}>
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stockConfig.gradient} rounded-xl flex items-center justify-center shadow-lg ${stockConfig.shadow} flex-shrink-0`}>
                <StockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${stockConfig.text} mb-3 flex items-center space-x-2`}>
                  <span>{stockConfig.status}</span>
                  <div className={`w-2 h-2 ${stockConfig.text.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
                </h3>
                <p className={`${stockConfig.text} mb-4`}>
                  {stockConfig.description}. Aktueller Bestand: {part.stockQuantity} Stück.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className={`inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r ${stockConfig.gradient} text-white font-medium rounded-xl shadow-lg ${stockConfig.shadow} hover:shadow-opacity-40 transition-all duration-200`}>
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>Jetzt nachbestellen</span>
                  </button>
                  <button className={`inline-flex items-center space-x-2 px-4 py-2.5 bg-white border ${stockConfig.border} ${stockConfig.text} hover:bg-opacity-50 rounded-xl transition-all duration-200`}>
                    <ClockIcon className="h-4 w-4" />
                    <span>Erinnerung setzen</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Data */}
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/25">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Grunddaten</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <InfoField label="Teilenummer" value={part.partNumber} icon={TagIcon} />
                  <InfoField label="Kategorie" value={categoryConfig.label} icon={CategoryIcon} />
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
              <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-800">Beschreibung</h2>
                </div>
                <div className="bg-slate-50/50 rounded-xl p-6">
                  <p className="text-slate-700 leading-relaxed">{part.description}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stock Overview */}
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`w-10 h-10 bg-gradient-to-br ${stockConfig.gradient} rounded-xl flex items-center justify-center shadow-lg ${stockConfig.shadow}`}>
                  <StockIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800">Lager-Status</h3>
              </div>
              
              <div className="text-center mb-6">
                <div className={`text-3xl font-bold mb-2 ${stockConfig.text}`}>
                  {part.stockQuantity}
                </div>
                <div className="text-slate-600 text-sm mb-3">
                  {part.stockQuantity === 1 ? 'Stück verfügbar' : 'Stück verfügbar'}
                </div>
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full border ${stockConfig.bg} ${stockConfig.text} ${stockConfig.border} text-sm font-medium`}>
                  <StockIcon className="h-4 w-4 mr-2" />
                  {stockConfig.status}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Optimaler Bestand:</span>
                  <span className="font-semibold text-slate-800">10 Stück</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Mindestbestand:</span>
                  <span className="font-semibold text-slate-800">3 Stück</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Lieferzeit:</span>
                  <span className="font-semibold text-slate-800">5-7 Tage</span>
                </div>
              </div>

              {part.stockQuantity <= 5 && (
                <button className={`w-full bg-gradient-to-r ${stockConfig.gradient} text-white px-4 py-3 text-sm font-medium rounded-xl shadow-lg ${stockConfig.shadow} hover:shadow-opacity-40 transition-all duration-200`}>
                  <div className="flex items-center justify-center space-x-2">
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>Nachbestellen</span>
                  </div>
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-6">Schnellaktionen</h3>
              <div className="space-y-3">
                <QuickAction
                  icon={CubeIcon}
                  title="Kompatible Maschinen"
                  description="Anzeigen"
                  gradient="from-blue-500 to-blue-600"
                />
                <QuickAction
                  icon={ClockIcon}
                  title="Verwendungshistorie"
                  description="Verlauf ansehen"
                  gradient="from-purple-500 to-purple-600"
                />
                <QuickAction
                  icon={ChartBarIcon}
                  title="Preishistorie"
                  description="Trends analysieren"
                  gradient="from-emerald-500 to-emerald-600"
                />
                <QuickAction
                  icon={DocumentTextIcon}
                  title="Wartungsplan"
                  description="Intervalle prüfen"
                  gradient="from-amber-500 to-amber-600"
                />
              </div>
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
  <div className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-lg border border-slate-200/60">
    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="h-4 w-4 text-slate-600" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`font-semibold mt-1 ${empty ? 'text-slate-400 italic' : 'text-slate-800'}`}>
        {value}
      </div>
    </div>
  </div>
);

// Quick Action Component
const QuickAction = ({ icon: Icon, title, description, gradient }: {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  title: string;
  description: string;
  gradient: string;
}) => (
  <button className="w-full group">
    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50/50 transition-all duration-200">
      <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium text-slate-800 text-sm group-hover:text-slate-900">{title}</div>
        <div className="text-xs text-slate-500 group-hover:text-slate-600">{description}</div>
      </div>
    </div>
  </button>
);

export default MaintenancePartDetail;