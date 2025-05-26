// src/components/MagazinePropertiesEditor.tsx - Professionelle B2B-Version
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { machineService } from '../services';
import type { 
  MachineDetail, 
  UpdateMagazinePropertiesCommand
} from '../types/api';
import { 
  CheckIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  SwatchIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  CubeIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['basic']));
  const [showEmptyFields, setShowEmptyFields] = useState(false);
  
  const [formData, setFormData] = useState<UpdateMagazinePropertiesCommand>({});
  const [originalData, setOriginalData] = useState<UpdateMagazinePropertiesCommand>({});
  
  const [completenessData, setCompletenessData] = useState<{
    completeness: number;
    totalFields: number;
    filledFields: number;
    hasBasicData: boolean;
    hasExtendedData: boolean;
  } | null>(null);

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

  const loadCompletenessData = async () => {
    try {
      const data = await machineService.getMagazineDataCompleteness(machine.id);
      setCompletenessData(data);
    } catch (error) {
      const data = machineService.calculateCompletenessClientSide(machine);
      setCompletenessData(data);
    }
  };

  const handleInputChange = (field: keyof UpdateMagazinePropertiesCommand, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaveError(null);
  };

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

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    
    try {
      const validation = machineService.validateMagazineProperties(formData);
      if (!validation.isValid) {
        setSaveError(`Validierungsfehler: ${validation.errors.join(', ')}`);
        return;
      }
      
      const result = await machineService.updateMagazineProperties(machine.id, formData);
      
      if (result.success) {
        setOriginalData(formData);
        setIsEditing(false);
        
        await loadCompletenessData();
        queryClient.invalidateQueries({ queryKey: ['machine', machine.id] });
        
        if (onUpdate) {
          const updatedMachine = { ...machine, ...formData };
          onUpdate(updatedMachine);
        }
      } else {
        setSaveError('Unbekannter Fehler beim Speichern');
      }
      
    } catch (error: any) {
      setSaveError(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setSaveError(null);
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const fieldGroups = {
    basic: {
      title: 'Basis-Eigenschaften',
      icon: CogIcon,
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
      fields: [
        { key: 'customerName', label: 'Kundenname', type: 'text', placeholder: 'z.B. Citizen' },
        { key: 'customerNumber', label: 'Kundennummer', type: 'text', placeholder: 'z.B. 803023' },
        { key: 'customerProcess', label: 'Kundenprozess', type: 'text', placeholder: 'z.B. 0000167155' }
      ]
    },
    production: {
      title: 'Produktionsdaten',
      icon: ClockIcon,
      fields: [
        { key: 'productionWeek', label: 'Produktionswoche', type: 'text', placeholder: 'z.B. 49/2018' },
        { key: 'buildVariant', label: 'Bauvariante', type: 'text', placeholder: 'z.B. C' },
        { key: 'operatingVoltage', label: 'Betriebsspannung', type: 'text', placeholder: 'z.B. 200V' }
      ]
    },
    colors: {
      title: 'Farben',
      icon: SwatchIcon,
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
      fields: [
        { key: 'articleNumber', label: 'Artikelnummer', type: 'text', placeholder: 'z.B. 048-32-1541-01BC' }
      ]
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.key as keyof UpdateMagazinePropertiesCommand];
    const isEmpty = !value || (typeof value === 'string' && value.trim() === '') || value === 0;
    
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
          <>
            {field.type === 'boolean' ? (
              <div className="flex items-center space-x-3">
                <input
                  id={fieldId}
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleInputChange(field.key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
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
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
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
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
              />
            ) : (
              <input
                id={fieldId}
                type="text"
                value={value as string || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
              />
            )}
          </>
        ) : (
          <div className={`px-3 py-2 border ${
            isEmpty 
              ? 'bg-gray-50 text-gray-500 italic border-gray-200' 
              : 'bg-gray-50 text-gray-900 font-medium border-gray-200'
          }`}>
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

  const renderGroup = (groupKey: string, group: any) => {
    const isExpanded = expandedGroups.has(groupKey);
    const GroupIcon = group.icon;

    const filledFields = group.fields.filter((field: any) => {
      const value = formData[field.key as keyof UpdateMagazinePropertiesCommand];
      return value && (typeof value !== 'string' || value.trim() !== '') && value !== 0;
    });

    const visibleFields = group.fields.filter((field: any) => {
      if (isEditing || showEmptyFields) return true;
      const value = formData[field.key as keyof UpdateMagazinePropertiesCommand];
      return value && (typeof value !== 'string' || value.trim() !== '') && value !== 0;
    });

    if (!isEditing && !showEmptyFields && visibleFields.length === 0) {
      return null;
    }

    return (
      <div key={groupKey} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <button
          onClick={() => toggleGroup(groupKey)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-100 flex items-center justify-center">
              <GroupIcon className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">{group.title}</span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1">
              {filledFields.length}/{group.fields.length}
            </span>
          </div>
          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {group.fields.map((field: any) => renderField(field))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 flex items-center justify-center">
              <CogIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">Magazin-Eigenschaften</h2>
              <p className="text-gray-600 mt-1">Erweiterte Werkstattauftrag-Daten</p>
            </div>
          </div>
          
          {!readonly && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEmptyFields(!showEmptyFields)}
                className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
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
              
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium transition-all"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
                  className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Bearbeiten</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Completeness Indicator - PROFESSIONELL ohne graue Punkte */}
      {completenessData && (
        <div className="bg-blue-50 border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                <ChartBarIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Vollständigkeit</h3>
                <p className="text-blue-700 text-sm">
                  {completenessData.filledFields} von {completenessData.totalFields} Feldern ausgefüllt
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-blue-900">{completenessData.completeness}%</div>
              <div className="text-sm text-blue-700">Vollständig</div>
            </div>
          </div>
          
          {/* SAUBERER Progress Bar ohne graue Punkte */}
          <div className="w-full bg-blue-200 h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 transition-all duration-500"
              style={{ width: `${completenessData.completeness}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${completenessData.hasBasicData ? 'text-green-700' : 'text-amber-700'}`}>
              {completenessData.hasBasicData ? 'Grunddaten vorhanden' : 'Erweiterte Daten optional'}
            </span>
            <span className={`font-medium ${completenessData.hasExtendedData ? 'text-green-700' : 'text-gray-600'}`}>
              {completenessData.hasExtendedData ? 'Erweiterte Daten vorhanden' : 'Erweiterte Daten optional'}
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-red-100 flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-red-900 font-medium">Fehler beim Speichern</p>
              <p className="text-red-800 mt-1">{saveError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Property Groups */}
      <div className="space-y-4">
        {Object.entries(fieldGroups).map(([groupKey, group]) => renderGroup(groupKey, group))}
      </div>

      {/* Notes Section */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-gray-100 flex items-center justify-center">
            <DocumentTextIcon className="h-4 w-4 text-gray-600" />
          </div>
          <h3 className="font-medium text-gray-900">Zusätzliche Notizen</h3>
        </div>
        
        {isEditing ? (
          <textarea
            value={formData.magazinePropertiesNotes || ''}
            onChange={(e) => handleInputChange('magazinePropertiesNotes', e.target.value)}
            rows={4}
            placeholder="Zusätzliche Informationen zu den Magazin-Eigenschaften..."
            className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all hover:border-gray-400"
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900">
            {formData.magazinePropertiesNotes || (
              <span className="text-gray-500 italic">Keine zusätzlichen Notizen</span>
            )}
          </div>
        )}
      </div>

      {/* Metadata Footer */}
      {(machine.magazinePropertiesLastUpdated || machine.magazinePropertiesUpdatedBy) && (
        <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
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

export default MagazinePropertiesEditor;