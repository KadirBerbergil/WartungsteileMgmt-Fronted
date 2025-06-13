import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { BackupProgressModal } from './BackupProgressModal';
import { backupService, BackupInfo, BackupStatus, BackupProgress } from '../../services/backupService';
import { 
  Download, 
  Upload, 
  Trash2, 
  HardDrive, 
  Database, 
  Code, 
  Layout,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Save,
  FolderOpen,
  Server
} from 'lucide-react';

interface BackupManagementProps {
  onBackupCreated?: () => void;
}

export const BackupManagement: React.FC<BackupManagementProps> = ({ onBackupCreated }) => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeBackupId, setActiveBackupId] = useState<string | null>(null);
  const [activeBackups, setActiveBackups] = useState<BackupProgress[]>([]);
  
  // Create Backup Form
  const [backupType, setBackupType] = useState<'full' | 'database' | 'backend' | 'frontend'>('full');
  const [backupDescription, setBackupDescription] = useState('');
  
  // Alerts
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadData();
    
    // Lade aktive Backups
    const loadActiveBackups = async () => {
      try {
        const active = await backupService.getActiveBackups();
        setActiveBackups(active);
      } catch (error) {
        console.error('Fehler beim Laden aktiver Backups:', error);
      }
    };
    
    loadActiveBackups();
    
    // Polling für aktive Backups
    const interval = setInterval(loadActiveBackups, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [backupList, backupStatus] = await Promise.all([
        backupService.getBackupList(),
        backupService.getBackupStatus()
      ]);
      setBackups(backupList);
      setStatus(backupStatus);
    } catch (error) {
      console.error('Fehler beim Laden der Backup-Daten:', error);
      setAlert({ type: 'error', message: 'Fehler beim Laden der Backup-Daten' });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setCreating(true);
      setAlert(null);
      
      const result = await backupService.createBackup({
        type: backupType,
        description: backupDescription
      });
      
      setShowCreateModal(false);
      setBackupDescription('');
      setActiveBackupId(result.backupId);
      
      if (onBackupCreated) {
        onBackupCreated();
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Backups:', error);
      setAlert({ type: 'error', message: 'Fehler beim Erstellen des Backups' });
    } finally {
      setCreating(false);
    }
  };

  const deleteBackup = async (fileName: string) => {
    if (!confirm('Möchten Sie dieses Backup wirklich löschen?')) {
      return;
    }

    try {
      await backupService.deleteBackup(fileName);
      setAlert({ type: 'success', message: 'Backup erfolgreich gelöscht' });
      await loadData();
    } catch (error) {
      console.error('Fehler beim Löschen des Backups:', error);
      setAlert({ type: 'error', message: 'Fehler beim Löschen des Backups' });
    }
  };

  const restoreBackup = async (backup: BackupInfo) => {
    if (!confirm(`WARNUNG: Diese Aktion wird die aktuelle Installation überschreiben!\n\nMöchten Sie wirklich das Backup vom ${new Date(backup.timestamp).toLocaleString('de-DE')} wiederherstellen?`)) {
      return;
    }

    try {
      setAlert({ type: 'info', message: 'Wiederherstellung wird gestartet... Dies kann einige Minuten dauern.' });
      
      const fileName = backup.file.split('\\').pop() || backup.file;
      await backupService.restoreBackup(fileName, { type: 'full', force: true });
      
      setAlert({ type: 'success', message: 'Wiederherstellung erfolgreich! Bitte starten Sie die Anwendung neu.' });
      setShowRestoreModal(false);
    } catch (error) {
      console.error('Fehler bei der Wiederherstellung:', error);
      setAlert({ type: 'error', message: 'Fehler bei der Wiederherstellung' });
    }
  };

  const getBackupIcon = (type: string) => {
    switch (type) {
      case 'full': return <Save className="h-5 w-5" />;
      case 'database': return <Database className="h-5 w-5" />;
      case 'backend': return <Server className="h-5 w-5" />;
      case 'frontend': return <Layout className="h-5 w-5" />;
      default: return <FolderOpen className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      {status && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Backup-System Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${status.backupRootExists ? 'bg-green-100' : 'bg-red-100'}`}>
                  {status.backupRootExists ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Backup-Verzeichnis</p>
                  <p className="font-medium">{status.backupRootExists ? 'Verfügbar' : 'Nicht gefunden'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Anzahl Backups</p>
                  <p className="font-medium">{status.backupCount}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <HardDrive className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Freier Speicher</p>
                  <p className="font-medium">{backupService.formatFileSize(status.freeSpace)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Alert */}
      {alert && (
        <Alert 
          variant={alert.type === 'error' ? 'error' : alert.type === 'success' ? 'success' : 'default'}
          className="mb-4"
        >
          <div className="flex items-center gap-2">
            {alert.type === 'error' && <AlertTriangle className="h-4 w-4" />}
            {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {alert.type === 'info' && <Info className="h-4 w-4" />}
            <span>{alert.message}</span>
          </div>
        </Alert>
      )}
      
      {/* Aktive Backups */}
      {activeBackups.length > 0 && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Laufende Backups
            </h3>
            <div className="space-y-2">
              {activeBackups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={backupService.getBackupTypeColor(backup.type)}>
                      {backupService.getBackupTypeLabel(backup.type)}
                    </Badge>
                    <span className="text-sm text-gray-600">{backup.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${backup.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{backup.percentage}%</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveBackupId(backup.id)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Backup-Verwaltung</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => loadData()}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700"
            disabled={creating}
          >
            <Download className="h-4 w-4 mr-2" />
            Backup erstellen
          </Button>
        </div>
      </div>

      {/* Backup List */}
      <Card>
        <div className="p-6">
          {backups.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Keine Backups vorhanden</p>
              <p className="text-sm text-gray-400 mt-2">Erstellen Sie Ihr erstes Backup</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.timestamp} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${backupService.getBackupTypeColor(backup.type).replace('text-', 'bg-').replace('-600', '-100')}`}>
                        {getBackupIcon(backup.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {new Date(backup.timestamp).toLocaleString('de-DE')}
                        </h4>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge className={backupService.getBackupTypeColor(backup.type)}>
                            {backupService.getBackupTypeLabel(backup.type)}
                          </Badge>
                          <span className="text-sm text-gray-500">{backup.size}</span>
                          {backup.description && (
                            <span className="text-sm text-gray-600">{backup.description}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBackup(backup);
                          setShowRestoreModal(true);
                        }}
                        title="Wiederherstellen"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBackup(backup.file.split('\\').pop() || backup.file)}
                        className="text-red-600 hover:bg-red-50"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Neues Backup erstellen</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup-Typ
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['full', 'database', 'backend', 'frontend'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setBackupType(type)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        backupType === type
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {getBackupIcon(type)}
                        <span className="text-sm">{backupService.getBackupTypeLabel(type)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung (optional)
                </label>
                <Input
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="z.B. Vor Update auf Version 2.0"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setBackupDescription('');
                }}
              >
                Abbrechen
              </Button>
              <Button
                onClick={createBackup}
                disabled={creating}
                className="bg-green-600 hover:bg-green-700"
              >
                {creating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Erstelle...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Backup erstellen
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Backup wiederherstellen</h3>
            
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <span className="ml-2">
                WARNUNG: Diese Aktion überschreibt alle aktuellen Daten!
              </span>
            </Alert>
            
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Backup:</strong> {new Date(selectedBackup.timestamp).toLocaleString('de-DE')}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Typ:</strong> {backupService.getBackupTypeLabel(selectedBackup.type)}
              </p>
              {selectedBackup.description && (
                <p className="text-sm text-gray-600">
                  <strong>Beschreibung:</strong> {selectedBackup.description}
                </p>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackup(null);
                }}
              >
                Abbrechen
              </Button>
              <Button
                onClick={() => restoreBackup(selectedBackup)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Wiederherstellen
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Progress Modal */}
      {activeBackupId && (
        <BackupProgressModal
          backupId={activeBackupId}
          onClose={() => setActiveBackupId(null)}
          onComplete={(success) => {
            if (success) {
              setAlert({ type: 'success', message: 'Backup erfolgreich erstellt!' });
              setTimeout(() => loadData(), 1000);
            } else {
              setAlert({ type: 'error', message: 'Backup fehlgeschlagen. Bitte Logs prüfen.' });
            }
          }}
        />
      )}
    </div>
  );
};