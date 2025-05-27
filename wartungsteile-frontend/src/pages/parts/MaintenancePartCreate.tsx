// src/pages/parts/MaintenancePartCreate.tsx - Clean Professional Design
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
  { value: 'WearPart' as const, label: 'Verschleißteil', icon: '⚡' },
  { value: 'SparePart' as const, label: 'Ersatzteil', icon: '🔧' },
  { value: 'ConsumablePart' as const, label: 'Verbrauchsmaterial', icon: '📦' },
  { value: 'ToolPart' as const, label: 'Werkzeug', icon: '🛠️' }
];

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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link 
              to="/parts"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Zurück zur Liste</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
              <PlusIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Neues Wartungsteil</h1>
              <p className="text-gray-600 mt-1">Ersatz- & Verschleißteile hinzufügen</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/parts"
            className="px-4 py-2 text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-colors"
          >
            Abbrechen
          </Link>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-colors"
          >
            Zurücksetzen
          </button>
          
          <button
            type="submit"
            form="create-part-form"
            disabled={isSaving || !isFormValid}
            className="inline-flex items-center px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
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
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <InformationCircleIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Intelligentes Erfassungssystem</h3>
            <p className="text-blue-800 text-sm">
              Alle Pflichtfelder (*) werden validiert. Das System unterstützt Sie mit Vorschlägen und Formatierungshilfen.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="h-4 w-4 text-gray-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Grunddaten erfassen</h2>
        </div>
        
        <form id="create-part-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Part Number & Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InputField
              label="Teilenummer *"
              name="partNumber"
              value={formData.partNumber}
              onChange={handleInputChange}
              placeholder="z.B. DDR5$ oder A-12345"
              icon={TagIcon}
              required
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Kategorie *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors hover:border-gray-300"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Name */}
          <InputField
            label="Bezeichnung *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="z.B. Hydraulikzylinder"
            icon={CubeIcon}
            required
          />

          {/* Row 3: Price & Stock */}
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
              required
            />
            <InputField
              label="Anfangsbestand (Stück) *"
              name="stockQuantity"
              type="number"
              value={formData.stockQuantity}
              onChange={handleInputChange}
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
            onChange={handleInputChange}
            placeholder="z.B. Bosch, Siemens, Festo"
            icon={BuildingOffice2Icon}
          />

          {/* Row 5: Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Detailbeschreibung</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Ausführliche Beschreibung des Wartungsteils, Einsatzbereich, technische Details..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-colors hover:border-gray-300"
            />
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
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
            <CubeIcon className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Live-Vorschau</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Kategorie</div>
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                <span className="mr-2">
                  {CATEGORY_OPTIONS.find(opt => opt.value === formData.category)?.icon}
                </span>
                {CATEGORY_OPTIONS.find(opt => opt.value === formData.category)?.label}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Stückpreis</div>
              <div className="text-2xl font-bold text-emerald-600">
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
          </div>
        </div>
        
        {formData.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Beschreibung</div>
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {formData.description.length > 100 
                ? `${formData.description.substring(0, 100)}...` 
                : formData.description}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
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
              <div className="text-xs text-gray-500 mt-1">
                {isFormValid ? 'Alle Validierungen erfolgreich' : 'Bitte vervollständigen Sie das Formular'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
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
        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors hover:border-gray-300"
      />
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
    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</div>
    <div className={`text-gray-800 break-words ${className || ''}`}>
      {value || <span className="text-gray-400 italic font-normal">Noch nicht eingegeben</span>}
    </div>
  </div>
);

export default MaintenancePartCreate;