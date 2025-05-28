// src/pages/machines/MachineEdit.tsx - Mit korrigierter Status-Integration
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMachineDetail } from '../../hooks/useMachines';
import { machineService } from '../../services/machineService';
import MachineStatusUpdater from '../../components/MachineStatusUpdater';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  CogIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface FormData {
  type: string;
  operatingHours: number;
  installationDate: string;
  // Status wird jetzt über MachineStatusUpdater Component gehandelt
}

const MachineEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: machine, isLoading, error } = useMachineDetail(id || '');
  
  const [formData, setFormData] = useState<FormData>({
    type: '',
    operatingHours: 0,
    installationDate: ''
  });
  
  const [originalData, setOriginalData] = useState<FormData>(formData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form data when machine loads
  useEffect(() => {
    if (machine) {
      const data: FormData = {
        type: machine.type,
        operatingHours: machine.operatingHours,
        installationDate: machine.installationDate.split('T')[0] // Convert to YYYY-MM-DD
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [machine]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

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

  // ✅ Status Change Handler - Integration mit MachineStatusUpdater
  const handleStatusChange = (newStatus: string) => {
    console.log(`✅ Status erfolgreich geändert auf: ${newStatus}`);
    // Machine data wird automatisch durch Query Invalidation aktualisiert
    queryClient.invalidateQueries({ queryKey: ['machine', id] });
    queryClient.invalidateQueries({ queryKey: ['machines'] });
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.type.trim()) {
      errors.push('Maschinentyp ist erforderlich');
    }
    if (formData.operatingHours < 0) {
      errors.push('Betriebsstunden können nicht negativ sein');
    }
    if (!formData.installationDate) {
      errors.push('Installationsdatum ist erforderlich');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!machine || !id) return;
    
    if (!validateForm()) {
      return;
    }
    
    if (!hasUnsavedChanges) {
      navigate(`/machines/${id}`);
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);

    try {
      // ✅ Verwende machineService statt direkten api call
      
      // Update basic machine data (type, installationDate)
      if (formData.type !== originalData.type || formData.installationDate !== originalData.installationDate) {
        const updateData = {
          type: formData.type.trim(),
          installationDate: formData.installationDate
        };
        await machineService.update(id, updateData);
      }
      
      // Update operating hours separately if changed
      if (formData.operatingHours !== originalData.operatingHours) {
        await machineService.updateOperatingHours(id, formData.operatingHours);
      }
      
      // Status wird über MachineStatusUpdater Component gehandelt - nicht hier!
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      queryClient.invalidateQueries({ queryKey: ['machine', id] });
      
      navigate(`/machines/${id}`, { 
        replace: true,
        state: { message: 'Maschine erfolgreich aktualisiert!' }
      });
      
    } catch (error: any) {
      console.error('Update machine error:', error);
      
      if (error.response?.status === 400) {
        if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
          setValidationErrors(error.response.data.errors);
        } else if (error.response.data?.message) {
          setSaveError(error.response.data.message);
        } else {
          setSaveError('Ungültige Eingabedaten. Bitte prüfen Sie Ihre Eingaben.');
        }
      } else if (error.response?.status === 404) {
        setSaveError('Maschine nicht gefunden. Möglicherweise wurde sie bereits gelöscht.');
      } else if (error.response?.status === 409) {
        setSaveError('Konflikt beim Speichern. Möglicherweise wurde die Maschine von jemand anderem geändert.');
      } else if (error.response?.status >= 500) {
        setSaveError('Serverfehler. Bitte versuchen Sie es später erneut.');
      } else {
        setSaveError('Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (machine) {
      const data: FormData = {
        type: machine.type,
        operatingHours: machine.operatingHours,
        installationDate: machine.installationDate.split('T')[0]
      };
      setFormData(data);
      setSaveError(null);
      setValidationErrors([]);
    }
  };

  // Prevent navigation if there are unsaved changes
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Maschine wird geladen</h3>
          <p className="text-gray-600">Details werden zusammengestellt...</p>
        </div>
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-600 mb-3">Maschine nicht gefunden</h3>
          <p className="text-gray-600 mb-6">
            Die angeforderte Maschine mit der ID "{id}" existiert nicht oder wurde gelöscht.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/machines"
              className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Zur Maschinenliste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = Boolean(formData.type.trim());

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to={`/machines/${id}`}
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
              <h1 className="text-2xl font-bold text-gray-900">Maschine bearbeiten</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-gray-600 font-medium break-words">{machine.number}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 break-words">{machine.type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* ✅ Status Updater Component */}
          <MachineStatusUpdater
            machine={machine}
            onStatusChange={handleStatusChange}
            size="md"
          />
          
          <Link
            to={`/machines/${id}`}
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
            form="edit-machine-form"
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
            <CogIcon className="h-4 w-4 text-gray-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Maschinendaten bearbeiten</h2>
        </div>
        
        <form id="edit-machine-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Read-only Machine Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Maschinennummer <span className="text-gray-400 font-normal">(nicht änderbar)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <CogIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={machine.number}
                disabled
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Machine Type */}
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
                required
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
              />
            </div>
            {formData.type !== originalData.type && (
              <div className="text-xs text-blue-600 mt-2">
                Geändert von: "{originalData.type}"
              </div>
            )}
          </div>

          {/* Operating Hours & Installation Date */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Betriebsstunden
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="operatingHours"
                  value={formData.operatingHours}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-300"
                />
              </div>
              {formData.operatingHours !== originalData.operatingHours && (
                <div className="text-xs text-blue-600 mt-2">
                  Geändert von: {originalData.operatingHours} h
                </div>
              )}
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
              {formData.installationDate !== originalData.installationDate && (
                <div className="text-xs text-blue-600 mt-2">
                  Geändert von: {new Date(originalData.installationDate).toLocaleDateString('de-DE')}
                </div>
              )}
            </div>
          </div>

          {/* ✅ Status Info - Nur Anzeige, Änderung über MachineStatusUpdater */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Aktueller Status <span className="text-gray-400 font-normal">(Änderung über Status-Button oben)</span>
            </label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                machine.status === 'Active' ? 'bg-green-500' :
                machine.status === 'InMaintenance' ? 'bg-yellow-500' :
                machine.status === 'OutOfService' ? 'bg-red-500' :
                'bg-gray-500'
              }`}></div>
              <span className="text-gray-700 font-medium">
                {machineService.getStatusDisplayName(machine.status)}
              </span>
              <span className="text-xs text-gray-500">
                (Verwenden Sie den Status-Button oben rechts zum Ändern)
              </span>
            </div>
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
            <PreviewField
              label="Maschinennummer"
              value={machine.number}
              className="text-lg font-semibold"
            />
            <PreviewField
              label="Maschinentyp"
              value={formData.type}
              originalValue={originalData.type}
              className="text-lg font-medium"
            />
            <PreviewField
              label="Status"
              value={machineService.getStatusDisplayName(machine.status)}
              className="text-lg font-medium"
            />
          </div>
          
          <div className="space-y-4">
            <PreviewField
              label="Betriebsstunden"
              value={`${formData.operatingHours} h`}
              originalValue={`${originalData.operatingHours} h`}
              className="text-lg font-medium"
            />
            <PreviewField
              label="Installation"
              value={formData.installationDate ? 
                new Date(formData.installationDate).toLocaleDateString('de-DE') : 
                'Nicht festgelegt'
              }
              originalValue={originalData.installationDate ? 
                new Date(originalData.installationDate).toLocaleDateString('de-DE') : 
                'Nicht festgelegt'
              }
              className="text-lg font-medium"
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

// Preview Field Helper
const PreviewField = ({ label, value, originalValue, className }: {
  label: string;
  value: string;
  originalValue?: string;
  className?: string;
}) => (
  <div>
    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</div>
    <div className={`text-gray-800 break-words ${className || ''}`}>
      {value || <span className="text-gray-400 italic font-normal">Leer</span>}
    </div>
    {originalValue && value !== originalValue && (
      <div className="text-xs text-blue-600 mt-1">Geändert von: {originalValue || 'Leer'}</div>
    )}
  </div>
);

export default MachineEdit;