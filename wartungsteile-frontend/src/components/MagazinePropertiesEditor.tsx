// src/components/MagazinePropertiesEditor.tsx - REPARIERTE VERSION
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
  ChevronDownIcon,
  CheckCircleIcon,
  InformationCircleIcon
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['basic', 'customer']));
  const [showEmptyFields, setShowEmptyFields] = useState(true);
  
  const [formData, setFormData] = useState<UpdateMagazinePropertiesCommand>({});
  const [originalData, setOriginalData] = useState<UpdateMagazinePropertiesCommand>({});
  
  // ✅ REPARIERTE VOLLSTÄNDIGKEITS-BERECHNUNG - basiert auf formData statt machine
  const calculateCompleteness = () => {
    if (!formData) return { completeness: 0, totalFields: 0, filledFields: 0, hasBasicData: false, hasExtendedData: false };
    
    // Hilfsfunktion um zu prüfen ob ein Feld ausgefüllt ist
    const isFieldFilled = (value: any): boolean => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (typeof value === 'number' && value === 0) return false;
      if (typeof value === 'boolean') return true; // Boolean-Felder sind immer "ausgefüllt"
      return true;
    };

    // ✅ VERWENDE formData STATT machine - das enthält die aktuellen UI-Werte!
    const fieldGroups = [
      // Basic (5 Felder)
      { 
        name: 'Basic',
        fields: [
          formData.magazineType,
          formData.materialBarLength, 
          formData.hasSynchronizationDevice,
          formData.feedChannel,
          formData.feedRod
        ]
      },
      // Customer (3 Felder)
      {
        name: 'Customer',
        fields: [
          formData.customerName,
          formData.customerNumber,
          formData.customerProcess
        ]
      },
      // Production (3 Felder)
      {
        name: 'Production',
        fields: [
          formData.productionWeek,
          formData.buildVariant,
          formData.operatingVoltage
        ]
      },
      // Colors (4 Felder)
      {
        name: 'Colors',
        fields: [
          formData.baseColor,
          formData.coverColor,
          formData.switchCabinetColor,
          formData.controlPanelColor
        ]
      },
      // Documentation (2 Felder)
      {
        name: 'Documentation',
        fields: [
          formData.documentationLanguage,
          formData.documentationCount
        ]
      },
      // Lathe (5 Felder)
      {
        name: 'Lathe',
        fields: [
          formData.latheManufacturer,
          formData.latheType,
          formData.latheNumber,
          formData.spindleHeight,
          formData.spindleDiameter
        ]
      },
      // Electrical (7 Felder)
      {
        name: 'Electrical',
        fields: [
          formData.magazineNumber,
          formData.positionNumber,
          formData.controlPanel,
          formData.apm,
          formData.eprom,
          formData.circuitDiagram,
          formData.drawingList
        ]
      },
      // Article (1 Feld)
      {
        name: 'Article',
        fields: [
          formData.articleNumber
        ]
      }
    ];

    let totalFields = 0;
    let filledFields = 0;
    let basicFilledFields = 0;

    // Alle Gruppen durchgehen mit Debug-Info
    fieldGroups.forEach((group, groupIndex) => {
      let groupFilled = 0;
      group.fields.forEach(fieldValue => {
        totalFields++;
        if (isFieldFilled(fieldValue)) {
          filledFields++;
          groupFilled++;
          // Erste Gruppe = Basis-Eigenschaften
          if (groupIndex === 0) {
            basicFilledFields++;
          }
        }
      });
      console.log(`  ${group.name}: ${groupFilled}/${group.fields.length} ausgefüllt`);
    });

    const completeness = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    const hasBasicData = basicFilledFields >= 3; // Mindestens 3 von 5 Basis-Feldern
    const hasExtendedData = filledFields > basicFilledFields; // Mehr als nur Basis-Felder

    // Debug-Ausgabe für Verifikation
    console.log(`🧮 KORREKTE Vollständigkeits-Berechnung (basiert auf formData):`, {
      totalFields,
      filledFields,
      basicFilledFields,
      completeness: `${completeness}%`,
      hasBasicData,
      hasExtendedData
    });

    return {
      completeness,
      totalFields,
      filledFields,
      hasBasicData,
      hasExtendedData
    };
  };

  // ✅ DIREKTE BERECHNUNG
  const completenessData = calculateCompleteness();

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
    // ✅ loadCompletenessData() entfernt - wird jetzt direkt berechnet
  }, [machine]);

  // ✅ REPARIERTE loadCompletenessData entfernt - nicht mehr nötig

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
      // ✅ Vereinfachte Validierung (falls machineService.validateMagazineProperties nicht existiert)
      const hasRequiredFields = formData.magazineType && formData.magazineType.trim().length > 0;
      if (!hasRequiredFields) {
        setSaveError('Mindestens der Magazin-Typ muss angegeben werden');
        return;
      }
      
      const result = await machineService.updateMagazineProperties(machine.id, formData);
      
      if (result.success) {
        setOriginalData(formData);
        setIsEditing(false);
        
        // ✅ Keine loadCompletenessData mehr nötig - automatische Neuberechnung
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

  // DEZENTES FIELD RENDERING - Professionell und subtil
  const renderField = (field: any) => {
    const value = formData[field.key as keyof UpdateMagazinePropertiesCommand];
    const isEmpty = !value || (typeof value === 'string' && value.trim() === '') || value === 0;
    
    if (!showEmptyFields && isEmpty && !isEditing) {
      return null;
    }

    const fieldId = `field-${field.key}`;
    
    return (
      <div key={field.key} className="space-y-2">
        <label htmlFor={fieldId} className="flex items-center justify-between text-sm font-medium text-gray-900">
          <span>{field.label}</span>
          {!isEditing && (
            <span className={`text-xs px-2 py-1 rounded ${
              isEmpty 
                ? 'text-amber-700 bg-amber-50' 
                : 'text-green-700 bg-green-50'
            }`}>
              {isEmpty ? 'Offen' : 'Erfasst'}
            </span>
          )}
        </label>
        
        {isEditing ? (
          // EDITING MODE - Saubere Inputs
          <div>
            {field.type === 'boolean' ? (
              <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded hover:border-gray-300 transition-colors">
                <input
                  id={fieldId}
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleInputChange(field.key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-900">
                  {value ? 'Ja, vorhanden' : 'Nein, nicht vorhanden'}
                </span>
              </div>
            ) : field.type === 'select' ? (
              <select
                id={fieldId}
                value={value as string || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
              >
                {field.options?.map((option: string) => (
                  <option key={option} value={option}>
                    {option || 'Bitte auswählen...'}
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
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
              />
            ) : (
              <input
                id={fieldId}
                type="text"
                value={value as string || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
              />
            )}
          </div>
        ) : (
          // DISPLAY MODE - Dezent und professionell
          <div className={`group cursor-pointer border transition-all ${
            isEmpty 
              ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`} onClick={() => !readonly && setIsEditing(true)}>
            
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3 flex-1">
                {/* Subtiler Status-Indikator */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isEmpty ? 'bg-amber-400' : 'bg-green-500'
                }`}></div>
                
                <div className="flex-1 min-w-0">
                  {field.type === 'boolean' ? (
                    <span className={`text-sm ${isEmpty ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {value ? 'Ja, vorhanden' : isEmpty ? 'Nicht angegeben' : 'Nein'}
                    </span>
                  ) : field.type === 'number' && field.key === 'materialBarLength' ? (
                    <span className={`text-sm ${isEmpty ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {value ? `${value} mm` : 'Nicht angegeben'}
                    </span>
                  ) : (
                    <span className={`text-sm truncate block ${isEmpty ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {(value as string) || 'Nicht angegeben'}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Dezenter Edit-Hinweis */}
              {!readonly && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <PencilIcon className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Dezenter Hinweis für leere Felder */}
            {isEmpty && !readonly && (
              <div className="px-3 pb-3">
                <p className="text-xs text-gray-500">
                  Klicken zum Bearbeiten
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // DEZENTE GRUPPEN-DARSTELLUNG
  const renderGroup = (groupKey: string, group: any) => {
    const isExpanded = expandedGroups.has(groupKey);
    const GroupIcon = group.icon;

    const filledFields = group.fields.filter((field: any) => {
      const value = formData[field.key as keyof UpdateMagazinePropertiesCommand];
      return value && (typeof value !== 'string' || value.trim() !== '') && value !== 0;
    });

    const isEmpty = filledFields.length === 0;
    const completionPercentage = Math.round((filledFields.length / group.fields.length) * 100);

    return (
      <div key={groupKey} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
        
        {/* Dezenter Group Header */}
        <button
          onClick={() => toggleGroup(groupKey)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 flex items-center justify-center ${
              isEmpty 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <GroupIcon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{group.title}</h3>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-gray-600">
                  {filledFields.length}/{group.fields.length} ausgefüllt
                </span>
                <span className={`text-sm font-medium ${
                  completionPercentage === 100 
                    ? 'text-green-600' 
                    : completionPercentage > 0 
                      ? 'text-amber-600' 
                      : 'text-gray-500'
                }`}>
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Dezenter Status-Indikator */}
            <div className={`w-3 h-3 rounded-full ${
              completionPercentage === 100 
                ? 'bg-green-500' 
                : completionPercentage > 0 
                  ? 'bg-amber-400' 
                  : 'bg-gray-300'
            }`}></div>
            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`} />
          </div>
        </button>
        
        {/* Group Content */}
        {isExpanded && (
          <div className="px-6 pb-6 bg-gray-50">
            
            {/* Dezenter Progress Bar */}
            <div className="mb-6 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Fortschritt</span>
                <span className="text-sm font-medium text-gray-900">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    completionPercentage === 100 
                      ? 'bg-green-500' 
                      : completionPercentage > 0 
                        ? 'bg-amber-400' 
                        : 'bg-gray-300'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Fields Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {group.fields.map((field: any) => renderField(field))}
            </div>
            
            {/* Dezenter Hinweis für leere Gruppen */}
            {isEmpty && !isEditing && !readonly && (
              <div className="mt-6 p-4 bg-white border border-gray-200 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <InformationCircleIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {group.title} nicht konfiguriert
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Klicken Sie auf "Bearbeiten" um diese Daten zu ergänzen
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-colors"
                  >
                    Bearbeiten
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Field Groups Definition (unverändert)
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

  return (
    <div className="space-y-6">
      {/* DEZENTER HEADER - Professionell und zurückhaltend */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-900 flex items-center justify-center">
              <CogIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Magazin-Eigenschaften</h2>
              <p className="text-gray-600 mt-1">Erweiterte Werkstattauftrag-Daten</p>
            </div>
          </div>
          
          {!readonly && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowEmptyFields(!showEmptyFields)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
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
                    className="inline-flex items-center space-x-2 px-6 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium transition-colors"
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
                  className="inline-flex items-center space-x-2 px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Bearbeiten</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ KOMPLETT REPARIERTE COMPLETENESS INDICATOR */}
      <div className="bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
              <ChartBarIcon className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Vollständigkeit</h3>
              <p className="text-gray-600 text-sm">
                {completenessData.filledFields} von {completenessData.totalFields} Feldern ausgefüllt
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-gray-900">
              {completenessData.completeness}%
            </div>
            <div className="text-sm text-gray-600">Vollständig</div>
          </div>
        </div>
        
        {/* Professioneller Progress Bar */}
        <div className="w-full bg-gray-200 h-2 mb-4">
          <div 
            className="bg-gray-700 h-2 transition-all duration-500"
            style={{ width: `${completenessData.completeness}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center space-x-2 px-3 py-1 ${
            completenessData.hasBasicData 
              ? 'text-green-700 bg-green-50' 
              : 'text-amber-700 bg-amber-50'
          }`}>
            {completenessData.hasBasicData ? (
              <CheckCircleIcon className="w-4 h-4" />
            ) : (
              <ExclamationTriangleIcon className="w-4 h-4" />
            )}
            <span className="font-medium">
              {completenessData.hasBasicData ? 'Grunddaten vorhanden' : 'Grunddaten fehlen'}
            </span>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-1 ${
            completenessData.hasExtendedData 
              ? 'text-green-700 bg-green-50' 
              : 'text-gray-600 bg-gray-50'
          }`}>
            {completenessData.hasExtendedData ? (
              <CheckCircleIcon className="w-4 w-4" />
            ) : (
              <InformationCircleIcon className="w-4 h-4" />
            )}
            <span className="font-medium">
              {completenessData.hasExtendedData ? 'Erweiterte Daten vorhanden' : 'Erweiterte Daten optional'}
            </span>
          </div>
        </div>
      </div>

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

      {/* PROPERTY GROUPS - Dezent und professionell */}
      <div className="space-y-4">
        {Object.entries(fieldGroups).map(([groupKey, group]) => renderGroup(groupKey, group))}
      </div>

      {/* NOTES SECTION */}
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
            className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all hover:border-gray-300"
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 text-gray-900">
            {formData.magazinePropertiesNotes || (
              <span className="text-gray-500 italic">Keine zusätzlichen Notizen</span>
            )}
          </div>
        )}
      </div>

      {/* METADATA FOOTER */}
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