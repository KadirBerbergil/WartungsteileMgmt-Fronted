// src/pages/parts/MaintenancePartEdit.tsx - Responsive Version (Zoom-Problem behoben)
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMaintenancePartDetail } from '../../hooks/useParts';
import { maintenancePartService } from '../../services';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const MaintenancePartEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: part, isLoading, error } = useMaintenancePartDetail(id || '');
  
  // Formular-State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'WearPart',
    price: 0,
    manufacturer: '',
    stockQuantity: 0
  });
  
  // Original-Daten für Änderungserkennung
  const [originalData, setOriginalData] = useState(formData);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Formular mit geladenen Daten befüllen
  useEffect(() => {
    if (part) {
      const data = {
        name: part.name,
        description: part.description || '',
        category: part.category,
        price: part.price,
        manufacturer: part.manufacturer || '',
        stockQuantity: part.stockQuantity
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [part]);

  // Änderungen verfolgen
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

  // Formular-Eingaben verarbeiten
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stockQuantity' ? 
        (value === '' ? 0 : parseFloat(value)) : value
    }));
    
    // Fehler zurücksetzen wenn User tippt
    if (saveError) setSaveError(null);
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  // Formular validieren
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

  // Speichern mit echter Backend-Integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!part || !id) return;
    
    // Client-seitige Validierung
    if (!validateForm()) {
      return;
    }
    
    // Keine Änderungen? Dann zurück zur Detail-Seite
    if (!hasUnsavedChanges) {
      navigate(`/parts/${id}`);
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);

    try {
      // Daten für API vorbereiten
      const updateData = {
        id: id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        price: formData.price,
        manufacturer: formData.manufacturer.trim() || undefined,
        stockQuantity: formData.stockQuantity
      };

      console.log('Aktualisiere Wartungsteil:', updateData);
      
      // Echter API-Call
      const success = await maintenancePartService.update(id, updateData);
      
      if (success) {
        console.log('Wartungsteil erfolgreich aktualisiert');
        
        // Cache invalidieren damit Listen und Details aktualisiert werden
        queryClient.invalidateQueries({ queryKey: ['maintenanceParts'] });
        queryClient.invalidateQueries({ queryKey: ['maintenancePart', id] });
        
        // Success! Zurück zur Detail-Seite
        navigate(`/parts/${id}`, { 
          replace: true,
          state: { message: 'Wartungsteil erfolgreich aktualisiert!' }
        });
      } else {
        setSaveError('Unerwarteter Fehler beim Aktualisieren');
      }
      
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren:', error);
      
      // Detaillierte Fehlerbehandlung
      if (error.response?.status === 400) {
        // Validierungsfehler vom Backend
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

  // Änderungen verwerfen
  const handleReset = () => {
    if (part) {
      const data = {
        name: part.name,
        description: part.description || '',
        category: part.category,
        price: part.price,
        manufacturer: part.manufacturer || '',
        stockQuantity: part.stockQuantity
      };
      setFormData(data);
      setSaveError(null);
      setValidationErrors([]);
    }
  };

  // Browser-Warnung bei ungespeicherten Änderungen
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
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link to="/parts" className="text-primary hover:text-primary/80">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Wartungsteil wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link to="/parts" className="text-primary hover:text-primary/80">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-medium">Wartungsteil nicht gefunden</p>
          <p className="text-gray-500 text-sm mt-2">
            {error instanceof Error ? error.message : 'Das Wartungsteil konnte nicht geladen werden.'}
          </p>
        </div>
      </div>
    );
  }

  const isFormValid = formData.name.trim() && formData.price > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* RESPONSIVE HEADER - Stack bei kleineren Bildschirmen */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Linke Seite - Titel und Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link 
            to={`/parts/${id}`}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium w-fit"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Zurück zu Details</span>
          </Link>
          <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <PencilIcon className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Wartungsteil bearbeiten</h1>
              <p className="text-gray-600 break-words">{part.partNumber} - {part.name}</p>
            </div>
          </div>
        </div>

        {/* Rechte Seite - Buttons - Stack bei kleineren Bildschirmen */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3">
          <Link
            to={`/parts/${id}`}
            className="px-4 py-2 text-center text-gray-700 font-medium hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Abbrechen
          </Link>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
            className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Zurücksetzen
          </button>
          
          <button
            type="submit"
            form="edit-part-form"
            disabled={isSaving || !isFormValid}
            className="inline-flex items-center justify-center px-6 py-2 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all shadow-sm disabled:cursor-not-allowed"
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

      {/* Änderungshinweis */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-700 font-medium">Sie haben ungespeicherte Änderungen</p>
          </div>
        </div>
      )}

      {/* RESPONSIVE GRID LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Formular - 3/4 der Breite auf großen Bildschirmen */}
        <div className="xl:col-span-3">
          {/* Formular mit ID für externen Submit-Button */}
          <form id="edit-part-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Grunddaten</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Teilenummer (nicht editierbar) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teilenummer <span className="text-gray-400">(nicht änderbar)</span>
                  </label>
                  <input
                    type="text"
                    value={part.partNumber}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 break-words"
                  />
                </div>

                {/* Kategorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="WearPart">Verschleißteil</option>
                    <option value="SparePart">Ersatzteil</option>
                    <option value="ConsumablePart">Verbrauchsmaterial</option>
                    <option value="ToolPart">Werkzeug</option>
                  </select>
                </div>

                {/* Name */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Preis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preis (€) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Lagerbestand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lagerbestand (Stück) *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {/* Hersteller */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hersteller
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="z.B. Bosch, Siemens"
                  />
                </div>

                {/* Beschreibung */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Detaillierte Beschreibung des Wartungsteils..."
                  />
                </div>
              </div>
            </div>

            {/* Fehleranzeigen */}
            {(saveError || validationErrors.length > 0) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {saveError && (
                      <p className="text-red-700 font-medium mb-2">{saveError}</p>
                    )}
                    {validationErrors.length > 0 && (
                      <div>
                        <p className="text-red-700 font-medium mb-2">Bitte korrigieren Sie folgende Fehler:</p>
                        <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
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
          </form>
        </div>

        {/* Live-Vorschau/Änderungs-Übersicht Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 xl:sticky xl:top-6">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <PencilIcon className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Aktuelle Werte</h3>
            </div>
            
            <div className="space-y-4">
              {/* Teilenummer */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Teilenummer</div>
                <div className="text-base font-bold text-gray-900 break-words">{part.partNumber}</div>
              </div>
              
              {/* Name */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Name</div>
                <div className="text-base font-semibold text-gray-900 break-words">
                  {formData.name || <span className="text-gray-400 italic font-normal">Leer</span>}
                </div>
                {formData.name !== originalData.name && (
                  <div className="text-xs text-blue-600 mt-1">Geändert von: {originalData.name}</div>
                )}
              </div>
              
              {/* Kategorie */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Kategorie</div>
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">
                  {formData.category === 'WearPart' ? 'Verschleißteil' :
                   formData.category === 'SparePart' ? 'Ersatzteil' :
                   formData.category === 'ConsumablePart' ? 'Verbrauchsmaterial' : 'Werkzeug'}
                </span>
                {formData.category !== originalData.category && (
                  <div className="text-xs text-blue-600 mt-1">
                    Geändert von: {originalData.category === 'WearPart' ? 'Verschleißteil' :
                                   originalData.category === 'SparePart' ? 'Ersatzteil' :
                                   originalData.category === 'ConsumablePart' ? 'Verbrauchsmaterial' : 'Werkzeug'}
                  </div>
                )}
              </div>
              
              {/* Preis */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Preis</div>
                <div className="text-2xl font-bold text-blue-600">{formData.price.toFixed(2)} €</div>
                {formData.price !== originalData.price && (
                  <div className="text-xs text-blue-600 mt-1">Geändert von: {originalData.price.toFixed(2)} €</div>
                )}
              </div>
              
              {/* Lagerbestand */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Lagerbestand</div>
                <div className="text-base font-semibold text-gray-900">{formData.stockQuantity} Stück</div>
                {formData.stockQuantity !== originalData.stockQuantity && (
                  <div className="text-xs text-blue-600 mt-1">Geändert von: {originalData.stockQuantity} Stück</div>
                )}
              </div>
              
              {/* Hersteller */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hersteller</div>
                <div className="text-base font-semibold text-gray-900 break-words">
                  {formData.manufacturer || <span className="text-gray-400 italic font-normal">Nicht angegeben</span>}
                </div>
                {formData.manufacturer !== originalData.manufacturer && (
                  <div className="text-xs text-blue-600 mt-1">
                    Geändert von: {originalData.manufacturer || 'Nicht angegeben'}
                  </div>
                )}
              </div>
            </div>

            {/* Änderungs-Status */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                {hasUnsavedChanges ? (
                  <>
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-sm text-orange-700 font-semibold">Ungespeicherte Änderungen</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm text-green-700 font-semibold">Alle Änderungen gespeichert</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons - Nur auf kleinen Bildschirmen sichtbar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex gap-3 max-w-md mx-auto">
          <Link
            to={`/parts/${id}`}
            className="flex-1 px-4 py-3 text-center text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </Link>
          <button
            type="submit"
            form="edit-part-form"
            disabled={isSaving || !isFormValid || !hasUnsavedChanges}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
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

      {/* Spacer für mobile Fixed Buttons */}
      <div className="xl:hidden h-20"></div>
    </div>
  );
};

export default MaintenancePartEdit;