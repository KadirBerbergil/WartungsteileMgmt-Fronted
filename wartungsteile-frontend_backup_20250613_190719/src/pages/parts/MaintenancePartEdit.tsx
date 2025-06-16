// src/pages/parts/MaintenancePartEdit.tsx - Clean Professional Design
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
  { value: 'WearPart' as const, label: 'Verschleißteil', icon: '⚡' },
  { value: 'SparePart' as const, label: 'Ersatzteil', icon: '🔧' },
  { value: 'ConsumablePart' as const, label: 'Verbrauchsmaterial', icon: '📦' },
  { value: 'ToolPart' as const, label: 'Werkzeug', icon: '🛠️' }
];

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-3">Wartungsteil nicht gefunden</h3>
          <p className="text-gray-600 mb-6">
            {error instanceof Error ? error.message : 'Das Wartungsteil konnte nicht geladen werden.'}
          </p>
        </div>
      </div>
    );
  }

  const isFormValid = Boolean(formData.name.trim() && formData.price > 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to={`/parts/${id}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Zurück zu Details</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <PencilIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wartungsteil bearbeiten</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-gray-600 font-medium break-words">{part.partNumber}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 break-words">{part.name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to={`/parts/${id}`}
            className="px-4 py-2 text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-colors"
          >
            Abbrechen
          </Link>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
            className="px-4 py-2 text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Zurücksetzen
          </button>
          
          <button
            type="submit"
            form="edit-part-form"
            disabled={isSaving || !isFormValid}
            className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
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
      </div>

      {/* Change Notification */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Ungespeicherte Änderungen</h3>
              <p className="text-amber-800 text-sm">Sie haben Änderungen vorgenommen, die noch nicht gespeichert wurden.</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="h-4 w-4 text-gray-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Grunddaten bearbeiten</h2>
        </div>
        
        <form id="edit-part-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only Part Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Teilenummer <span className="text-gray-400 font-normal">(nicht änderbar)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <TagIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={part.partNumber}
                disabled
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Category */}
          <InputField
            label="Kategorie *"
            name="category"
            type="select"
            value={formData.category}
            onChange={handleInputChange}
            options={CATEGORY_OPTIONS}
            originalValue={originalData.category}
            required
          />

          {/* Name */}
          <InputField
            label="Bezeichnung *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            icon={CubeIcon}
            originalValue={originalData.name}
            required
          />

          {/* Price & Stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputField
              label="Stückpreis (€) *"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
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
            onChange={handleInputChange}
            placeholder="z.B. Bosch, Siemens, Festo"
            icon={BuildingOffice2Icon}
            originalValue={originalData.manufacturer}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Beschreibung</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Detailbeschreibung des Wartungsteils..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors hover:border-gray-300"
            />
            {formData.description !== originalData.description && (
              <div className="text-xs text-blue-600 mt-2">
                Geändert von: "{originalData.description || 'Leer'}"
              </div>
            )}
          </div>
        </form>

        {/* Error Display */}
        {(saveError || validationErrors.length > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
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
        )}
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <PencilIcon className="h-4 w-4 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Aktuelle Werte</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Part Number */}
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Teilenummer</div>
              <div className="text-base font-semibold text-gray-800 break-words">{part.partNumber}</div>
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
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Kategorie</div>
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                <span className="mr-2">
                  {CATEGORY_OPTIONS.find(opt => opt.value === formData.category)?.icon}
                </span>
                {CATEGORY_OPTIONS.find(opt => opt.value === formData.category)?.label}
              </span>
              {formData.category !== originalData.category && (
                <div className="text-xs text-blue-600 mt-2">
                  Geändert von: {CATEGORY_OPTIONS.find(opt => opt.value === originalData.category)?.label}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Price */}
            <PreviewField
              label="Stückpreis"
              value={`${formData.price.toFixed(2)} €`}
              originalValue={`${originalData.price.toFixed(2)} €`}
              className="text-xl font-bold text-emerald-600"
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
        </div>

        {/* Status */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges ? (
              <>
                <div className="w-8 h-8 bg-amber-100 flex items-center justify-center rounded-lg">
                  <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-amber-700">Ungespeicherte Änderungen</span>
                  <div className="text-xs text-gray-500 mt-1">Vergessen Sie nicht zu speichern</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-emerald-100 flex items-center justify-center rounded-lg">
                  <CheckIcon className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-emerald-700">Alle Änderungen gespeichert</span>
                  <div className="text-xs text-gray-500 mt-1">Daten sind aktuell</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
    {type === 'select' && options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
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
            <Icon className="h-5 w-5 text-gray-400" />
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
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300`}
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

// Preview Field Helper
const PreviewField = ({ label, value, originalValue, className }: {
  label: string;
  value: string;
  originalValue: string;
  className?: string;
}) => (
  <div>
    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</div>
    <div className={`text-gray-800 break-words ${className || ''}`}>
      {value || <span className="text-gray-400 italic font-normal">Leer</span>}
    </div>
    {value !== originalValue && (
      <div className="text-xs text-blue-600 mt-1">Geändert von: {originalValue || 'Leer'}</div>
    )}
  </div>
);

export default MaintenancePartEdit;