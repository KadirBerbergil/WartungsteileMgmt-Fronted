// src/pages/parts/MaintenancePartCreate.tsx - Premium Business Design
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { maintenancePartService } from '../../services';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CubeIcon,
  EyeIcon,
  SparklesIcon,
  DocumentTextIcon,
  TagIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface FormData {
  partNumber: string;
  name: string;
  description: string;
  category: 'WearPart' | 'SparePart' | 'ConsumablePart' | 'ToolPart';
  price: number;
  manufacturer: string;
  stockQuantity: number;
}

const CATEGORY_OPTIONS = [
  { value: 'WearPart' as const, label: 'Verschleißteil', icon: '⚡', gradient: 'from-red-500 to-red-600', color: 'text-red-600' },
  { value: 'SparePart' as const, label: 'Ersatzteil', icon: '🔧', gradient: 'from-blue-500 to-blue-600', color: 'text-blue-600' },
  { value: 'ConsumablePart' as const, label: 'Verbrauchsmaterial', icon: '📦', gradient: 'from-amber-500 to-amber-600', color: 'text-amber-600' },
  { value: 'ToolPart' as const, label: 'Werkzeug', icon: '🛠️', gradient: 'from-emerald-500 to-emerald-600', color: 'text-emerald-600' }
];

type CategoryOption = typeof CATEGORY_OPTIONS[number];

const MaintenancePartCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FormData>({
    partNumber: '',
    name: '',
    description: '',
    category: 'WearPart',
    price: 0,
    manufacturer: '',
    stockQuantity: 0
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stockQuantity' ? 
        (value === '' ? 0 : parseFloat(value)) : value
    }));
    
    if (saveError) setSaveError(null);
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.partNumber.trim()) errors.push('Teilenummer ist erforderlich');
    if (!formData.name.trim()) errors.push('Name ist erforderlich');
    if (formData.price <= 0) errors.push('Preis muss größer als 0 sein');
    if (formData.stockQuantity < 0) errors.push('Lagerbestand kann nicht negativ sein');
    if (formData.partNumber && !formData.partNumber.match(/^[A-Z0-9-\s]+$/i)) {
      errors.push('Teilenummer darf nur Buchstaben, Zahlen, Bindestriche und Leerzeichen enthalten');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSaving(true);
    setSaveError(null);

    try {
      const createData = {
        partNumber: formData.partNumber.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        price: formData.price,
        manufacturer: formData.manufacturer.trim() || undefined,
        stockQuantity: formData.stockQuantity
      };

      const newPartId = await maintenancePartService.create(createData);
      queryClient.invalidateQueries({ queryKey: ['maintenanceParts'] });
      
      navigate(`/parts/${newPartId}`, { 
        replace: true,
        state: { message: 'Wartungsteil erfolgreich erstellt!' }
      });
      
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 400) {
        if (error.response.data?.errors) {
          setValidationErrors(error.response.data.errors);
        } else {
          setSaveError('Ungültige Eingabedaten. Bitte prüfen Sie Ihre Eingaben.');
        }
      } else if (status === 409) {
        setSaveError('Ein Wartungsteil mit dieser Teilenummer existiert bereits.');
      } else if (status >= 500) {
        setSaveError('Serverfehler. Bitte versuchen Sie es später erneut.');
      } else {
        setSaveError('Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      partNumber: '',
      name: '',
      description: '',
      category: 'WearPart',
      price: 0,
      manufacturer: '',
      stockQuantity: 0
    });
    setSaveError(null);
    setValidationErrors([]);
  };

  const isFormValid = Boolean(formData.partNumber.trim() && formData.name.trim() && formData.price > 0);
  const selectedCategoryConfig = CATEGORY_OPTIONS.find(opt => opt.value === formData.category);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Premium Header */}
        <Header />
        
        {/* Action Buttons */}
        <ActionButtons 
          onReset={handleReset}
          isSaving={isSaving}
          isFormValid={isFormValid}
        />

        {/* Info Banner */}
        <InfoBanner />

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Form */}
          <div className="xl:col-span-3">
            <form id="create-part-form" onSubmit={handleSubmit}>
              <FormFields 
                formData={formData}
                onChange={handleInputChange}
              />
              <ErrorDisplay 
                saveError={saveError}
                validationErrors={validationErrors}
              />
            </form>
          </div>

          {/* Live Preview */}
          <div className="xl:col-span-1">
            <LivePreview 
              formData={formData}
              isFormValid={isFormValid}
              selectedCategoryConfig={selectedCategoryConfig}
            />
          </div>
        </div>

        {/* Mobile Actions */}
        <MobileActions 
          isSaving={isSaving}
          isFormValid={isFormValid}
        />
      </div>
    </div>
  );
};

// Header Component
const Header = () => (
  <div className="mb-8">
    <div className="flex items-center space-x-4 mb-6">
      <Link 
        to="/parts"
        className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Zurück zur Liste</span>
      </Link>
    </div>
    
    <div className="flex items-center space-x-6">
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
        <PlusIcon className="h-8 w-8 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
          Neues Wartungsteil
        </h1>
        <p className="text-slate-600 font-medium mt-2">Ersatz- & Verschleißteile hinzufügen</p>
        <div className="flex items-center space-x-4 mt-3 text-sm">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-4 w-4 text-emerald-500" />
            <span className="text-slate-600">Intelligente Validierung</span>
          </div>
          <div className="flex items-center space-x-2">
            <DocumentTextIcon className="h-4 w-4 text-blue-500" />
            <span className="text-slate-600">Auto-Vervollständigung</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Action Buttons Component
const ActionButtons = ({ onReset, isSaving, isFormValid }: {
  onReset: () => void;
  isSaving: boolean;
  isFormValid: boolean;
}) => (
  <div className="hidden xl:flex items-center justify-end space-x-3 mb-8">
    <Link
      to="/parts"
      className="px-6 py-2.5 text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-200"
    >
      Abbrechen
    </Link>
    
    <button
      type="button"
      onClick={onReset}
      className="px-6 py-2.5 text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-200"
    >
      Zurücksetzen
    </button>
    
    <button
      type="submit"
      form="create-part-form"
      disabled={isSaving || !isFormValid}
      className="inline-flex items-center px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 disabled:cursor-not-allowed"
    >
      {isSaving ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Wird erstellt...
        </>
      ) : (
        <>
          <CheckIcon className="h-4 w-4 mr-2" />
          Wartungsteil erstellen
        </>
      )}
    </button>
  </div>
);

// Info Banner Component
const InfoBanner = () => (
  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/60 rounded-2xl p-6 mb-8 shadow-sm">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
        <InformationCircleIcon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-blue-900 mb-1">Intelligentes Erfassungssystem</h3>
        <p className="text-blue-800 text-sm">
          Alle Pflichtfelder (*) werden validiert. Das System unterstützt Sie mit Vorschlägen und Formatierungshilfen.
        </p>
      </div>
    </div>
  </div>
);

// Form Fields Component
const FormFields = ({ formData, onChange }: {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) => (
  <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-slate-50/50 to-transparent px-8 py-6 border-b border-slate-200/60">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/25">
          <DocumentTextIcon className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Grunddaten erfassen</h2>
      </div>
    </div>
    
    <div className="p-8 space-y-8">
      {/* Row 1: Part Number & Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InputField
          label="Teilenummer *"
          name="partNumber"
          value={formData.partNumber}
          onChange={onChange}
          placeholder="z.B. DDR5$ oder A-12345"
          icon={TagIcon}
          required
        />
        <CategorySelectField
          label="Kategorie *"
          name="category"
          value={formData.category}
          onChange={onChange}
          options={CATEGORY_OPTIONS}
          required
        />
      </div>

      {/* Row 2: Name */}
      <InputField
        label="Bezeichnung *"
        name="name"
        value={formData.name}
        onChange={onChange}
        placeholder="z.B. Hydraulikzylinder"
        icon={CubeIcon}
        required
      />

      {/* Row 3: Price & Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InputField
          label="Stückpreis (€) *"
          name="price"
          type="number"
          value={formData.price}
          onChange={onChange}
          step="0.01"
          min="0.01"
          icon={BanknotesIcon}
          required
        />
        <InputField
          label="Anfangsbestand (Stück) *"
          name="stockQuantity"
          type="number"
          value={formData.stockQuantity}
          onChange={onChange}
          min="0"
          icon={CubeIcon}
          required
        />
      </div>

      {/* Row 4: Manufacturer */}
      <InputField
        label="Hersteller"
        name="manufacturer"
        value={formData.manufacturer}
        onChange={onChange}
        placeholder="z.B. Bosch, Siemens, Festo"
        icon={BuildingOffice2Icon}
      />

      {/* Row 5: Description */}
      <TextAreaField
        label="Detailbeschreibung"
        name="description"
        value={formData.description}
        onChange={onChange}
        placeholder="Ausführliche Beschreibung des Wartungsteils, Einsatzbereich, technische Details..."
        rows={4}
      />
    </div>
  </div>
);

// Reusable Input Field with Icon
const InputField = ({ label, name, value, onChange, type = "text", placeholder, required, step, min, icon: Icon }: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
}) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-3">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        step={step}
        min={min}
        className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white transition-all duration-200 hover:border-slate-300/60"
      />
    </div>
  </div>
);

// Category Select Field
const CategorySelectField = ({ label, name, value, onChange, options, required }: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: typeof CATEGORY_OPTIONS;
  required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-3">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white transition-all duration-200 hover:border-slate-300/60"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.icon} {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Reusable TextArea Field
const TextAreaField = ({ label, name, value, onChange, placeholder, rows }: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
}) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-3">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white resize-none transition-all duration-200 hover:border-slate-300/60"
    />
  </div>
);

// Error Display Component
const ErrorDisplay = ({ saveError, validationErrors }: {
  saveError: string | null;
  validationErrors: string[];
}) => {
  if (!saveError && validationErrors.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 via-red-50 to-pink-50 border border-red-200/60 rounded-2xl p-6 mt-8 shadow-sm">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25 flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          {saveError && (
            <p className="text-red-800 font-semibold mb-3">{saveError}</p>
          )}
          {validationErrors.length > 0 && (
            <div>
              <p className="text-red-800 font-semibold mb-3">Bitte korrigieren Sie folgende Fehler:</p>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Live Preview Component
const LivePreview = ({ formData, isFormValid, selectedCategoryConfig }: {
  formData: FormData;
  isFormValid: boolean;
  selectedCategoryConfig: CategoryOption | undefined;
}) => (
  <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm xl:sticky xl:top-8">
    <div className="bg-gradient-to-r from-slate-50/50 to-transparent px-6 py-4 border-b border-slate-200/60">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25">
          <EyeIcon className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Live-Vorschau</h3>
      </div>
    </div>
    
    <div className="p-6 space-y-6">
      <PreviewField 
        label="Teilenummer"
        value={formData.partNumber}
        className="text-lg font-semibold"
      />
      <PreviewField 
        label="Bezeichnung"
        value={formData.name}
        className="text-lg font-medium"
      />
      <div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Kategorie</div>
        {selectedCategoryConfig && (
          <span className={`inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gradient-to-r ${selectedCategoryConfig.gradient} text-white rounded-full shadow-sm`}>
            <span className="mr-2">{selectedCategoryConfig.icon}</span>
            {selectedCategoryConfig.label}
          </span>
        )}
      </div>
      <div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Stückpreis</div>
        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          {formData.price.toFixed(2)} €
        </div>
      </div>
      <PreviewField 
        label="Anfangsbestand"
        value={`${formData.stockQuantity} Stück`}
        className="text-lg font-medium"
      />
      {formData.manufacturer && (
        <PreviewField 
          label="Hersteller"
          value={formData.manufacturer}
          className="text-lg font-medium"
        />
      )}
      
      {formData.description && (
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Beschreibung</div>
          <div className="text-sm text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-200/60">
            {formData.description.length > 100 
              ? `${formData.description.substring(0, 100)}...` 
              : formData.description}
          </div>
        </div>
      )}
    </div>

    <div className="px-6 pb-6">
      <div className="pt-4 border-t border-slate-200/60">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
            isFormValid 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'bg-amber-100 text-amber-600'
          }`}>
            {isFormValid ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4" />
            )}
          </div>
          <div>
            <span className={`text-sm font-semibold ${
              isFormValid ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {isFormValid ? 'Bereit zum Erstellen' : 'Pflichtfelder fehlen'}
            </span>
            <div className="text-xs text-slate-500 mt-1">
              {isFormValid ? 'Alle Validierungen erfolgreich' : 'Bitte vervollständigen Sie das Formular'}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Preview Field Helper
const PreviewField = ({ label, value, className }: {
  label: string;
  value: string | number;
  className?: string;
}) => (
  <div>
    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{label}</div>
    <div className={`text-slate-800 break-words ${className || ''}`}>
      {value || <span className="text-slate-400 italic font-normal">Noch nicht eingegeben</span>}
    </div>
  </div>
);

// Mobile Actions Component
const MobileActions = ({ isSaving, isFormValid }: {
  isSaving: boolean;
  isFormValid: boolean;
}) => (
  <>
    <div className="xl:hidden fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-sm border-t border-slate-200/60 shadow-2xl">
      <div className="flex gap-4 max-w-md mx-auto">
        <Link
          to="/parts"
          className="flex-1 px-4 py-3 text-center text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 rounded-xl transition-all duration-200"
        >
          Abbrechen
        </Link>
        <button
          type="submit"
          form="create-part-form"
          disabled={isSaving || !isFormValid}
          className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Erstellen...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              Erstellen
            </>
          )}
        </button>
      </div>
    </div>
    <div className="xl:hidden h-24"></div>
  </>
);

export default MaintenancePartCreate;