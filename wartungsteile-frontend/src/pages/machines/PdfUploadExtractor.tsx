// src/pages/machines/PdfUploadExtractor.tsx - Professionelle B2B-Version
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
  CogIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

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

const PdfUploadExtractor = () => {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setErrors([]);
    } else {
      setErrors(['Bitte wählen Sie eine PDF-Datei aus.']);
    }
  };

  const processEnterprisePdf = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setStep('processing');
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append('pdfFile', uploadedFile);
      
      const response = await api.post('/Pdf/extract-machines', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const result: MultiMachineExtractionResult = response.data;
      setExtractionResult(result);
      
      if (result.success && result.extractedMachines.length > 0) {
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

  const createSelectedMachines = async () => {
    if (!extractionResult || selectedMachines.size === 0) return;

    setStep('batch-creating');
    setIsProcessing(true);
    setBatchProgress({ current: 0, total: selectedMachines.size, status: 'Starte Erstellung...' });

    try {
      const machinesToCreate = extractionResult.extractedMachines
        .filter(m => selectedMachines.has(m.machineNumber));

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
          const createData = {
            machineNumber: machine.machineNumber,
            type: machine.magazineType || 'Unbekannt',
            installationDate: new Date().toISOString().split('T')[0],
          };

          const createResponse = await api.post('/Machines', createData);
          const newMachineId = createResponse.data;

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

        } catch (error: any) {
          results.push({
            machineNumber: machine.machineNumber,
            success: false,
            machineId: '',
            error: error.response?.data?.message || error.message,
            processedAt: new Date().toISOString()
          });

          failCount++;
        }

        if (i < machinesToCreate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      const batchResult: BatchCreateResult = {
        success: successCount > 0,
        totalMachines: machinesToCreate.length,
        successfullyCreated: successCount,
        failed: failCount,
        results: results,
        summary: `${successCount} Maschinen erfolgreich erstellt, ${failCount} Fehler`,
        processingTime: 0
      };

      setBatchResult(batchResult);
      setStep('complete');

      queryClient.invalidateQueries({ queryKey: ['machines'] });

    } catch (error: any) {
      setErrors([`Erstellung fehlgeschlagen: ${error.message}`]);
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setUploadedFile(null);
    setExtractionResult(null);
    setSelectedMachines(new Set());
    setBatchResult(null);
    setStep('upload');
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/machines"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Zurück zur Liste
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 flex items-center justify-center">
              <CloudArrowUpIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dokument-Upload</h1>
              <p className="text-gray-600 mt-1">Maschinendaten aus PDF-Dokumenten extrahieren</p>
            </div>
          </div>

          <div className="bg-white border border-blue-200 p-4">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
              <div>
                <span className="font-medium text-blue-900">Automatische Datenextraktion</span>
                <p className="text-blue-800 text-sm">OCR-Technologie extrahiert Maschinendaten aus mehrseitigen PDF-Dokumenten</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="bg-white border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[
              { id: 'upload', name: 'Upload', icon: CloudArrowUpIcon, active: step === 'upload' },
              { id: 'processing', name: 'Verarbeitung', icon: CogIcon, active: step === 'processing' },
              { id: 'review', name: 'Auswahl', icon: EyeIcon, active: step === 'review' },
              { id: 'batch-creating', name: 'Erstellung', icon: CheckIcon, active: step === 'batch-creating' },
              { id: 'complete', name: 'Fertig', icon: CheckCircleIcon, active: step === 'complete' }
            ].map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const steps = ['upload', 'processing', 'review', 'batch-creating', 'complete'];
              const currentIndex = steps.indexOf(step);
              const isCompleted = currentIndex > index;
              
              return (
                <div key={stepItem.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${
                    stepItem.active 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : isCompleted 
                        ? 'border-green-600 bg-green-50 text-green-600' 
                        : 'border-gray-300 bg-gray-50 text-gray-400'
                  }`}>
                    {isCompleted && !stepItem.active ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    stepItem.active 
                      ? 'text-blue-600' 
                      : isCompleted 
                        ? 'text-green-600' 
                        : 'text-gray-500'
                  }`}>
                    {stepItem.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Phase */}
        {step === 'upload' && (
          <div className="bg-white border border-gray-200 shadow-sm p-6">
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <CloudArrowUpIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                PDF-Dokument hier ablegen
              </h3>
              <p className="text-gray-600 mb-4">
                Unterstützt werden mehrseitige PDF-Dokumente mit Maschinendaten
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
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                PDF auswählen
              </label>
            </div>

            {uploadedFile && (
              <div className="mt-4 p-4 bg-white border border-green-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">{uploadedFile.name}</p>
                      <p className="text-green-700 text-sm">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={processEnterprisePdf}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Verarbeitung starten
                    </button>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-white border border-red-500">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    {errors.map((error, index) => (
                      <p key={index} className="text-red-800 font-medium">{error}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Phase */}
        {step === 'processing' && (
          <div className="bg-white border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mx-auto mb-4">
              <CogIcon className="h-6 w-6 text-white animate-spin" />
            </div>
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verarbeitung läuft</h3>
            <div className="space-y-2 text-gray-600 max-w-md mx-auto text-sm">
              <p>• PDF wird analysiert</p>
              <p>• Texterkennung läuft</p>
              <p>• Maschinendaten werden extrahiert</p>
              <p>• Validierung und Überprüfung</p>
            </div>
          </div>
        )}

        {/* Review Phase */}
        {step === 'review' && extractionResult && (
          <div className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 border border-gray-200">
                <div className="text-xl font-semibold text-blue-600">{extractionResult.totalMachinesFound}</div>
                <div className="text-gray-600 text-xs">Gefunden</div>
              </div>
              <div className="bg-white p-4 border border-gray-200">
                <div className="text-xl font-semibold text-green-600">{extractionResult.validMachines}</div>
                <div className="text-gray-600 text-xs">Valide</div>
              </div>
              <div className="bg-white p-4 border border-gray-200">
                <div className="text-xl font-semibold text-amber-600">{extractionResult.duplicateMachines}</div>
                <div className="text-gray-600 text-xs">Duplikate</div>
              </div>
              <div className="bg-white p-4 border border-gray-200">
                <div className="text-xl font-semibold text-purple-600">{selectedMachines.size}</div>
                <div className="text-gray-600 text-xs">Ausgewählt</div>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="bg-white border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <button
                    onClick={selectAllValidMachines}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Alle validen auswählen
                  </button>
                  <button
                    onClick={clearAllSelections}
                    className="px-4 py-2 bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
                  >
                    Auswahl löschen
                  </button>
                </div>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1">
                  {selectedMachines.size} von {extractionResult.validMachines} ausgewählt
                </div>
              </div>
            </div>

            {/* Machine List */}
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Extrahierte Maschinen</h3>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auswahl</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maschinennummer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materialstange</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {extractionResult.extractedMachines.map((machine, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedMachines.has(machine.machineNumber)}
                            onChange={() => toggleMachineSelection(machine.machineNumber)}
                            disabled={!machine.isValid || machine.alreadyExists}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 text-sm">{machine.machineNumber}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{machine.magazineType || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {machine.materialBarLength ? `${machine.materialBarLength} mm` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {machine.isValid ? (
                            machine.alreadyExists ? (
                              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800">
                                Existiert bereits
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                                Bereit
                              </span>
                            )
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800">
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
            <div className="flex justify-between">
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Neu beginnen
              </button>
              <button
                onClick={createSelectedMachines}
                disabled={selectedMachines.size === 0 || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {selectedMachines.size} Maschinen erstellen
              </button>
            </div>
          </div>
        )}

        {/* Batch Creating Phase */}
        {step === 'batch-creating' && (
          <div className="bg-white border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-12 h-12 bg-blue-600 flex items-center justify-center mx-auto mb-4">
              <CogIcon className="h-6 w-6 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Erstellung läuft</h3>
            <p className="text-gray-600 mb-6 text-sm">{batchProgress.status}</p>

            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Fortschritt</span>
                <span>{batchProgress.current} von {batchProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div 
                  className="bg-blue-600 h-2 transition-all duration-500"
                  style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-lg font-medium text-gray-700 mt-3">
                {batchProgress.total > 0 ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}% abgeschlossen
              </div>
            </div>
          </div>
        )}

        {/* Complete Phase */}
        {step === 'complete' && batchResult && (
          <div className="bg-white border border-gray-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-600 flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Erstellung abgeschlossen</h3>
            <p className="text-gray-600 text-lg mb-6">{batchResult.summary}</p>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-green-500 p-4">
                <div className="text-2xl font-semibold text-green-600 mb-1">{batchResult.successfullyCreated}</div>
                <div className="text-green-700 font-medium text-sm">Erfolgreich erstellt</div>
              </div>
              <div className="bg-white border border-red-500 p-4">
                <div className="text-2xl font-semibold text-red-600 mb-1">{batchResult.failed}</div>
                <div className="text-red-700 font-medium text-sm">Fehlgeschlagen</div>
              </div>
              <div className="bg-white border border-blue-500 p-4">
                <div className="text-2xl font-semibold text-blue-600 mb-1">{batchResult.totalMachines}</div>
                <div className="text-blue-700 font-medium text-sm">Gesamt verarbeitet</div>
              </div>
            </div>

            {/* Detailed Results */}
            {batchResult.results.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Detaillierte Ergebnisse</h4>
                <div className="bg-gray-50 p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {batchResult.results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-white border border-gray-200">
                        <div className="flex items-center">
                          {result.success ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-600 mr-3" />
                          ) : (
                            <ExclamationCircleIcon className="h-4 w-4 text-red-600 mr-3" />
                          )}
                          <span className="font-medium text-gray-900 text-sm">{result.machineNumber}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {result.success ? 'Erfolgreich erstellt' : result.error}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/machines')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Zur Maschinenliste
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Neue Datei verarbeiten
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfUploadExtractor;