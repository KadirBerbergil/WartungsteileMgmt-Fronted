// src/pages/machines/MachineCreate.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { machineService } from '../../services';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CogIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface FormData {
  number: string;
  type: string;
  operatingHours: number;
  installationDate: string;
  status: 'Active' | 'InMaintenance' | 'OutOfService';
}

const MachineCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<FormData>({
    number: '',
    type: '',
    operatingHours: 0,
    installationDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'operatingHours' ? 
        (value === '' ? 0 : parseInt(value)) : value
    }));
    
    if (saveError) setSaveError(null);
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.number.trim()) errors.push('Maschinennummer ist erforderlich');
    if (!formData.type.trim()) errors.push('Maschinentyp ist erforderlich');
    if (formData.operatingHours < 0) errors.push('Betriebsstunden können nicht negativ sein');
    if (!formData.installationDate) errors.push('Installationsdatum ist erforderlich');
    
    if (formData.number && !formData.number.match(/^[A-Z0-9-\s]+$/i)) {
      errors.push('Maschinennummer darf nur Buchstaben, Zahlen, Bindestriche und Leerzeichen enthalten');
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
        number: formData.number.trim(),
        type: formData.type.trim(),
        operatingHours: formData.operatingHours,
        installationDate: formData.installationDate,
        status: formData.status
      };

      const newMachineId = await machineService.create(createData);
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      
      navigate(`/machines/${newMachineId}`, { 
        replace: true,
        state: { message: 'Maschine erfolgreich erstellt!' }
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
        setSaveError('Eine Maschine mit dieser Nummer existiert bereits.');
      } else if (status >= 500) {
        setSaveError('Serverfehler. Bitte versuchen Sie es später erneut.');
      } else {
        setSaveError('Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = Boolean(formData.number.trim() && formData.type.trim());

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <Link 
              to="/machines"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Zurück zur Liste</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <PlusIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Neue Maschine</h1>
              <p className="text-gray-600 mt-1">CNC-Maschine zum System hinzufügen</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/machines"
            className="px-4 py-2 text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-colors"
          >
            Abbrechen
          </Link>
          
          <button
            type="submit"
            form="create-machine-form"
            disabled={isSaving || !isFormValid}
            className="inline-flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Wird erstellt...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Maschine erstellen
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
            <h3 className="font-semibold text-blue-900 mb-1">Schnelle Erfassung</h3>
            <p className="text-blue-800 text-sm">
              Erfassen Sie die Grunddaten. Erweiterte Magazin-Eigenschaften können später über PDF-Import oder manuell hinzugefügt werden.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <CogIcon className="h-4 w-4 text-gray-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Grunddaten erfassen</h2>
        </div>
        
        <form id="create-machine-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Machine Number & Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Maschinennummer *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CogIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="z.B. CNC-001 oder M-12345"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Maschinentyp *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <WrenchScrewdriverIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="z.B. CNC Drehmaschine L20"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours & Installation Date */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Aktuelle Betriebsstunden
              </label>
              <input
                type="number"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleInputChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Installationsdatum *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="installationDate"
                  value={formData.installationDate}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Anfangsstatus
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
            >
              <option value="Active">🟢 Aktiv</option>
              <option value="InMaintenance">🟡 In Wartung</option>
              <option value="OutOfService">🔴 Außer Betrieb</option>
            </select>
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
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <CheckIcon className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Vorschau</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <PreviewField label="Maschinennummer" value={formData.number} />
            <PreviewField label="Typ" value={formData.type} />
            <PreviewField label="Status" value={
              formData.status === 'Active' ? '🟢 Aktiv' :
              formData.status === 'InMaintenance' ? '🟡 In Wartung' :
              '🔴 Außer Betrieb'
            } />
          </div>
          
          <div className="space-y-4">
            <PreviewField label="Betriebsstunden" value={`${formData.operatingHours} h`} />
            <PreviewField 
              label="Installation" 
              value={formData.installationDate ? 
                new Date(formData.installationDate).toLocaleDateString('de-DE') : 
                'Nicht festgelegt'
              } 
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${
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
            <div>
              <span className={`text-sm font-semibold ${
                isFormValid ? 'text-green-700' : 'text-amber-700'
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

      {/* Next Steps Info */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Nach der Erstellung verfügbar:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <CogIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Magazin-Eigenschaften</p>
              <p className="text-gray-600 text-xs">Erweiterte Konfiguration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Wartungsteile</p>
              <p className="text-gray-600 text-xs">Kompatible Teile</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <CalendarDaysIcon className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Wartungsplanung</p>
              <p className="text-gray-600 text-xs">Intervalle & Historie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Preview Field Helper
const PreviewField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</div>
    <div className="text-gray-800 font-medium">
      {value || <span className="text-gray-400 italic font-normal">Noch nicht eingegeben</span>}
    </div>
  </div>
);

export default MachineCreate;