// src/pages/machines/EnterprisePdfUpload.tsx - ENTERPRISE MULTI-MACHINE SYSTEM
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CogIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// TypeScript Interfaces für Enterprise System
interface ExtractedMachineData {
  machineNumber: string;
  magazineType: string;
  materialBarLength: number;
  hasSynchronizationDevice: boolean;
  feedChannel: string;
  feedRod: string;
  customerName: string;
  customerNumber: string;
  articleNumber: string;
  isValid: boolean;
  validationErrors: string[];
  alreadyExists: boolean;
}

interface MultiMachineExtractionResult {
  success: boolean;
  originalText: string;
  extractedMachines: ExtractedMachineData[];
  totalMachinesFound: number;
  validMachines: number;
  duplicateMachines: number;
  ocrEngine: string;
  metadata: Record<string, any>;
}

interface BatchCreateResult {
  success: boolean;
  totalMachines: number;
  successfullyCreated: number;
  failed: number;
  results: BatchCreateItem[];
  summary: string;
  processingTime: number;
}

interface BatchCreateItem {
  machineNumber: string;
  success: boolean;
  machineId: string;
  error: string;
  processedAt: string;
}

const EnterprisePdfUpload = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<MultiMachineExtractionResult | null>(null);
  const [selectedMachines, setSelectedMachines] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'batch-creating' | 'complete'>('upload');
  const [errors, setErrors] = useState<string[]>([]);
  const [batchResult, setBatchResult] = useState<BatchCreateResult | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; status: string }>({ current: 0, total: 0, status: '' });

  // Drag & Drop Handler
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      setUploadedFile(pdfFile);
      setErrors([]);
    } else {
      setErrors(['Bitte laden Sie eine PDF-Datei hoch.']);
    }
  }, []);

  // File Input Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setErrors([]);
    } else {
      setErrors(['Bitte wählen Sie eine PDF-Datei aus.']);
    }
  };

  // 🔥 ENTERPRISE MULTI-MACHINE-EXTRAKTION
  const processEnterprisePdf = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setStep('processing');
    setErrors([]);

    try {
      console.log('🚀 Starte Enterprise Multi-Machine-Extraktion...');
      
      const formData = new FormData();
      formData.append('pdfFile', uploadedFile);
      
      const response = await api.post('/Pdf/extract-machines', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const result: MultiMachineExtractionResult = response.data;
      setExtractionResult(result);
      
      console.log('✅ Multi-Machine-Extraktion erfolgreich:', result);
      
      if (result.success && result.extractedMachines.length > 0) {
        // Alle validen Maschinen vorauswählen
        const validMachineNumbers = result.extractedMachines
          .filter(m => m.isValid && !m.alreadyExists)
          .map(m => m.machineNumber);
        setSelectedMachines(new Set(validMachineNumbers));
        
        setStep('review');
      } else {
        setErrors(['Keine Maschinen in der PDF gefunden.']);
        setStep('upload');
      }
      
    } catch (error: any) {
      console.error('❌ Fehler bei Multi-Machine-Extraktion:', error);
      
      if (error.response?.status >= 400 && error.response?.status < 500) {
        setErrors([`Verarbeitungsfehler: ${error.response?.data?.metadata?.error || error.message}`]);
      } else {
        setErrors(['Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.']);
      }
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  // Machine Selection Handlers
  const toggleMachineSelection = (machineNumber: string) => {
    const newSelection = new Set(selectedMachines);
    if (newSelection.has(machineNumber)) {
      newSelection.delete(machineNumber);
    } else {
      newSelection.add(machineNumber);
    }
    setSelectedMachines(newSelection);
  };

  const selectAllValidMachines = () => {
    if (!extractionResult) return;
    const validMachineNumbers = extractionResult.extractedMachines
      .filter(m => m.isValid && !m.alreadyExists)
      .map(m => m.machineNumber);
    setSelectedMachines(new Set(validMachineNumbers));
  };

  const clearAllSelections = () => {
    setSelectedMachines(new Set());
  };

  // 🔥 ENTERPRISE BATCH-CREATION
  const createSelectedMachines = async () => {
    if (!extractionResult || selectedMachines.size === 0) return;

    setStep('batch-creating');
    setIsProcessing(true);
    setBatchProgress({ current: 0, total: selectedMachines.size, status: 'Starte Batch-Erstellung...' });

    try {
      const machinesToCreate = extractionResult.extractedMachines
        .filter(m => selectedMachines.has(m.machineNumber));

      console.log('🚀 Starte Batch-Erstellung für', machinesToCreate.length, 'Maschinen');

      // Simuliere schrittweise Erstellung (in echter Implementierung würde das via WebSocket/SignalR laufen)
      let successCount = 0;
      let failCount = 0;
      const results: BatchCreateItem[] = [];

      for (let i = 0; i < machinesToCreate.length; i++) {
        const machine = machinesToCreate[i];
        
        setBatchProgress({ 
          current: i + 1, 
          total: machinesToCreate.length, 
          status: `Erstelle Maschine ${machine.machineNumber}...` 
        });

        try {
          // 1. Maschine erstellen
          const createData = {
            machineNumber: machine.machineNumber,
            type: machine.magazineType || 'Unbekannt',
            installationDate: new Date().toISOString().split('T')[0],
          };

          const createResponse = await api.post('/Machines', createData);
          const newMachineId = createResponse.data;

          // 2. Magazin-Eigenschaften setzen
          if (machine.magazineType || machine.materialBarLength || machine.feedChannel) {
            const magazineData = {
              MagazineType: machine.magazineType || '',
              MaterialBarLength: machine.materialBarLength || 0,
              HasSynchronizationDevice: machine.hasSynchronizationDevice || false,
              FeedChannel: machine.feedChannel || '',
              FeedRod: machine.feedRod || ''
            };

            await api.put(`/Machines/${newMachineId}/magazine`, magazineData);
          }

          results.push({
            machineNumber: machine.machineNumber,
            success: true,
            machineId: newMachineId,
            error: '',
            processedAt: new Date().toISOString()
          });

          successCount++;
          console.log('✅ Maschine', machine.machineNumber, 'erfolgreich erstellt');

        } catch (error: any) {
          console.error('❌ Fehler bei Maschine', machine.machineNumber, ':', error);
          
          results.push({
            machineNumber: machine.machineNumber,
            success: false,
            machineId: '',
            error: error.response?.data?.message || error.message,
            processedAt: new Date().toISOString()
          });

          failCount++;
        }

        // Kleine Pause zwischen Requests um Server nicht zu überlasten
        if (i < machinesToCreate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Batch-Ergebnis zusammenstellen
      const batchResult: BatchCreateResult = {
        success: successCount > 0,
        totalMachines: machinesToCreate.length,
        successfullyCreated: successCount,
        failed: failCount,
        results: results,
        summary: `${successCount} Maschinen erfolgreich erstellt, ${failCount} Fehler`,
        processingTime: 0 // Wird vom Backend berechnet
      };

      setBatchResult(batchResult);
      setStep('complete');

      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['machines'] });

      console.log('🏆 Batch-Erstellung abgeschlossen:', batchResult);

    } catch (error: any) {
      console.error('💥 Kritischer Fehler bei Batch-Erstellung:', error);
      setErrors([`Batch-Erstellung fehlgeschlagen: ${error.message}`]);
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset
  const reset = () => {
    setUploadedFile(null);
    setExtractionResult(null);
    setSelectedMachines(new Set());
    setBatchResult(null);
    setStep('upload');
    setErrors([]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Enterprise Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <SparklesIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏭 Enterprise Multi-Machine-Extraktion</h1>
            <p className="text-gray-600">Bis zu 50+ Werkstattaufträge automatisch verarbeiten</p>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-8 mt-8">
          {[
            { id: 'upload', name: 'Upload', icon: CloudArrowUpIcon },
            { id: 'processing', name: 'KI-Verarbeitung', icon: SparklesIcon },
            { id: 'review', name: 'Auswahl', icon: EyeIcon },
            { id: 'batch-creating', name: 'Batch-Erstellung', icon: CogIcon },
            { id: 'complete', name: 'Fertig', icon: CheckIcon }
          ].map((stepItem, index) => {
            const StepIcon = stepItem.icon;
            const isActive = step === stepItem.id;
            const isCompleted = ['upload', 'processing', 'review', 'batch-creating', 'complete'].indexOf(step) > index;
            
            return (
              <div key={stepItem.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive ? 'border-blue-600 bg-blue-50' : 
                    isCompleted ? 'border-green-600 bg-green-50' : 'border-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{stepItem.name}</span>
                </div>
                {index < 4 && (
                  <div className={`mx-4 h-px w-12 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Phase */}
      {step === 'upload' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
          >
            <CloudArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Multi-Werkstattauftrag PDF hier ablegen
            </h3>
            <p className="text-gray-500 mb-6">
              Unterstützt PDFs mit 1-50+ Werkstattaufträgen
            </p>
            
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-all"
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>PDF auswählen</span>
            </label>
          </div>

          {uploadedFile && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{uploadedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={processEnterprisePdf}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>Multi-Machine-Extraktion starten</span>
                  </button>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-700">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing Phase */}
      {step === 'processing' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">🤖 Enterprise KI-Verarbeitung läuft</h3>
          <div className="space-y-2 text-gray-600">
            <p>✅ PDF wird an Azure Document Intelligence gesendet...</p>
            <p>🔍 Multi-Page OCR-Texterkennung läuft...</p>
            <p>🧠 Text-Segmentierung nach Werkstattaufträgen...</p>
            <p>📋 Automatische Datenextraktion für alle Maschinen...</p>
            <p>🔄 Validierung und Deduplication...</p>
          </div>
        </div>
      )}

      {/* Multi-Machine Review Phase */}
      {step === 'review' && extractionResult && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Gefunden</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{extractionResult.totalMachinesFound}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Valide</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{extractionResult.validMachines}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Duplikate</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{extractionResult.duplicateMachines}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckIcon className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Ausgewählt</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{selectedMachines.size}</p>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={selectAllValidMachines}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                >
                  Alle validen auswählen
                </button>
                <button
                  onClick={clearAllSelections}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
                >
                  Auswahl löschen
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {selectedMachines.size} von {extractionResult.validMachines} ausgewählt
              </div>
            </div>
          </div>

          {/* Machine List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Extrahierte Maschinen</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Auswahl
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maschinennummer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Typ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Materialstange
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {extractionResult.extractedMachines.map((machine, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedMachines.has(machine.machineNumber)}
                          onChange={() => toggleMachineSelection(machine.machineNumber)}
                          disabled={!machine.isValid || machine.alreadyExists}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {machine.machineNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {machine.magazineType || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {machine.materialBarLength ? `${machine.materialBarLength} mm` : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {machine.isValid ? (
                          machine.alreadyExists ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Existiert bereits
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Bereit
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Ungültig
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={reset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all"
            >
              Von vorn beginnen
            </button>
            <button
              onClick={createSelectedMachines}
              disabled={selectedMachines.size === 0 || isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
            >
              <SparklesIcon className="h-5 w-5" />
              <span>{selectedMachines.size} Maschinen erstellen</span>
            </button>
          </div>
        </div>
      )}

      {/* Batch Creating Phase */}
      {step === 'batch-creating' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">🏭 Batch-Erstellung läuft</h3>
            <p className="text-gray-600">{batchProgress.status}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fortschritt</span>
              <span>{batchProgress.current} von {batchProgress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              {batchProgress.total > 0 ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}% abgeschlossen
            </div>
          </div>
        </div>
      )}

      {/* Complete Phase */}
      {step === 'complete' && batchResult && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckIcon className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🎉 Batch-Erstellung abgeschlossen!</h3>
            <p className="text-gray-600 mb-6">{batchResult.summary}</p>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-900">{batchResult.successfullyCreated}</div>
              <div className="text-sm text-green-700">Erfolgreich erstellt</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-900">{batchResult.failed}</div>
              <div className="text-sm text-red-700">Fehlgeschlagen</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-900">{batchResult.totalMachines}</div>
              <div className="text-sm text-blue-700">Gesamt verarbeitet</div>
            </div>
          </div>

          {/* Detailed Results */}
          {batchResult.results.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Detaillierte Ergebnisse</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {batchResult.results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">{result.machineNumber}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.success ? 'Erfolgreich erstellt' : result.error}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => navigate('/machines')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all"
            >
              Zur Maschinenliste
            </button>
            <button
              onClick={reset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all"
            >
              Neue PDF verarbeiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterprisePdfUpload;