import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { backupService, BackupProgress } from '../../services/backupService';
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  Clock, 
  Activity,
  Database,
  Server,
  Layout,
  Archive,
  ChevronRight
} from 'lucide-react';

interface BackupProgressModalProps {
  backupId: string;
  onClose: () => void;
  onComplete?: (success: boolean) => void;
}

export const BackupProgressModal: React.FC<BackupProgressModalProps> = ({ 
  backupId, 
  onClose, 
  onComplete 
}) => {
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let completed = false;

    const fetchProgress = async () => {
      try {
        const data = await backupService.getBackupProgress(backupId);
        setProgress(data);

        if (data.isCompleted && !completed) {
          completed = true;
          if (onComplete) {
            onComplete(data.success);
          }
          // Nach Abschluss noch 3 Sekunden warten, dann Modal schließen
          if (data.success) {
            setTimeout(() => onClose(), 3000);
          }
        }
      } catch (err) {
        console.error('Fehler beim Abrufen des Fortschritts:', err);
        setError('Fehler beim Abrufen des Backup-Fortschritts');
      }
    };

    // Initiales Laden
    fetchProgress();

    // Polling alle 500ms für schnelle Updates
    interval = setInterval(fetchProgress, 500);

    return () => {
      clearInterval(interval);
    };
  }, [backupId, onClose, onComplete]);

  const getStepIcon = (stepName: string) => {
    if (stepName.toLowerCase().includes('datenbank')) return <Database className="h-4 w-4" />;
    if (stepName.toLowerCase().includes('backend')) return <Server className="h-4 w-4" />;
    if (stepName.toLowerCase().includes('frontend')) return <Layout className="h-4 w-4" />;
    if (stepName.toLowerCase().includes('komprim')) return <Archive className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="max-w-md w-full">
          <div className="p-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700">Fehler</h3>
              <p className="text-gray-600 mt-2">{error}</p>
            </div>
            <Button onClick={onClose} className="w-full mt-4">
              Schließen
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Lade Backup-Fortschritt...</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const duration = progress.endTime 
    ? new Date(progress.endTime).getTime() - new Date(progress.startTime).getTime()
    : Date.now() - new Date(progress.startTime).getTime();
  const durationSeconds = Math.floor(duration / 1000);
  const durationMinutes = Math.floor(durationSeconds / 60);
  const remainingSeconds = durationSeconds % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold">
                Backup {progress.isCompleted ? 'abgeschlossen' : 'läuft...'}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <Badge className={backupService.getBackupTypeColor(progress.type)}>
                  {backupService.getBackupTypeLabel(progress.type)}
                </Badge>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{durationMinutes}:{remainingSeconds.toString().padStart(2, '0')}</span>
                </div>
              </div>
            </div>
            
            {progress.isCompleted && (
              <div>
                {progress.success ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{progress.status}</span>
              <span className="text-gray-600">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${
                  progress.success ? 'bg-green-600' : 
                  progress.isCompleted && !progress.success ? 'bg-red-600' : 
                  'bg-blue-600'
                }`}
                style={{ width: `${progress.percentage}%` }}
              >
                <div className="h-full bg-white bg-opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Aktuelle Aufgabe */}
          {progress.currentStep && !progress.isCompleted && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="font-medium">Aktuell: {progress.currentStep}</span>
              </div>
            </div>
          )}

          {/* Schritte */}
          <div className="mb-6 max-h-48 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Fortschritt im Detail:</h4>
            <div className="space-y-2">
              {progress.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className={`p-1.5 rounded ${
                    step.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {getStepIcon(step.name)}
                  </div>
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                  <span className={step.completed ? 'text-gray-700' : 'text-gray-500'}>
                    {step.name}
                  </span>
                  {step.completed && (
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Abschluss-Nachricht */}
          {progress.isCompleted && (
            <div className={`p-4 rounded-lg mb-6 ${
              progress.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <h4 className="font-medium mb-1">
                {progress.success ? 'Backup erfolgreich erstellt!' : 'Backup fehlgeschlagen'}
              </h4>
              {progress.message && (
                <p className="text-sm">{progress.message}</p>
              )}
              {progress.fileSize && (
                <p className="text-sm mt-2">
                  Größe: <span className="font-medium">{progress.fileSize}</span>
                </p>
              )}
            </div>
          )}

          {/* Aktionen */}
          <div className="flex justify-end gap-2">
            {!progress.isCompleted && (
              <Button variant="outline" onClick={onClose}>
                Im Hintergrund fortsetzen
              </Button>
            )}
            {progress.isCompleted && (
              <Button 
                onClick={onClose}
                className={progress.success ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Schließen
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};