import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  AcademicCapIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  ChartBarIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import api from '../../services/api';

interface ModelTrainingPanelProps {
  onModelTrained?: (modelId: string) => void;
}

interface TrainingFile {
  file: File;
  id: string;
  labelFile?: File;
}

interface TrainingProgress {
  status: 'idle' | 'uploading' | 'training' | 'completed' | 'error';
  currentStep: string;
  progress: number;
  error?: string;
}

interface TrainedModel {
  modelId: string;
  modelName: string;
  createdAt: string;
  status: string;
  accuracy?: number;
}

const ModelTrainingPanel: React.FC<ModelTrainingPanelProps> = ({ onModelTrained }) => {
  const [trainingFiles, setTrainingFiles] = useState<TrainingFile[]>([]);
  const [modelName, setModelName] = useState('');
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress>({
    status: 'idle',
    currentStep: '',
    progress: 0
  });
  const [trainedModels, setTrainedModels] = useState<TrainedModel[]>([]);
  const [prebuiltModels, setPrebuiltModels] = useState<TrainedModel[]>([]);
  const [showPrebuilt, setShowPrebuilt] = useState(false);
  const [modelApiAvailable, setModelApiAvailable] = useState(false);

  useEffect(() => {
    // Models laden wenn Komponente geladen wird
    loadTrainedModels();
  }, []);

  const loadTrainedModels = async () => {
    try {
      const response = await api.get('/ModelTraining/models');
      // Trenne Custom Models von Prebuilt Models
      const allModels = response.data;
      const customModels = allModels.filter((model: TrainedModel) => 
        !model.modelId.startsWith('prebuilt-')
      );
      const prebuilt = allModels.filter((model: TrainedModel) => 
        model.modelId.startsWith('prebuilt-')
      );
      
      setTrainedModels(customModels);
      setPrebuiltModels(prebuilt);
      setModelApiAvailable(true);
    } catch (error: any) {
      console.error('Error loading models:', error);
      // Wenn der Endpunkt nicht existiert, zeige einfach keine Modelle an
      if (error.response?.status === 404) {
        console.log('Model training endpoint not available yet');
        setTrainedModels([]);
        setPrebuiltModels([]);
        setModelApiAvailable(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9)
      }));
      setTrainingFiles(prev => [...prev, ...newFiles]);
    }
  });

  const handleLabelFileUpload = (fileId: string, labelFile: File) => {
    setTrainingFiles(prev => 
      prev.map(tf => 
        tf.id === fileId ? { ...tf, labelFile } : tf
      )
    );
  };

  const removeFile = (fileId: string) => {
    setTrainingFiles(prev => prev.filter(tf => tf.id !== fileId));
  };

  const startTraining = async () => {
    if (trainingFiles.length < 5) {
      alert('Mindestens 5 Trainingsdokumente erforderlich');
      return;
    }
    
    // Warnung bei vielen Dateien
    if (trainingFiles.length > 50) {
      const proceed = confirm(
        `Sie haben ${trainingFiles.length} Dateien ausgewählt. Das Training kann mehrere Minuten dauern.\n\n` +
        `Azure Form Recognizer empfiehlt 5-50 Dokumente für optimale Ergebnisse.\n\n` +
        `Möchten Sie fortfahren?`
      );
      if (!proceed) return;
    }

    console.log(`Starte Training mit ${trainingFiles.length} Dateien`);
    
    setTrainingProgress({
      status: 'uploading',
      currentStep: `${trainingFiles.length} Dokumente werden hochgeladen...`,
      progress: 10
    });

    // Bereinige Modellnamen für Azure (nur alphanumerisch und Bindestriche)
    const cleanModelName = (modelName || `werkstatt-model-${new Date().toISOString().slice(0,10)}`)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')  // Ersetze ungültige Zeichen mit Bindestrich
      .replace(/-+/g, '-')           // Mehrere Bindestriche zu einem
      .replace(/^-|-$/g, '');        // Entferne führende/abschließende Bindestriche
    
    console.log(`Original Name: ${modelName}, Bereinigt: ${cleanModelName}`);
    
    const formData = new FormData();
    formData.append('modelName', cleanModelName);
    
    // Größe der Dateien berechnen
    let totalSize = 0;
    trainingFiles.forEach((tf, index) => {
      formData.append('trainingFiles', tf.file);
      totalSize += tf.file.size;
      if (tf.labelFile) {
        formData.append('labelFiles', tf.labelFile);
      }
    });
    
    console.log(`Gesamtgröße: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    try {
      if (modelApiAvailable) {
        // Verwende echte API
        console.log('Sende Daten an API...');
        
        setTrainingProgress({
          status: 'uploading',
          currentStep: `Lade ${trainingFiles.length} PDFs hoch (${(totalSize / 1024 / 1024).toFixed(2)} MB)...`,
          progress: 20
        });

        // Erhöhe Timeout für große Uploads
        const response = await api.post('/ModelTraining/train', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 600000, // 10 Minuten Timeout für große Uploads
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setTrainingProgress({
              status: 'uploading',
              currentStep: `Upload: ${percentCompleted}% (${trainingFiles.length} Dateien)`,
              progress: Math.min(20 + (percentCompleted * 0.3), 50)
            });
          }
        });

        console.log('Upload abgeschlossen, Training läuft...');
        
        setTrainingProgress({
          status: 'training',
          currentStep: 'Azure Form Recognizer trainiert das Modell (kann mehrere Minuten dauern)...',
          progress: 60
        });
        
        // Polling für Training-Status (wenn Response eine Operation ID hat)
        if (response.data.operationId) {
          // Hier könnte man den Status pollen
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        console.log('Training Response:', response.data);
        
        // Prüfe ob Training erfolgreich war
        if (response.data.success === false) {
          throw new Error(response.data.errors?.join(', ') || 'Training fehlgeschlagen');
        }
        
        const modelId = response.data.modelId || response.data.ModelId;
        const modelName = response.data.modelName || response.data.ModelName || 'Unbekannt';
        
        setTrainingProgress({
          status: 'completed',
          currentStep: modelId 
            ? `Training erfolgreich! Model: ${modelName} (ID: ${modelId})`
            : `Training abgeschlossen. Prüfe die Modellliste für Details.`,
          progress: 100
        });

        // Warte kurz, dann lade Modelle neu
        setTimeout(async () => {
          await loadTrainedModels();
          
          // Scrolle zur Modellliste
          const modelsSection = document.querySelector('[data-section="trained-models"]');
          if (modelsSection) {
            modelsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 1000);

        if (onModelTrained && modelId) {
          onModelTrained(modelId);
        }
      } else {
        // Fallback auf Simulation
        const steps = [
          { step: 'Dokumente werden analysiert...', progress: 30 },
          { step: 'Felder werden extrahiert...', progress: 50 },
          { step: 'Modell wird trainiert...', progress: 70 },
          { step: 'Modell wird optimiert...', progress: 90 }
        ];

        for (const { step, progress } of steps) {
          setTrainingProgress({
            status: 'training',
            currentStep: step,
            progress
          });
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        setTrainingProgress({
          status: 'completed',
          currentStep: 'Training simuliert - Backend-Endpunkt noch nicht verfügbar',
          progress: 100
        });

        // Simuliere Modell-Speicherung
        const simulatedModel: TrainedModel = {
          modelId: `model_${Date.now()}`,
          modelName: modelName || `Model_${new Date().toLocaleDateString()}`,
          createdAt: new Date().toISOString(),
          status: 'Ready',
          accuracy: Math.floor(Math.random() * 10) + 90
        };
        
        setTrainedModels(prev => [...prev, simulatedModel]);

        if (onModelTrained) {
          onModelTrained(simulatedModel.modelId);
        }
      }
      
      // Reset form nach Erfolg
      if (trainingProgress.status === 'completed') {
        setTimeout(() => {
          setTrainingFiles([]);
          setModelName('');
          setTrainingProgress({
            status: 'idle',
            currentStep: '',
            progress: 0
          });
        }, 5000);
      }

    } catch (error: any) {
      console.error('Training error:', error);
      
      let errorMessage = 'Training fehlgeschlagen.';
      if (error.response?.status === 413) {
        errorMessage = 'Die Dateien sind zu groß. Bitte reduzieren Sie die Anzahl der PDFs.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || 'Ungültige Trainingsdaten.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Zeitüberschreitung beim Upload. Bitte versuchen Sie es mit weniger Dateien.';
      } else {
        errorMessage = error.response?.data?.error || error.message || 'Training fehlgeschlagen.';
      }
      
      setTrainingProgress({
        status: 'error',
        currentStep: 'Fehler beim Training',
        progress: 0,
        error: errorMessage
      });
    }
  };

  const deleteModel = async (modelId: string) => {
    if (!confirm('Modell wirklich löschen?')) return;

    try {
      if (modelApiAvailable) {
        // Verwende echte API
        await api.delete(`/ModelTraining/models/${modelId}`);
        // Lade Modelle neu
        await loadTrainedModels();
      } else {
        // Simuliere Löschung ohne Backend
        setTrainedModels(prev => prev.filter(model => model.modelId !== modelId));
      }
    } catch (error: any) {
      console.error('Error deleting model:', error);
      alert('Fehler beim Löschen des Modells');
    }
  };

  return (
    <div className="space-y-6">
      {/* API Status Banner */}
      {!modelApiAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Model Training API nicht verfügbar
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Simulationsmodus aktiv. Bitte starten Sie das Backend für volle Funktionalität.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Training Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold">KI-Modell Training</h2>
          </div>
          {modelApiAvailable && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              API Verbunden
            </span>
          )}
        </div>

        <div className="space-y-4">
          {/* Model Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modellname (optional)
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="z.B. werkstatt-2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              pattern="[a-zA-Z0-9-_]+"
              title="Nur Buchstaben, Zahlen, Bindestriche und Unterstriche erlaubt"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nur Buchstaben, Zahlen und Bindestriche. Keine Leerzeichen oder Sonderzeichen.
            </p>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trainingsdokumente (min. 5 PDFs)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Dateien hier ablegen...'
                  : 'PDFs hierher ziehen oder klicken zum Auswählen'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Nur PDF-Dateien • Min. 5 Dokumente für optimale Ergebnisse
              </p>
            </div>
          </div>

          {/* File List */}
          {trainingFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Hochgeladene Dateien ({trainingFiles.length})
              </p>
              {trainingFiles.map((tf) => (
                <div key={tf.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tf.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(tf.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(tf.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Label Upload */}
                  <div className="mt-2">
                    <label className="text-xs text-gray-600">
                      Label-Datei (optional):
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLabelFileUpload(tf.id, file);
                        }}
                        className="ml-2 text-xs"
                      />
                    </label>
                    {tf.labelFile && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {tf.labelFile.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Training Progress */}
          {trainingProgress.status !== 'idle' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                {trainingProgress.status === 'training' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
                )}
                {trainingProgress.status === 'completed' && (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                )}
                {trainingProgress.status === 'error' && (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                )}
                <p className="text-sm font-medium">
                  {trainingProgress.currentStep}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${trainingProgress.progress}%` }}
                />
              </div>
              {trainingProgress.error && (
                <p className="text-sm text-red-600 mt-2">{trainingProgress.error}</p>
              )}
            </div>
          )}

          {/* Train Button */}
          <Button
            onClick={startTraining}
            disabled={trainingFiles.length < 5 || trainingProgress.status !== 'idle'}
            className="w-full"
          >
            <BeakerIcon className="h-5 w-5 mr-2" />
            Modell trainieren
          </Button>
        </div>
      </div>

      {/* Trained Models */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-section="trained-models">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Ihre Custom Models</h2>
            <p className="text-sm text-gray-500 mt-1">
              Selbst trainierte Modelle für Werkstattaufträge
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {trainedModels.length} Custom Model(s)
            </span>
            <button
              onClick={() => loadTrainedModels()}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowPathIcon className="h-4 w-4 inline mr-1" />
              Aktualisieren
            </button>
          </div>
        </div>

        {trainedModels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AcademicCapIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Noch keine Custom Models trainiert</p>
            <p className="text-xs mt-2">
              Nach dem Training auf "Aktualisieren" klicken
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {trainedModels.map((model) => (
              <div
                key={model.modelId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{model.modelName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Modell-ID: {model.modelId}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Erstellt: {model.createdAt ? new Date(model.createdAt).toLocaleDateString() : 'Unbekannt'}
                    </p>
                    {model.accuracy && (
                      <div className="flex items-center space-x-2 mt-2">
                        <ChartBarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Genauigkeit: {model.accuracy}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() => alert('Evaluierung noch nicht implementiert')}
                    >
                      Evaluieren
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => deleteModel(model.modelId)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box about Prebuilt Models */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AcademicCapIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">
              Über Azure Form Recognizer Models
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Azure Form Recognizer bietet {prebuiltModels.length} vorgefertigte Modelle (prebuilt) für allgemeine Dokumenttypen 
              wie Rechnungen, Visitenkarten, Ausweise etc. Diese sind automatisch verfügbar.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Für Ihre spezifischen Werkstattaufträge trainieren Sie am besten ein eigenes Custom Model 
              mit mindestens 5 Beispiel-PDFs. Dies verbessert die Erkennungsgenauigkeit erheblich.
            </p>
            {prebuiltModels.length > 0 && (
              <button
                onClick={() => setShowPrebuilt(!showPrebuilt)}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2 font-medium"
              >
                {showPrebuilt ? 'Prebuilt Models verbergen' : `${prebuiltModels.length} Prebuilt Models anzeigen`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prebuilt Models (optional anzeigen) */}
      {showPrebuilt && prebuiltModels.length > 0 && (
        <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Vorgefertigte Azure Models</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {prebuiltModels.map((model) => (
              <div
                key={model.modelId}
                className="bg-white border border-gray-200 rounded-lg p-3 text-sm"
              >
                <p className="font-medium text-gray-700">
                  {model.modelId.replace('prebuilt-', '').replace(/\./g, ' ')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Standard Azure Model
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelTrainingPanel;