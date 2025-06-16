import { api } from './api';

export interface BackupInfo {
  timestamp: string;
  file?: string;
  fileName?: string;
  filePath?: string;
  size: string;
  type: 'full' | 'database' | 'backend' | 'frontend';
  description: string;
  id?: string;
}

export interface BackupStatus {
  backupRoot: string;
  backupRootExists: boolean;
  scriptPath: string;
  scriptsExist: boolean;
  freeSpace: number;
  backupCount: number;
}

export interface CreateBackupRequest {
  type: 'full' | 'database' | 'backend' | 'frontend';
  description: string;
}

export interface BackupProgress {
  id: string;
  type: string;
  description: string;
  startTime: string;
  endTime?: string;
  lastUpdate: string;
  percentage: number;
  status: string;
  currentStep?: string;
  steps: BackupStep[];
  isActive: boolean;
  isCompleted: boolean;
  success: boolean;
  message?: string;
  filePath?: string;
  fileSize?: string;
}

export interface BackupStep {
  name: string;
  timestamp: string;
  completed: boolean;
}

export interface RestoreBackupRequest {
  type?: 'full' | 'database' | 'backend' | 'frontend';
  force?: boolean;
}

class BackupService {
  async getBackupList(): Promise<BackupInfo[]> {
    const response = await api.get('/backup/list');
    console.log('Raw API Response für backup/list:', response);
    console.log('Response data:', response.data);
    return response.data;
  }

  async createBackup(request: CreateBackupRequest): Promise<{ message: string; type: string; backupId: string }> {
    const response = await api.post('/backup/create', request);
    return response.data;
  }

  async createCompleteBackup(request: CreateBackupRequest): Promise<{ message: string; backupId: string; fileName: string; size: string }> {
    const response = await api.post('/backup/create-complete', request);
    return response.data;
  }

  async restoreBackup(fileName: string, request: RestoreBackupRequest): Promise<{ message: string; output: string }> {
    const response = await api.post(`/backup/restore/${encodeURIComponent(fileName)}`, request);
    return response.data;
  }

  async deleteBackup(fileName: string): Promise<{ message: string }> {
    const response = await api.delete(`/backup/${encodeURIComponent(fileName)}`);
    return response.data;
  }

  async getBackupStatus(): Promise<BackupStatus> {
    const response = await api.get('/backup/status');
    return response.data;
  }

  // Hilfsfunktionen
  formatFileSize(bytes: number): string {
    if (bytes < 0) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  getBackupTypeLabel(type: string): string {
    switch (type) {
      case 'full': return 'Vollständig';
      case 'database': return 'Nur Datenbank';
      case 'backend': return 'Nur Backend';
      case 'frontend': return 'Nur Frontend';
      default: return type;
    }
  }

  getBackupTypeColor(type: string): string {
    switch (type) {
      case 'full': return 'text-green-600 bg-green-100';
      case 'database': return 'text-blue-600 bg-blue-100';
      case 'backend': return 'text-purple-600 bg-purple-100';
      case 'frontend': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
  
  async getBackupProgress(backupId: string): Promise<BackupProgress> {
    const response = await api.get(`/backup/progress/${backupId}`);
    return response.data;
  }
  
  async getActiveBackups(): Promise<BackupProgress[]> {
    const response = await api.get('/backup/active');
    return response.data;
  }
}

export const backupService = new BackupService();