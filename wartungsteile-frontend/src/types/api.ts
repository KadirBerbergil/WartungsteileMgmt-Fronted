// src/types/api.ts

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
}

export interface MachineDetail {
  id: string;
  number: string;
  type: string;
  operatingHours: number;
  installationDate: string;
  status: string;
  magazineType: string;
  materialBarLength: number;
  hasSynchronizationDevice: boolean;
  feedChannel: string;
  feedRod: string;
  maintenanceRecords: MaintenanceRecordDetail[];
}

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

// Wartungsteile-Typen
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

// Wartungsteile-Listen-Typen
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

// Kompatibilitäts-Typen
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