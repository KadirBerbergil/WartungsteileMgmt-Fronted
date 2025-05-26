// src/pages/parts/MaintenancePartEdit.tsx - Premium Business Design
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMaintenancePartDetail } from '../../hooks/useParts';
import { maintenancePartService } from '../../services';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  DocumentTextIcon,
  TagIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface FormData {
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

const MaintenancePartEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: part, isLoading, error } = useMaintenancePartDetail(id || '');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: 'WearPart',
    price: 0,
    manufacturer: '',
    stockQuantity: 0
  });
  
  const [originalData, setOriginalData] = useState<FormData>(formData);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (part) {
      const data: FormData = {
        name: part.name,
        description: part.description || '',
        category: part.category as 'WearPart' | 'SparePart' | 'ConsumablePart' | 'ToolPart',
        price: part.price,
        manufacturer: part.manufacturer || '',
        stockQuantity: part.stockQuantity
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [part]);

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

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
    
    if (!formData.name.trim()) {
      errors.push('Name ist erforderlich');
    }
    
    if (formData.price <= 0) {
      errors.push('Preis muss größer als 0 sein');
    }
    
    if (formData.stockQuantity < 0) {
      errors.push('Lagerbestand kann nicht negativ sein');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!part || !id) return;
    
    if (!validateForm()) {
      return;
    }
    
    if (!hasUnsavedChanges) {
      navigate(`/parts/${id}`);
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);

    try {
      const updateData = {
        id: id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        price: formData.price,
        manufacturer: formData.manufacturer.trim() || undefined,
        stockQuantity: formData.stockQuantity
      };

      const success = await maintenancePartService.update(id, updateData);
      
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['maintenanceParts'] });
        queryClient.invalidateQueries({ queryKey: ['maintenancePart', id] });
        
        navigate(`/parts/${id}`, { 
          replace: true,
          state: { message: 'Wartungsteil erfolgreich aktualisiert!' }
        });
      } else {
        setSaveError('Unerwarteter Fehler beim Aktualisieren');
      }
      
    } catch (error: any) {
      if (error.response?.status === 400) {
        if (error.response.data?.errors) {
          setValidationErrors(error.response.data.errors);
        } else {
          setSaveError('Ungültige Eingabedaten. Bitte prüfen Sie Ihre Eingaben.');
        }
      } else if (error.response?.status === 404) {
        setSaveError('Wartungsteil nicht gefunden. Möglicherweise wurde es bereits gelöscht.');
      } else if (error.response?.status === 409) {
        setSaveError('Konflikt beim Speichern. Möglicherweise wurde das Teil von jemand anderem geändert.');
      } else if (error.response?.status >= 500) {
        setSaveError('Serverfehler. Bitte versuchen Sie es später erneut.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setSaveError('Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.');
      } else {
        setSaveError(`Fehler beim Aktualisieren: ${error.response?.data || error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (part) {
      const data: FormData = {
        name: part.name,
        description: part.description || '',
        category: part.category as 'WearPart' | 'SparePart' | 'ConsumablePart' | 'ToolPart',
        price: part.price,
        manufacturer: part.manufacturer || '',
        stockQuantity: part.stockQuantity
      };
      setFormData(data);
      setSaveError(null);
      setValidationErrors([]);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/25">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Wartungsteil wird geladen</h3>
            <p className="text-slate-600">Daten werden für die Bearbeitung vorbereitet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !part) {
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
            <h3 className="text-xl font-semibold text-red-600 mb-3">Wartungsteil nicht gefunden</h3>
            <p className="text-slate-600 mb-6">
              {error instanceof Error ? error.message : 'Das Wartungsteil konnte nicht geladen werden.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = Boolean(formData.name.trim() && formData.price > 0);
  const selectedCategoryConfig = CATEGORY_OPTIONS.find(opt => opt.value === formData.category);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Premium Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link 
              to={`/parts/${id}`}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors font-medium w-fit"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Zurück zu Details</span>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-slate-300"></div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
                <PencilIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                  Wartungsteil bearbeiten
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-slate-600 font-medium break-words">{part.partNumber}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 break-words">{part.name}</span>
                </div>
              </div>
            </div>
          </div>

          <ActionButtons 
            hasUnsavedChanges={hasUnsavedChanges}
            handleReset={handleReset}
            isSaving={isSaving}
            isFormValid={isFormValid}
            partId={id || ''}
          />
        </div>

        {/* Change Notification */}
        {hasUnsavedChanges && (
          <div className="bg-gradient-to-r from-amber-50 via-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <ExclamationTriangleIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Ungespeicherte Änderungen</h3>
                <p className="text-amber-800 text-sm">Sie haben Änderungen vorgenommen, die noch nicht gespeichert wurden.</p>
              </div>
            </div>
          </div>
        )}

        {/* Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Form */}
          <div className="xl:col-span-3">
            <form id="edit-part-form" onSubmit={handleSubmit}>
              <FormFields 
                part={part}
                formData={formData}
                originalData={originalData}
                onChange={handleInputChange}
              />
              <ErrorDisplay 
                saveError={saveError}
                validationErrors={validationErrors}
              />
            </form>
          </div>

          {/* Live Preview Sidebar */}
          <div className="xl:col-span-1">
            <LivePreview 
              part={part}
              formData={formData}
              originalData={originalData}
              hasUnsavedChanges={hasUnsavedChanges}
              selectedCategoryConfig={selectedCategoryConfig}
            />
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <MobileActions 
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          isFormValid={isFormValid}
          partId={id || ''}
        />
      </div>
    </div>
  );
};

// Action Buttons Component
const ActionButtons = ({ hasUnsavedChanges, handleReset, isSaving, isFormValid, partId }: {
  hasUnsavedChanges: boolean;
  handleReset: () => void;
  isSaving: boolean;
  isFormValid: boolean;
  partId: string;
}) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3">
    <Link
      to={`/parts/${partId}`}
      className="px-6 py-2.5 text-center text-slate-700 font-medium hover:text-slate-900 transition-colors border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl"
    >
      Abbrechen
    </Link>
    
    <button
      type="button"
      onClick={handleReset}
      disabled={!hasUnsavedChanges}
      className="px-6 py-2.5 text-slate-700 font-medium hover:text-slate-900 transition-colors border border-slate-200 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
    >
      Zurücksetzen
    </button>
    
    <button
      type="submit"
      form="edit-part-form"
      disabled={isSaving || !isFormValid}
      className="inline-flex items-center justify-center px-8 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:cursor-not-allowed"
    >
      {isSaving ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Wird gespeichert...
        </>
      ) : (
        <>
          <CheckIcon className="h-4 w-4 mr-2" />
          {hasUnsavedChanges ? 'Änderungen speichern' : 'Keine Änderungen'}
        </>
      )}
    </button>
  </div>
);

// Form Fields Component
const FormFields = ({ part, formData, originalData, onChange }: {
  part: any;
  formData: FormData;
  originalData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) => (
  <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
    <div className="bg-gradient-to-r from-slate-50/50 to-transparent px-8 py-6 border-b border-slate-200/60">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/25">
          <DocumentTextIcon className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Grunddaten bearbeiten</h2>
      </div>
    </div>
    
    <div className="p-8 space-y-8">
      {/* Read-only Part Number */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Teilenummer <span className="text-slate-400 font-normal">(nicht änderbar)</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <TagIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={part.partNumber}
            disabled
            className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Category */}
      <InputField
        label="Kategorie *"
        name="category"
        type="select"
        value={formData.category}
        onChange={onChange}
        options={CATEGORY_OPTIONS}
        originalValue={originalData.category}
        required
      />

      {/* Name */}
      <InputField
        label="Bezeichnung *"
        name="name"
        value={formData.name}
        onChange={onChange}
        icon={CubeIcon}
        originalValue={originalData.name}
        required
      />

      {/* Price & Stock */}
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
          originalValue={originalData.price}
          required
        />
        <InputField
          label="Lagerbestand (Stück) *"
          name="stockQuantity"
          type="number"
          value={formData.stockQuantity}
          onChange={onChange}
          min="0"
          icon={CubeIcon}
          originalValue={originalData.stockQuantity}
          required
        />
      </div>

      {/* Manufacturer */}
      <InputField
        label="Hersteller"
        name="manufacturer"
        value={formData.manufacturer}
        onChange={onChange}
        placeholder="z.B. Bosch, Siemens, Festo"
        icon={BuildingOffice2Icon}
        originalValue={originalData.manufacturer}
      />

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Beschreibung</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={4}
          placeholder="Detailbeschreibung des Wartungsteils..."
          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white resize-none transition-all duration-200 hover:border-slate-300/60"
        />
        {formData.description !== originalData.description && (
          <div className="text-xs text-blue-600 mt-2">
            Geändert von: "{originalData.description || 'Leer'}"
          </div>
        )}
      </div>
    </div>
  </div>
);

// Input Field Component
const InputField = ({ 
  label, name, type = 'text', value, onChange, placeholder, step, min, icon: Icon, 
  originalValue, required, options 
}: {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  step?: string;
  min?: string;
  icon?: React.ComponentType<React.ComponentProps<'svg'>>;
  originalValue: string | number;
  required?: boolean;
  options?: typeof CATEGORY_OPTIONS;
}) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-3">{label}</label>
    {type === 'select' && options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-slate-300/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
    ) : (
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          step={step}
          min={min}
          required={required}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-slate-50/50 border border-slate-200/60 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all duration-200 hover:border-slate-300/60`}
        />
      </div>
    )}
    {value !== originalValue && (
      <div className="text-xs text-blue-600 mt-2">
        Geändert von: {originalValue || 'Leer'}
      </div>
    )}
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
const LivePreview = ({ part, formData, originalData, hasUnsavedChanges, selectedCategoryConfig }: {
  part: any;
  formData: FormData;
  originalData: FormData;
  hasUnsavedChanges: boolean;
  selectedCategoryConfig: CategoryOption | undefined;
}) => (
  <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm xl:sticky xl:top-8">
    <div className="bg-gradient-to-r from-slate-50/50 to-transparent px-6 py-4 border-b border-slate-200/60">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/25">
          <PencilIcon className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Aktuelle Werte</h3>
      </div>
    </div>
    
    <div className="p-6 space-y-6">
      {/* Part Number */}
      <div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Teilenummer</div>
        <div className="text-base font-semibold text-slate-800 break-words">{part.partNumber}</div>
      </div>
      
      {/* Name */}
      <PreviewField
        label="Bezeichnung"
        value={formData.name}
        originalValue={originalData.name}
        className="text-base font-medium"
      />
      
      {/* Category */}
      <div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Kategorie</div>
        {selectedCategoryConfig && (
          <span className={`inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gradient-to-r ${selectedCategoryConfig.gradient} text-white rounded-full shadow-sm`}>
            <span className="mr-2">{selectedCategoryConfig.icon}</span>
            {selectedCategoryConfig.label}
          </span>
        )}
        {formData.category !== originalData.category && (
          <div className="text-xs text-blue-600 mt-2">
            Geändert von: {CATEGORY_OPTIONS.find(opt => opt.value === originalData.category)?.label}
          </div>
        )}
      </div>
      
      {/* Price */}
      <PreviewField
        label="Stückpreis"
        value={`${formData.price.toFixed(2)} €`}
        originalValue={`${originalData.price.toFixed(2)} €`}
        className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
      />
      
      {/* Stock */}
      <PreviewField
        label="Lagerbestand"
        value={`${formData.stockQuantity} Stück`}
        originalValue={`${originalData.stockQuantity} Stück`}
        className="text-base font-medium"
      />
      
      {/* Manufacturer */}
      <PreviewField
        label="Hersteller"
        value={formData.manufacturer || "Nicht angegeben"}
        originalValue={originalData.manufacturer || "Nicht angegeben"}
        className="text-base font-medium"
      />
    </div>

    {/* Status */}
    <div className="px-6 pb-6">
      <div className="pt-4 border-t border-slate-200/60">
        <div className="flex items-center space-x-3">
          {hasUnsavedChanges ? (
            <>
              <div className="w-8 h-8 bg-amber-100 flex items-center justify-center rounded-lg">
                <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-amber-700">Ungespeicherte Änderungen</span>
                <div className="text-xs text-slate-500 mt-1">Vergessen Sie nicht zu speichern</div>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-emerald-100 flex items-center justify-center rounded-lg">
                <CheckIcon className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-sm font-semibold text-emerald-700">Alle Änderungen gespeichert</span>
                <div className="text-xs text-slate-500 mt-1">Daten sind aktuell</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Preview Field Helper
const PreviewField = ({ label, value, originalValue, className }: {
  label: string;
  value: string;
  originalValue: string;
  className?: string;
}) => (
  <div>
    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{label}</div>
    <div className={`text-slate-800 break-words ${className || ''}`}>
      {value || <span className="text-slate-400 italic font-normal">Leer</span>}
    </div>
    {value !== originalValue && (
      <div className="text-xs text-blue-600 mt-1">Geändert von: {originalValue || 'Leer'}</div>
    )}
  </div>
);

// Mobile Actions Component
const MobileActions = ({ hasUnsavedChanges, isSaving, isFormValid, partId }: {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isFormValid: boolean;
  partId: string;
}) => (
  <>
    <div className="xl:hidden fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-sm border-t border-slate-200/60 shadow-2xl">
      <div className="flex gap-4 max-w-md mx-auto">
        <Link
          to={`/parts/${partId}`}
          className="flex-1 px-4 py-3 text-center text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 rounded-xl transition-all duration-200"
        >
          Abbrechen
        </Link>
        <button
          type="submit"
          form="edit-part-form"
          disabled={isSaving || !isFormValid || !hasUnsavedChanges}
          className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Speichern...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              {hasUnsavedChanges ? 'Speichern' : 'Keine Änderungen'}
            </>
          )}
        </button>
      </div>
    </div>
    <div className="xl:hidden h-24"></div>
  </>
);

export default MaintenancePartEdit;