// src/components/MagazinePropertiesEditor.tsx - Umfassender Editor für alle 29+ Magazin-Eigenschaften
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { machineService } from '../services';
import type { 
  Machine, 
  MachineDetail, 
  UpdateMagazinePropertiesCommand,
  MagazinePropertiesGroups 
} from '../types/api';
import { 
  CheckIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  XMarkIcon,
  SparklesIcon,
  CogIcon,
  UserIcon,
  ColorSwatchIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  CubeIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface MagazinePropertiesEditorProps {
  machine: MachineDetail;
  onUpdate?: (updatedMachine: MachineDetail) => void;
  readonly?: boolean;
}

const MagazinePropertiesEditor: React.FC<MagazinePropertiesEditorProps> = ({
  machine,
  onUpdate,
  readonly = false
}) => {
  const queryClient = useQueryClient();
  
  // State Management
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['basic']));
  const [showEmptyFields, setShowEmptyFields] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState<UpdateMagazinePropertiesCommand>({});
  const [originalData, setOriginalData] = useState<UpdateMagazinePropertiesCommand>({});
  
  // Completeness Data
  const [completenessData, setCompletenessData] = useState<{
    completeness: number;
    totalFields: number;
    filledFields: number;
    hasBasicData: boolean;
    hasExtendedData: boolean;
  } | null>(null);

  // Initialize form data when machine changes
  useEffect(() => {
    const initialData: UpdateMagazinePropertiesCommand = {
      // Basic
      magazineType: machine.magazineType || '',
      materialBarLength: machine.materialBarLength || 0,
      hasSynchronizationDevice: machine.hasSynchronizationDevice || false,
      feedChannel: machine.feedChannel || '',
      feedRod: machine.feedRod || '',
      
      // Customer
      customerName: machine.customerName || '',
      customerNumber: machine.customerNumber || '',
      customerProcess: machine.customerProcess || '',
      
      // Production
      productionWeek: machine.productionWeek || '',
      buildVariant: machine.buildVariant || '',
      operatingVoltage: machine.operatingVoltage || '',
      
      // Colors
      baseColor: machine.baseColor || '',
      coverColor: machine.coverColor || '',
      switchCabinetColor: machine.switchCabinetColor || '',
      controlPanelColor: machine.controlPanelColor || '',
      
      // Documentation
      documentationLanguage: machine.documentationLanguage || '',
      documentationCount: machine.documentationCount || '',
      
      // Lathe
      latheManufacturer: machine.latheManufacturer || '',
      latheType: machine.latheType || '',
      latheNumber: machine.latheNumber || '',
      spindleHeight: machine.spindleHeight || '',
      spindleDiameter: machine.spindleDiameter || '',
      
      // Electrical
      magazineNumber: machine.magazineNumber || '',
      positionNumber: machine.positionNumber || '',
      controlPanel: machine.controlPanel || '',
      apm: machine.apm || '',
      eprom: machine.eprom || '',
      circuitDiagram: machine.circuitDiagram || '',
      drawingList: machine.drawingList || '',
      
      // Article
      articleNumber: machine.articleNumber || '',
      
      // Notes
      magazinePropertiesNotes: machine.magazinePropertiesNotes || ''
    };
    
    setFormData(initialData);
    setOriginalData(initialData);
    loadCompletenessData();
  }, [machine]);

  // Load completeness data
  const loadCompletenessData = async () => {
    try {
      const data = await machineService.getMagazineDataCompleteness(machine.id);
      setCompletenessData(data);
    } catch (error) {
      // Fallback to client-side calculation
      const data = machineService.calculateCompletenessClientSide(machine);
      setCompletenessData(data);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof UpdateMagazinePropertiesCommand, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveError(null);
  };

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    
    try {
      // Validate data
      const validation = machineService.validateMagazineProperties(formData);
      if (!validation.isValid) {
        setSaveError(`Validierungsfehler: ${validation.errors.join(', ')}`);
        return;
      }
      
      // Save to backend
      const result = await machineService.updateMagazineProperties(machine.id, formData);
      
      if (result.success) {
        // Update original data
        setOriginalData(formData);
        setIsEditing(false);
        
        // Reload completeness
        await loadCompletenessData();
        
        // Invalidate cache
        queryClient.invalidateQueries({ queryKey: ['machine', machine.id] });
        
        // Notify parent
        if (onUpdate) {
          const updatedMachine = { ...machine, ...formData };
          onUpdate(updatedMachine);
        }
        
        console.log('✅ Magazin-Eigenschaften erfolgreich gespeichert');
      } else {
        setSaveError('Unbekannter Fehler beim Speichern');
      }
      
    } catch (error: any) {
      console.error('❌ Fehler beim Speichern:', error);
      setSaveError(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setSaveError(null);
  };

  // Check if has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  // Field definitions with grouping
  const fieldGroups = {
    basic: {
      title: 'Basis-Eigenschaften',
      icon: CogIcon,
      color: 'blue',
      fields: [
        { key: 'magazineType', label: 'Magazin-Typ', type: 'text', placeholder: 'z.B. minimag 20 S1' },
        { key: 'materialBarLength', label: 'Materialstangenlänge (mm)', type: 'number', min: 0, max: 10000 },
        { key: 'hasSynchronizationDevice', label: 'Synchroneinrichtung', type: 'boolean' },
        { key: 'feedChannel', label: 'Zuführkanal', type: 'text', placeholder: 'z.B. Umrüstsatz D20/3200/1405' },
        { key: 'feedRod', label: 'Vorschubstange', type: 'text', placeholder: 'z.B. 1405' }
      ]
    },
    customer: {
      title: 'Kundendaten',
      icon: UserIcon,
      color: 'green',
      fields: [
        { key: 'customerName', label: 'Kundenname', type: 'text', placeholder: 'z.B. Citizen' },
        { key: 'customerNumber', label: 'Kundennummer', type: 'text', placeholder: 'z.B. 803023' },
        { key: 'customerProcess', label: 'Kundenprozess', type: 'text', placeholder: 'z.B. 0000167155' }
      ]
    },
    production: {
      title: 'Produktionsdaten',
      icon: ClockIcon,
      color: 'purple',
      fields: [
        { key: 'productionWeek', label: 'Produktionswoche', type: 'text', placeholder: 'z.B. 49/2018' },
        { key: 'buildVariant', label: 'Bauvariante', type: 'text', placeholder: 'z.B. C' },
        { key: 'operatingVoltage', label: 'Betriebsspannung', type: 'text', placeholder: 'z.B. 200V' }
      ]
    },
    colors: {
      title: 'Farben',
      icon: ColorSwatchIcon,
      color: 'pink',
      fields: [
        { key: 'baseColor', label: 'Grundfarbe', type: 'text', placeholder: 'z.B. Munsell Gray Color' },
        { key: 'coverColor', label: 'Abdeckungsfarbe', type: 'text', placeholder: 'z.B. Munsell White Color' },
        { key: 'switchCabinetColor', label: 'Schaltschrankfarbe', type: 'text' },
        { key: 'controlPanelColor', label: 'Bedienfeld-Farbe', type: 'text' }
      ]
    },
    documentation: {
      title: 'Dokumentation',
      icon: DocumentTextIcon,
      color: 'yellow',
      fields: [
        { 
          key: 'documentationLanguage', 
          label: 'Dokumentationssprache', 
          type: 'select',
          options: ['', 'Deutsch', 'English', 'Français', 'Español', 'Italiano']
        },
        { key: 'documentationCount', label: 'Anzahl Dokumentation', type: 'text', placeholder: 'z.B. Deutsch' }
      ]
    },
    lathe: {
      title: 'Drehmaschine',
      icon: WrenchScrewdriverIcon,
      color: 'orange',
      fields: [
        { key: 'latheManufacturer', label: 'Drehmaschinen-Hersteller', type: 'text', placeholder: 'z.B. Citizen' },
        { key: 'latheType', label: 'Drehmaschinentyp', type: 'text', placeholder: 'z.B. L 20 E M8;M10;M12 (L 220)' },
        { key: 'latheNumber', label: 'Drehmaschinen-Nummer', type: 'text', placeholder: 'z.B. 1541' },
        { key: 'spindleHeight', label: 'Spindelhöhe', type: 'text', placeholder: 'z.B. 1050' },
        { key: 'spindleDiameter', label: 'Spindeldurchmesser', type: 'text', placeholder: 'z.B. 25 (22)' }
      ]
    },
    electrical: {
      title: 'Elektrische Daten',
      icon: BoltIcon,
      color: 'red',
      fields: [
        { key: 'magazineNumber', label: 'Magazin-Nummer', type: 'text', placeholder: 'z.B. 48' },
        { key: 'positionNumber', label: 'Positionsnummer', type: 'text', placeholder: 'z.B. 1' },
        { key: 'controlPanel', label: 'Bedienfeld', type: 'text', placeholder: 'z.B. B_M2_D4001' },
        { key: 'apm', label: 'APM', type: 'text', placeholder: 'z.B. --' },
        { key: 'eprom', label: 'EPROM', type: 'text', placeholder: 'z.B. B_M2_4001' },
        { key: 'circuitDiagram', label: 'Schaltplan', type: 'text', placeholder: 'z.B. 23D2130.9002' },
        { key: 'drawingList', label: 'Zeichnungsliste', type: 'text', placeholder: 'z.B. 1/128' }
      ]
    },
    article: {
      title: 'Artikel',
      icon: CubeIcon,
      color: 'indigo',
      fields: [
        { key: 'articleNumber', label: 'Artikelnummer', type: 'text', placeholder: 'z.B. 048-32-1541-01BC' }
      ]
    }
  };

  // Render field based on type
  const renderField = (field: any, groupColor: string) => {
    const value = formData[field.key as keyof UpdateMagazinePropertiesCommand];
    const isEmpty = !value || (typeof value === 'string' && value.trim() === '') || value === 0;
    
    // Hide empty fields if showEmptyFields is false
    if (!showEmptyFields && isEmpty && !isEditing) {
      return null;
    }

    const fieldId = `field-${field.key}`;
    
    return (
      <div key={field.key} className="space-y-2">
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
          {field.label}
        </label>
        
        {isEditing ? (
          // Edit Mode
          <>
            {field.type === 'boolean' ? (
              <div className="flex items-center space-x-3">
                <input
                  id={fieldId}
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleInputChange(field.key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">
                  {value ? 'Ja' : 'Nein'}
                </span>
              </div>
            ) : field.type === 'select' ? (
              <select
                id={fieldId}
                value={value as string || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {field.options?.map((option: string) => (
                  <option key={option} value={option}>
                    {option || 'Nicht ausgewählt'}
                  </option>
                ))}
              </select>
            ) : field.type === 'number' ? (
              <input
                id={fieldId}
                type="number"
                value={value as number || ''}
                onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value) || 0)}
                min={field.min}
                max={field.max}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <input
                id={fieldId}
                type="text"
                value={value as string || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </>
        ) : (
          // View Mode
          <div className={`px-3 py-2 rounded-lg ${isEmpty ? 'bg-gray-50 text-gray-400 italic' : 'bg-gray-50 text-gray-800'}`}>
            {field.type === 'boolean' ? (
              <span className={`font-medium ${value ? 'text-green-600' : 'text-gray-500'}`}>
                {value ? 'Ja' : 'Nein'}
              </span>
            ) : field.type === 'number' && field.key === 'materialBarLength' ? (
              value ? `${value} mm` : 'Nicht angegeben'
            ) : (
              (value as string) || 'Nicht angegeben'
            )}
          </div>
        )}
      </div>
    );
  };

  // Render group
  const renderGroup = (groupKey: string, group: any) => {
    const isExpanded = expandedGroups.has(groupKey);
    const GroupIcon = group.icon;
    const colorClasses = {
      blue: 'border-blue-200 bg-blue-50',
      green: 'border-green-200 bg-green-50',
      purple: 'border-purple-200 bg-purple-50',
      pink: 'border-pink-200 bg-pink-50',
      yellow: 'border-yellow-200 bg-yellow-50',
      orange: 'border-orange-200 bg-orange-50',
      red: 'border-red-200 bg-red-50',
      indigo: 'border-indigo-200 bg-indigo-50'
    };

    const iconClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      pink: 'text-pink-600',
      yellow: 'text-yellow-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
      indigo: 'text-indigo-600'
    };

    // Count filled fields in this group
    const filledFields = group.fields.filter((field: any) => {
      const value = formData[field.key as keyof UpdateMagazinePropertiesCommand];
      return value && (typeof value !== 'string' || value.trim() !== '') && value !== 0;
    });

    const visibleFields = group.fields.filter((field: any) => {
      if (isEditing || showEmptyFields) return true;
      const value = formData[field.key as keyof UpdateMagazinePropertiesCommand];
      return value && (typeof value !== 'string' || value.trim() !== '') && value !== 0;
    });

    // Don't render group if no visible fields and not editing
    if (!isEditing && !showEmptyFields && visibleFields.length === 0) {
      return null;
    }

    return (
      <div key={groupKey} className={`border rounded-xl ${colorClasses[group.color as keyof typeof colorClasses]} overflow-hidden`}>
        <button
          onClick={() => toggleGroup(groupKey)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <GroupIcon className={`h-5 w-5 ${iconClasses[group.color as keyof typeof iconClasses]}`} />
            <span className="font-semibold text-gray-800">{group.title}</span>
            <span className="text-sm text-gray-500">
              ({filledFields.length}/{group.fields.length})
            </span>
          </div>
          <ChevronDownIcon className={`h-5 w-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {isExpanded && (
          <div className="px-6 pb-6 bg-white/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.fields.map((field: any) => renderField(field, group.color))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CogIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Magazin-Eigenschaften</h2>
            <p className="text-gray-600">Erweiterte Werkstattauftrag-Daten</p>
          </div>
        </div>
        
        {!readonly && (
          <div className="flex items-center space-x-3">
            {/* View Controls */}
            <button
              onClick={() => setShowEmptyFields(!showEmptyFields)}
              className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showEmptyFields ? (
                <>
                  <EyeSlashIcon className="h-4 w-4" />
                  <span>Leere ausblenden</span>
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4" />
                  <span>Alle anzeigen</span>
                </>
              )}
            </button>
            
            {/* Edit/Save Controls */}
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Speichern...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Speichern{hasChanges ? ' *' : ''}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Bearbeiten</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Completeness Indicator */}
      {completenessData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">Vollständigkeit</h3>
                <p className="text-sm text-blue-600">
                  {completenessData.filledFields} von {completenessData.totalFields} Feldern ausgefüllt
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-800">{completenessData.completeness}%</div>
              <div className="text-sm text-blue-600">Vollständig</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-200 rounded-full h-3 mb-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completenessData.completeness}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${completenessData.hasBasicData ? 'text-green-600' : 'text-yellow-600'}`}>
              {completenessData.hasBasicData ? '✅ Grunddaten vorhanden' : '⚠️ Grunddaten fehlen'}
            </span>
            <span className={`font-medium ${completenessData.hasExtendedData ? 'text-green-600' : 'text-gray-500'}`}>
              {completenessData.hasExtendedData ? '✅ Erweiterte Daten vorhanden' : '📝 Erweiterte Daten optional'}
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Fehler beim Speichern</p>
              <p className="text-red-600 text-sm mt-1">{saveError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Property Groups */}
      <div className="space-y-4">
        {Object.entries(fieldGroups).map(([groupKey, group]) => renderGroup(groupKey, group))}
      </div>

      {/* Notes Section */}
      <div className="border border-gray-200 rounded-xl bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5 text-gray-600" />
          <span>Zusätzliche Notizen</span>
        </h3>
        
        {isEditing ? (
          <textarea
            value={formData.magazinePropertiesNotes || ''}
            onChange={(e) => handleInputChange('magazinePropertiesNotes', e.target.value)}
            rows={3}
            placeholder="Zusätzliche Informationen zu den Magazin-Eigenschaften..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        ) : (
          <div className="px-3 py-2 bg-white rounded-lg text-gray-800">
            {formData.magazinePropertiesNotes || (
              <span className="text-gray-400 italic">Keine zusätzlichen Notizen</span>
            )}
          </div>
        )}
      </div>

      {/* Metadata */}
      {(machine.magazinePropertiesLastUpdated || machine.magazinePropertiesUpdatedBy) && (
        <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span>
              Letzte Aktualisierung: {machine.magazinePropertiesLastUpdated 
                ? new Date(machine.magazinePropertiesLastUpdated).toLocaleString('de-DE')
                : 'Nie'}
            </span>
            <span>
              Von: {machine.magazinePropertiesUpdatedBy || 'System'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for chevron icon
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default MagazinePropertiesEditor;