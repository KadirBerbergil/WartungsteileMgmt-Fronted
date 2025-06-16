// src/types/api.ts - Erweitert mit allen 29+ Magazin-Eigenschaften

// Maschinen-Typen
export interface Machine {
  id: string;
  number: string;
  type: string;
  operatingHours: number;
  installationDate: string;
  status: string;
  maintenanceCount: number;
  lastMaintenanceDate: string | null;
  
  // Basis Magazin-Eigenschaften
  magazineType?: string;
  materialBarLength?: number;
  hasSynchronizationDevice?: boolean;
  feedChannel?: string;
  feedRod?: string;
  
  // ✨ NEUE ERWEITERTE MAGAZIN-EIGENSCHAFTEN (29+ Felder)
  
  // Kundendaten
  customerName?: string;
  customerNumber?: string;
  customerProcess?: string;
  
  // Produktionsdaten
  productionWeek?: string;
  
  // Farben
  baseColor?: string;
  coverColor?: string;
  switchCabinetColor?: string;
  controlPanelColor?: string;
  
  // Dokumentation
  documentationLanguage?: string;
  
  // Technische Daten
  buildVariant?: string;
  operatingVoltage?: string;
  
  // Drehmaschine
  latheManufacturer?: string;
  latheType?: string;
  latheNumber?: string;
  spindleHeight?: string;
  spindleDiameter?: string;
  
  // Elektrische Daten
  magazineNumber?: string;
  positionNumber?: string;
  controlPanel?: string;
  apm?: string;
  eprom?: string;
  circuitDiagram?: string;
  drawingList?: string;
  
  // Artikel
  articleNumber?: string;
  
  // Metadaten
  magazinePropertiesLastUpdated?: string;
  magazinePropertiesUpdatedBy?: string;
  magazinePropertiesNotes?: string;
}

export interface MachineDetail extends Machine {
  maintenanceRecords: MaintenanceRecordDetail[];
  
  // Vollständigkeits-Informationen
  magazineDataCompleteness?: number; // 0-100%
  hasBasicMagazineData?: boolean;
  hasExtendedMagazineData?: boolean;
}

// Update Magazine Properties Command (für PUT /api/Machines/{id}/magazine)
export interface UpdateMagazinePropertiesCommand {
  // Basis-Eigenschaften
  magazineType?: string;
  materialBarLength?: number;
  hasSynchronizationDevice?: boolean;
  feedChannel?: string;
  feedRod?: string;
  
  // Erweiterte Eigenschaften (alle 29+ Felder)
  customerName?: string;
  customerNumber?: string;
  customerProcess?: string;
  productionWeek?: string;
  baseColor?: string;
  coverColor?: string;
  switchCabinetColor?: string;
  controlPanelColor?: string;
  documentationLanguage?: string;
  buildVariant?: string;
  operatingVoltage?: string;
  latheManufacturer?: string;
  latheType?: string;
  latheNumber?: string;
  spindleHeight?: string;
  spindleDiameter?: string;
  magazineNumber?: string;
  positionNumber?: string;
  controlPanel?: string;
  apm?: string;
  eprom?: string;
  circuitDiagram?: string;
  drawingList?: string;
  articleNumber?: string;
  magazinePropertiesNotes?: string;
}


// Magazin-Eigenschaften Gruppierung für bessere UI-Organisation
export interface MagazinePropertiesGroups {
  basic: {
    magazineType?: string;
    materialBarLength?: number;
    hasSynchronizationDevice?: boolean;
    feedChannel?: string;
    feedRod?: string;
  };
  
  customer: {
    customerName?: string;
    customerNumber?: string;
    customerProcess?: string;
  };
  
  production: {
    productionWeek?: string;
    buildVariant?: string;
    operatingVoltage?: string;
  };
  
  colors: {
    baseColor?: string;
    coverColor?: string;
    switchCabinetColor?: string;
    controlPanelColor?: string;
  };
  
  documentation: {
    documentationLanguage?: string;
  };
  
  lathe: {
    latheManufacturer?: string;
    latheType?: string;
    latheNumber?: string;
    spindleHeight?: string;
    spindleDiameter?: string;
  };
  
  electrical: {
    magazineNumber?: string;
    positionNumber?: string;
    controlPanel?: string;
    apm?: string;
    eprom?: string;
    circuitDiagram?: string;
    drawingList?: string;
  };
  
  article: {
    articleNumber?: string;
  };
}

// Wartungsteile-Typen (unverändert)
export interface MaintenanceRecordDetail {
  id: string;
  technicianId: string;
  maintenanceType: string;
  performedAt: string;
  comments: string;
  replacedParts: ReplacedPartDetail[];
}

export interface ReplacedPartDetail {
  partId: string;
  partNumber: string;
  partName: string;
  quantity: number;
  machineOperatingHoursAtReplacement: number;
  replacementYear: number;
}

export interface MaintenancePart {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  manufacturer?: string;
  stockQuantity: number;
}

export interface MaintenancePartsList {
  machineId: string;
  machineNumber: string;
  machineType: string;
  machineProductionYear: number;
  requiredParts: MaintenancePartItem[];
  recommendedParts: MaintenancePartItem[];
}

export interface MaintenancePartItem {
  partId: string;
  partNumber: string;
  name: string;
  category: string;
  price: number;
  recommendedQuantity: number;
  maintenanceIntervalYears: number;
  isOverdue: boolean;
  lastReplacementYear?: number;
}

export interface MachinePartCompatibility {
  id: string;
  series: string;
  yearCode: string;
  modelCode: string;
  partId: string;
  partNumber: string;
  partName: string;
  isRequired: boolean;
  recommendedQuantity: number;
  maintenanceIntervalYears: number;
}

export interface CompatiblePart {
  partId: string;
  partNumber: string;
  name: string;
  description: string;
  category: string;
  price: number;
  compatibilityId: string;
  isRequired: boolean;
  recommendedQuantity: number;
  maintenanceIntervalYears: number;
}

// Utility Types für Magazin-Eigenschaften
export type MagazinePropertyKey = keyof Omit<Machine, 'id' | 'number' | 'type' | 'operatingHours' | 'installationDate' | 'status' | 'maintenanceCount' | 'lastMaintenanceDate'>;

export interface MagazinePropertyMetadata {
  key: MagazinePropertyKey;
  label: string;
  group: keyof MagazinePropertiesGroups;
  type: 'text' | 'number' | 'boolean' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Vordefinierte Magazin-Properties-Metadaten für UI-Generierung
export const MAGAZINE_PROPERTIES_METADATA: MagazinePropertyMetadata[] = [
  // Basic Group
  { key: 'magazineType', label: 'Magazin-Typ', group: 'basic', type: 'text', placeholder: 'z.B. minimag 20 S1' },
  { key: 'materialBarLength', label: 'Materialstangenlänge (mm)', group: 'basic', type: 'number', validation: { min: 0, max: 10000 } },
  { key: 'hasSynchronizationDevice', label: 'Synchroneinrichtung', group: 'basic', type: 'boolean' },
  { key: 'feedChannel', label: 'Zuführkanal', group: 'basic', type: 'text' },
  { key: 'feedRod', label: 'Vorschubstange', group: 'basic', type: 'text' },
  
  // Customer Group
  { key: 'customerName', label: 'Kundenname', group: 'customer', type: 'text' },
  { key: 'customerNumber', label: 'Kundennummer', group: 'customer', type: 'text' },
  { key: 'customerProcess', label: 'Kundenprozess', group: 'customer', type: 'text' },
  
  // Production Group
  { key: 'productionWeek', label: 'Produktionswoche', group: 'production', type: 'text', placeholder: 'KW/Jahr, z.B. 49/2018' },
  { key: 'buildVariant', label: 'Bauvariante', group: 'production', type: 'text', placeholder: 'z.B. C' },
  { key: 'operatingVoltage', label: 'Betriebsspannung', group: 'production', type: 'text', placeholder: 'z.B. 200V' },
  
  // Colors Group
  { key: 'baseColor', label: 'Grundfarbe', group: 'colors', type: 'text' },
  { key: 'coverColor', label: 'Abdeckungsfarbe', group: 'colors', type: 'text' },
  { key: 'switchCabinetColor', label: 'Schaltschrankfarbe', group: 'colors', type: 'text' },
  { key: 'controlPanelColor', label: 'Bedienfeld-Farbe', group: 'colors', type: 'text' },
  
  // Documentation Group
  { key: 'documentationLanguage', label: 'Dokumentationssprache', group: 'documentation', type: 'select', options: ['Deutsch', 'English', 'Français', 'Español'] },
  
  // Lathe Group
  { key: 'latheManufacturer', label: 'Drehmaschinen-Hersteller', group: 'lathe', type: 'text' },
  { key: 'latheType', label: 'Drehmaschinentyp', group: 'lathe', type: 'text' },
  { key: 'latheNumber', label: 'Drehmaschinen-Nummer', group: 'lathe', type: 'text' },
  { key: 'spindleHeight', label: 'Spindelhöhe', group: 'lathe', type: 'text' },
  { key: 'spindleDiameter', label: 'Spindeldurchmesser', group: 'lathe', type: 'text' },
  
  // Electrical Group
  { key: 'magazineNumber', label: 'Magazin-Nummer', group: 'electrical', type: 'text' },
  { key: 'positionNumber', label: 'Positionsnummer', group: 'electrical', type: 'text' },
  { key: 'controlPanel', label: 'Bedienfeld', group: 'electrical', type: 'text' },
  { key: 'apm', label: 'APM', group: 'electrical', type: 'text' },
  { key: 'eprom', label: 'EPROM', group: 'electrical', type: 'text' },
  { key: 'circuitDiagram', label: 'Schaltplan', group: 'electrical', type: 'text' },
  { key: 'drawingList', label: 'Zeichnungsliste', group: 'electrical', type: 'text' },
  
  // Article Group
  { key: 'articleNumber', label: 'Artikelnummer', group: 'article', type: 'text' },
];

// Helper Functions
export const getMagazinePropertyGroups = (machine: Machine): MagazinePropertiesGroups => {
  return {
    basic: {
      magazineType: machine.magazineType,
      materialBarLength: machine.materialBarLength,
      hasSynchronizationDevice: machine.hasSynchronizationDevice,
      feedChannel: machine.feedChannel,
      feedRod: machine.feedRod,
    },
    customer: {
      customerName: machine.customerName,
      customerNumber: machine.customerNumber,
      customerProcess: machine.customerProcess,
    },
    production: {
      productionWeek: machine.productionWeek,
      buildVariant: machine.buildVariant,
      operatingVoltage: machine.operatingVoltage,
    },
    colors: {
      baseColor: machine.baseColor,
      coverColor: machine.coverColor,
      switchCabinetColor: machine.switchCabinetColor,
      controlPanelColor: machine.controlPanelColor,
    },
    documentation: {
      documentationLanguage: machine.documentationLanguage,
    },
    lathe: {
      latheManufacturer: machine.latheManufacturer,
      latheType: machine.latheType,
      latheNumber: machine.latheNumber,
      spindleHeight: machine.spindleHeight,
      spindleDiameter: machine.spindleDiameter,
    },
    electrical: {
      magazineNumber: machine.magazineNumber,
      positionNumber: machine.positionNumber,
      controlPanel: machine.controlPanel,
      apm: machine.apm,
      eprom: machine.eprom,
      circuitDiagram: machine.circuitDiagram,
      drawingList: machine.drawingList,
    },
    article: {
      articleNumber: machine.articleNumber,
    },
  };
};

export const calculateMagazineDataCompleteness = (machine: Machine): number => {
  const allProperties = MAGAZINE_PROPERTIES_METADATA;
  const filledProperties = allProperties.filter(prop => {
    const value = machine[prop.key];
    return value !== undefined && value !== null && value !== '';
  });
  
  return Math.round((filledProperties.length / allProperties.length) * 100);
};

export const hasBasicMagazineData = (machine: Machine): boolean => {
  return !!(machine.magazineType || machine.materialBarLength || machine.feedChannel);
};

export const hasExtendedMagazineData = (machine: Machine): boolean => {
  return !!(machine.customerName || machine.customerNumber || machine.productionWeek || 
           machine.latheManufacturer || machine.articleNumber);
};