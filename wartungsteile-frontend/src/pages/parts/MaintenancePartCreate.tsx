// src/pages/parts/MaintenancePartCreate.tsx - Responsive Version (Zoom-Problem behoben)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { maintenancePartService } from '../../services';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const MaintenancePartCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Formular-State
  const [formData, setFormData] = useState({
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

  // Eingaben verarbeiten
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
    
    if (!formData.partNumber.trim()) {
      errors.push('Teilenummer ist erforderlich');
    }
    
    if (!formData.name.trim()) {
      errors.push('Name ist erforderlich');
    }
    
    if (formData.price <= 0) {
      errors.push('Preis muss größer als 0 sein');
    }
    
    if (formData.stockQuantity < 0) {
      errors.push('Lagerbestand kann nicht negativ sein');
    }
    
    // Teilenummer Format prüfen (relaxed version)
    if (formData.partNumber && !formData.partNumber.match(/^[A-Z0-9-\s]+$/i)) {
      errors.push('Teilenummer darf nur Buchstaben, Zahlen, Bindestriche und Leerzeichen enthalten');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Speichern mit echter Backend-Integration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-seitige Validierung
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);

    try {
      // Daten für API vorbereiten
      const createData = {
        partNumber: formData.partNumber.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        price: formData.price,
        manufacturer: formData.manufacturer.trim() || undefined,
        stockQuantity: formData.stockQuantity
      };

      console.log('Erstelle Wartungsteil:', createData);
      
      // Echter API-Call
      const newPartId = await maintenancePartService.create(createData);
      
      console.log('Wartungsteil erfolgreich erstellt, ID:', newPartId);
      
      // Cache invalidieren damit Listen aktualisiert werden
      queryClient.invalidateQueries({ queryKey: ['maintenanceParts'] });
      
      // Success! Weiterleitung zur Detail-Seite
      navigate(`/parts/${newPartId}`, { 
        replace: true,
        state: { message: 'Wartungsteil erfolgreich erstellt!' }
      });
      
    } catch (error: any) {
      console.error('Fehler beim Erstellen:', error);
      
      // Detaillierte Fehlerbehandlung
      if (error.response?.status === 400) {
        // Validierungsfehler vom Backend
        if (error.response.data?.errors) {
          setValidationErrors(error.response.data.errors);
        } else {
          setSaveError('Ungültige Eingabedaten. Bitte prüfen Sie Ihre Eingaben.');
        }
      } else if (error.response?.status === 409) {
        setSaveError('Ein Wartungsteil mit dieser Teilenummer existiert bereits.');
      } else if (error.response?.status >= 500) {
        setSaveError('Serverfehler. Bitte versuchen Sie es später erneut.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setSaveError('Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.');
      } else {
        setSaveError(`Fehler beim Erstellen: ${error.response?.data || error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Formular zurücksetzen
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

  const isFormValid = formData.partNumber.trim() && formData.name.trim() && formData.price > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* RESPONSIVE HEADER - Stack bei kleineren Bildschirmen */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Linke Seite - Titel und Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Link 
            to="/parts"
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium w-fit"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Zurück zur Liste</span>
          </Link>
          <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <PlusIcon className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Neues Wartungsteil erstellen</h1>
            </div>
          </div>
        </div>

        {/* Rechte Seite - Buttons - Stack bei kleineren Bildschirmen */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3">
          <Link
            to="/parts"
            className="px-4 py-2 text-center text-gray-700 font-medium hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Abbrechen
          </Link>
          
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Zurücksetzen
          </button>
          
          <button
            type="submit"
            form="create-part-form"
            disabled={isSaving || !isFormValid}
            className="inline-flex items-center justify-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all shadow-sm disabled:cursor-not-allowed"
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

      {/* RESPONSIVE GRID - Stack auf kleineren Bildschirmen */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Formular - 3/4 der Breite auf großen Bildschirmen, full-width auf kleinen */}
        <div className="xl:col-span-3">
          {/* Formular mit ID für externen Submit-Button */}
          <form id="create-part-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Grunddaten Karte */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Grunddaten</h2>
              
              <div className="space-y-6">
                {/* Teilenummer und Kategorie - Stack auf mobil */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teilenummer *
                    </label>
                    <input
                      type="text"
                      name="partNumber"
                      value={formData.partNumber}
                      onChange={handleInputChange}
                      placeholder="z.B. DDR5$ oder A-12345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategorie *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="WearPart">Verschleißteil</option>
                      <option value="SparePart">Ersatzteil</option>
                      <option value="ConsumablePart">Verbrauchsmaterial</option>
                      <option value="ToolPart">Werkzeug</option>
                    </select>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="z.B. DSRDSRD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Preis und Lagerbestand - Stack auf mobil */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Hersteller */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hersteller
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    placeholder="z.B. Bosch, Siemens"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Beschreibung */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
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

        {/* Live-Vorschau Sidebar - Responsive */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 xl:sticky xl:top-6">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Live-Vorschau</h3>
            </div>
            
            <div className="space-y-4">
              {/* Teilenummer */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Teilenummer</div>
                <div className="text-base font-bold text-gray-900 break-words">
                  {formData.partNumber || <span className="text-gray-400 italic font-normal">Noch nicht eingegeben</span>}
                </div>
              </div>
              
              {/* Name */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Name</div>
                <div className="text-base font-semibold text-gray-900 break-words">
                  {formData.name || <span className="text-gray-400 italic font-normal">Noch nicht eingegeben</span>}
                </div>
              </div>
              
              {/* Kategorie */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Kategorie</div>
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white">
                  {formData.category === 'WearPart' ? 'Verschleißteil' :
                   formData.category === 'SparePart' ? 'Ersatzteil' :
                   formData.category === 'ConsumablePart' ? 'Verbrauchsmaterial' : 'Werkzeug'}
                </span>
              </div>
              
              {/* Preis */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Preis</div>
                <div className="text-2xl font-bold text-blue-600">{formData.price.toFixed(2)} €</div>
              </div>
              
              {/* Lagerbestand */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Lagerbestand</div>
                <div className="text-base font-semibold text-gray-900">{formData.stockQuantity} Stück</div>
              </div>
              
              {/* Hersteller - nur wenn ausgefüllt */}
              {formData.manufacturer && (
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hersteller</div>
                  <div className="text-base font-semibold text-gray-900 break-words">{formData.manufacturer}</div>
                </div>
              )}
            </div>

            {/* Validierungs-Status */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                {isFormValid ? (
                  <>
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm text-green-700 font-semibold">Bereit zum Erstellen</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-sm text-yellow-700 font-semibold">Pflichtfelder fehlen</span>
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
            to="/parts"
            className="flex-1 px-4 py-3 text-center text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </Link>
          <button
            type="submit"
            form="create-part-form"
            disabled={isSaving || !isFormValid}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
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

      {/* Spacer für mobile Fixed Buttons */}
      <div className="xl:hidden h-20"></div>
    </div>
  );
};

export default MaintenancePartCreate;