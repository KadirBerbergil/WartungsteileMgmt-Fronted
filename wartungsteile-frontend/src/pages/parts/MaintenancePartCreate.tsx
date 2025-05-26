// src/pages/parts/MaintenancePartCreate.tsx - Professionelle B2B-Version
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { maintenancePartService } from '../../services';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
  EyeIcon
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

const CATEGORY_LABELS = {
  WearPart: 'Verschleißteil',
  SparePart: 'Ersatzteil', 
  ConsumablePart: 'Verbrauchsmaterial',
  ToolPart: 'Werkzeug'
} as const;

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

  const isFormValid = formData.partNumber.trim() !== '' && formData.name.trim() !== '' && formData.price > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
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
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
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
  <div className="mb-6">
    <div className="flex items-center space-x-4 mb-4">
      <Link 
        to="/parts"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Zurück zur Liste</span>
      </Link>
    </div>
    
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-green-600 flex items-center justify-center">
        <PlusIcon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Neues Wartungsteil erstellen</h1>
        <p className="text-gray-600 mt-1">Ersatz- & Verschleißteile hinzufügen</p>
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
  <div className="hidden xl:flex items-center justify-end space-x-3 mb-6">
    <Link
      to="/parts"
      className="px-4 py-2 text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-all"
    >
      Abbrechen
    </Link>
    
    <button
      type="button"
      onClick={onReset}
      className="px-4 py-2 text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-all"
    >
      Zurücksetzen
    </button>
    
    <button
      type="submit"
      form="create-part-form"
      disabled={isSaving || !isFormValid}
      className="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium transition-all disabled:cursor-not-allowed"
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
  <div className="bg-blue-50 border border-blue-200 p-4 mb-6">
    <div className="flex items-center space-x-3">
      <div className="w-5 h-5 bg-blue-100 flex items-center justify-center">
        <span className="text-blue-600 text-xs font-bold">i</span>
      </div>
      <span className="text-sm font-medium text-blue-900">
        Alle Pflichtfelder (*) müssen ausgefüllt werden
      </span>
    </div>
  </div>
);

// Form Fields Component
const FormFields = ({ formData, onChange }: {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) => (
  <div className="bg-white border border-gray-200 shadow-sm p-6">
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
        <WrenchScrewdriverIcon className="h-4 w-4 text-blue-600" />
      </div>
      <h2 className="text-lg font-medium text-gray-900">Grunddaten</h2>
    </div>
    
    <div className="space-y-6">
      {/* Row 1: Teilenummer & Kategorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InputField
          label="Teilenummer *"
          name="partNumber"
          value={formData.partNumber}
          onChange={onChange}
          placeholder="z.B. DDR5$ oder A-12345"
          required
        />
        <SelectField
          label="Kategorie *"
          name="category"
          value={formData.category}
          onChange={onChange}
          options={Object.entries(CATEGORY_LABELS)}
          required
        />
      </div>

      {/* Row 2: Name */}
      <InputField
        label="Name *"
        name="name"
        value={formData.name}
        onChange={onChange}
        placeholder="z.B. Hydraulikzylinder"
        required
      />

      {/* Row 3: Preis & Lagerbestand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InputField
          label="Preis (€) *"
          name="price"
          type="number"
          value={formData.price}
          onChange={onChange}
          step="0.01"
          min="0.01"
          required
        />
        <InputField
          label="Lagerbestand (Stück) *"
          name="stockQuantity"
          type="number"
          value={formData.stockQuantity}
          onChange={onChange}
          min="0"
          required
        />
      </div>

      {/* Row 4: Hersteller */}
      <InputField
        label="Hersteller"
        name="manufacturer"
        value={formData.manufacturer}
        onChange={onChange}
        placeholder="z.B. Bosch, Siemens"
      />

      {/* Row 5: Beschreibung */}
      <TextAreaField
        label="Beschreibung"
        name="description"
        value={formData.description}
        onChange={onChange}
        placeholder="Detaillierte Beschreibung des Wartungsteils..."
        rows={4}
      />
    </div>
  </div>
);

// Reusable Input Field
const InputField = ({ label, name, value, onChange, type = "text", placeholder, required, step, min }: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      step={step}
      min={min}
      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
    />
  </div>
);

// Reusable Select Field
const SelectField = ({ label, name, value, onChange, options, required }: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: [string, string][];
  required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
    >
      {options.map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
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
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all hover:border-gray-400"
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
    <div className="bg-red-50 border border-red-200 p-6 mt-6">
      <div className="flex items-start space-x-4">
        <div className="w-8 h-8 bg-red-100 flex items-center justify-center flex-shrink-0">
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
        </div>
        <div className="flex-1">
          {saveError && (
            <p className="text-red-800 font-medium mb-3">{saveError}</p>
          )}
          {validationErrors.length > 0 && (
            <div>
              <p className="text-red-800 font-medium mb-3">Bitte korrigieren Sie folgende Fehler:</p>
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
const LivePreview = ({ formData, isFormValid }: {
  formData: FormData;
  isFormValid: boolean;
}) => (
  <div className="bg-white border border-gray-200 shadow-sm p-6 xl:sticky xl:top-6">
    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
      <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
        <EyeIcon className="h-4 w-4 text-gray-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">Vorschau</h3>
    </div>
    
    <div className="space-y-4">
      <PreviewField 
        label="Teilenummer"
        value={formData.partNumber}
        className="text-lg font-semibold"
      />
      <PreviewField 
        label="Name"
        value={formData.name}
        className="text-lg font-medium"
      />
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Kategorie</div>
        <span className="inline-flex px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
          {CATEGORY_LABELS[formData.category]}
        </span>
      </div>
      <div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Preis</div>
        <div className="text-2xl font-semibold text-gray-900">
          {formData.price.toFixed(2)} €
        </div>
      </div>
      <PreviewField 
        label="Lagerbestand"
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

    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={`w-6 h-6 flex items-center justify-center ${
          isFormValid 
            ? 'bg-green-100 text-green-600' 
            : 'bg-amber-100 text-amber-600'
        }`}>
          {isFormValid ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <ExclamationTriangleIcon className="h-4 w-4" />
          )}
        </div>
        <span className={`text-sm font-medium ${
          isFormValid ? 'text-green-700' : 'text-amber-700'
        }`}>
          {isFormValid ? 'Bereit zum Erstellen' : 'Pflichtfelder fehlen'}
        </span>
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
    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</div>
    <div className={`text-gray-900 break-words ${className || ''}`}>
      {value || <span className="text-gray-400 italic font-normal">Noch nicht eingegeben</span>}
    </div>
  </div>
);

// Mobile Actions Component
const MobileActions = ({ isSaving, isFormValid }: {
  isSaving: boolean;
  isFormValid: boolean;
}) => (
  <>
    <div className="xl:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl">
      <div className="flex gap-3 max-w-md mx-auto">
        <Link
          to="/parts"
          className="flex-1 px-4 py-2 text-center text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </Link>
        <button
          type="submit"
          form="create-part-form"
          disabled={isSaving || !isFormValid}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium transition-all disabled:cursor-not-allowed"
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
    <div className="xl:hidden h-20"></div>
  </>
);

export default MaintenancePartCreate;