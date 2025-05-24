// src/pages/parts/MaintenancePartEdit.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMaintenancePartDetail } from '../../hooks/useParts';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MaintenancePartEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Formular mit geladenen Daten befüllen
  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name,
        description: part.description || '',
        category: part.category,
        price: part.price,
        manufacturer: part.manufacturer || '',
        stockQuantity: part.stockQuantity
      });
    }
  }, [part]);

  // Formular-Eingaben verarbeiten
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stockQuantity' ? 
        (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  // Formular speichern
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      // Hier würde normalerweise der API-Call stehen
      // Für jetzt simulieren wir das Speichern
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Zurück zur Detail-Seite
      navigate(`/parts/${id}`);
    } catch (error) {
      setSaveError('Fehler beim Speichern des Wartungsteils');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Link to="/parts" className="text-primary hover:text-primary/80">
            ← Zurück zur Liste
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-medium">Wartungsteil nicht gefunden</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to={`/parts/${id}`}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Zurück zu Details</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-800">Wartungsteil bearbeiten</h1>
        </div>
      </div>

      {/* Formular */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Grunddaten</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teilenummer (nicht editierbar) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teilenummer <span className="text-gray-400">(nicht änderbar)</span>
              </label>
              <input
                type="text"
                value={part.partNumber}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            {/* Kategorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
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
            <div className="md:col-span-2">
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
                min="0"
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hersteller
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Beschreibung */}
            <div className="md:col-span-2">
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

        {/* Fehleranzeige */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <p className="text-red-700 font-medium">{saveError}</p>
            </div>
          </div>
        )}

        {/* Aktionsbuttons */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <Link
            to={`/parts/${id}`}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Abbrechen
          </Link>
          
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white px-6 py-2 rounded-lg transition-all hover:shadow-lg disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Speichern...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>Änderungen speichern</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenancePartEdit;