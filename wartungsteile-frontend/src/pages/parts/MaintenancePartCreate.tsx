// src/pages/parts/MaintenancePartCreate.tsx - Modernes, professionelles Design
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const MaintenancePartCreate = () => {
  const navigate = useNavigate();
  
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

  // Eingaben verarbeiten
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stockQuantity' ? 
        (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  // Speichern
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      console.log('Neues Wartungsteil:', formData);
      
      // 2 Sekunden Simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Zurück zur Liste
      navigate('/parts');
    } catch (error) {
      setSaveError('Fehler beim Erstellen');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Kompakterer Container */}
      <div className="max-w-6xl mx-auto p-4">
        
        {/* Kompakterer Header */}
        <div className="mb-6">
          <Link 
            to="/parts"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Zurück zur Liste
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <PlusIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Neues Wartungsteil erstellen</h1>
              <p className="text-gray-600 text-sm">Fügen Sie ein neues Wartungsteil zum System hinzu</p>
            </div>
          </div>
        </div>

        {/* Kompakteres Grid-Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Formular - 3/4 der Breite */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Grunddaten Karte - kompakter */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Grunddaten</h2>
                
                <div className="space-y-4">
                  {/* Teilenummer und Kategorie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teilenummer *
                      </label>
                      <input
                        type="text"
                        name="partNumber"
                        value={formData.partNumber}
                        onChange={handleInputChange}
                        placeholder="z.B. A-12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategorie *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="z.B. Antriebsriemen"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Preis und Lagerbestand */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preis (€) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lagerbestand (Stück) *
                      </label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Hersteller */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hersteller
                    </label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      placeholder="z.B. Bosch, Siemens"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Beschreibung - kleiner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Beschreibung
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Detaillierte Beschreibung..."
                    />
                  </div>
                </div>
              </div>

              {/* Fehleranzeige */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                    <p className="text-red-700 text-sm font-medium">{saveError}</p>
                  </div>
                </div>
              )}

              {/* Aktionsbuttons - IMMER SICHTBAR */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Link
                    to="/parts"
                    className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors text-center border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Abbrechen
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={isSaving || !formData.partNumber || !formData.name}
                    className="inline-flex items-center justify-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-all shadow-sm"
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
            </form>
          </div>

          {/* Kompakte Vorschau Sidebar - 1/4 der Breite */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-blue-900 mb-3">Live-Vorschau</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Teilenummer:</span>
                  <p className="text-blue-900 font-semibold">{formData.partNumber || 'Noch nicht eingegeben'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Name:</span>
                  <p className="text-blue-900 font-semibold">{formData.name || 'Noch nicht eingegeben'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Kategorie:</span>
                  <p className="text-blue-900 font-semibold">
                    {formData.category === 'WearPart' ? 'Verschleißteil' :
                     formData.category === 'SparePart' ? 'Ersatzteil' :
                     formData.category === 'ConsumablePart' ? 'Verbrauchsmaterial' : 'Werkzeug'}
                  </p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Preis:</span>
                  <p className="text-blue-900 font-bold text-base">{formData.price.toFixed(2)} €</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Lagerbestand:</span>
                  <p className="text-blue-900 font-semibold">{formData.stockQuantity} Stück</p>
                </div>
                {formData.manufacturer && (
                  <div>
                    <span className="text-blue-700 font-medium">Hersteller:</span>
                    <p className="text-blue-900 font-semibold">{formData.manufacturer}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePartCreate;