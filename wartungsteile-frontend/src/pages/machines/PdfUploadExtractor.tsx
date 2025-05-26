// src/pages/machines/EnterprisePdfUpload.tsx - Clean Modern Design
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
  InformationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

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

  // Enterprise Multi-Machine-Extraktion
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

  // Enterprise Batch-Creation
  const createSelectedMachines = async () => {
    if (!extractionResult || selectedMachines.size === 0) return;

    setStep('batch-creating');
    setIsProcessing(true);
    setBatchProgress({ current: 0, total: selectedMachines.size, status: 'Starte Batch-Erstellung...' });

    try {
      const machinesToCreate = extractionResult.extractedMachines
        .filter(m => selectedMachines.has(m.machineNumber));

      console.log('🚀 Starte Batch-Erstellung für', machinesToCreate.length, 'Maschinen');

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/machines"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Zurück zur Liste
          </Link>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <CloudArrowUpIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">KI Multi-Machine-Upload</h1>
              <p className="text-slate-600 mt-1">Bis zu 50+ Werkstattaufträge automatisch verarbeiten</p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-white border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <span className="font-semibold text-blue-900">🚀 Enterprise KI-System</span>
                <p className="text-blue-800 text-sm">Hochmoderne OCR-Technologie extrahiert automatisch alle Maschinendaten aus Multi-Page-PDFs</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Clean Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[
              { id: 'upload', name: 'Upload', icon: CloudArrowUpIcon, active: step === 'upload' },
              { id: 'processing', name: 'KI-Verarbeitung', icon: SparklesIcon, active: step === 'processing' },
              { id: 'review', name: 'Auswahl', icon: EyeIcon, active: step === 'review' },
              { id: 'batch-creating', name: 'Batch-Erstellung', icon: CogIcon, active: step === 'batch-creating' },
              { id: 'complete', name: 'Fertig', icon: CheckIcon, active: step === 'complete' }
            ].map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const steps = ['upload', 'processing', 'review', 'batch-creating', 'complete'];
              const currentIndex = steps.indexOf(step);
              const isCompleted = currentIndex > index;
              
              return (
                <div key={stepItem.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                    stepItem.active 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : isCompleted 
                        ? 'border-green-600 bg-green-50 text-green-600' 
                        : 'border-slate-300 bg-slate-50 text-slate-400'
                  }`}>
                    {isCompleted && !stepItem.active ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    stepItem.active 
                      ? 'text-blue-600' 
                      : isCompleted 
                        ? 'text-green-600' 
                        : 'text-slate-500'
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-white transition-all cursor-pointer"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Multi-Werkstattauftrag PDF hier ablegen
              </h3>
              <p className="text-slate-600 mb-6">
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
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                PDF auswählen
              </label>
            </div>

            {uploadedFile && (
              <div className="mt-6 p-4 bg-white border border-green-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-8 w-8 text-green-600 mr-3" />
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
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <SparklesIcon className="h-4 w-4 inline mr-2" />
                      KI-Extraktion starten
                    </button>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-white border border-red-500 rounded-lg">
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
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">🤖 Enterprise KI-Verarbeitung läuft</h3>
            <div className="space-y-2 text-slate-600 max-w-md mx-auto">
              <p>✅ PDF wird an Azure Document Intelligence gesendet...</p>
              <p>🔍 Multi-Page OCR-Texterkennung läuft...</p>
              <p>🧠 Text-Segmentierung nach Werkstattaufträgen...</p>
              <p>📋 Automatische Datenextraktion für alle Maschinen...</p>
              <p>🔄 Validierung und Deduplication...</p>
            </div>
          </div>
        )}

        {/* Review Phase */}
        {step === 'review' && extractionResult && (
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-blue-600">{extractionResult.totalMachinesFound}</div>
                <div className="text-slate-600 text-sm">Gefunden</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-green-600">{extractionResult.validMachines}</div>
                <div className="text-slate-600 text-sm">Valide</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-amber-600">{extractionResult.duplicateMachines}</div>
                <div className="text-slate-600 text-sm">Duplikate</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-purple-600">{selectedMachines.size}</div>
                <div className="text-slate-600 text-sm">Ausgewählt</div>
              </div>
            </div>

            {/* Selection Controls */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <button
                    onClick={selectAllValidMachines}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Alle validen auswählen
                  </button>
                  <button
                    onClick={clearAllSelections}
                    className="px-4 py-2 bg-slate-500 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                  >
                    Auswahl löschen
                  </button>
                </div>
                <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                  {selectedMachines.size} von {extractionResult.validMachines} ausgewählt
                </div>
              </div>
            </div>

            {/* Machine List */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Extrahierte Maschinen</h3>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Auswahl</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Maschinennummer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Typ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Materialstange</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {extractionResult.extractedMachines.map((machine, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedMachines.has(machine.machineNumber)}
                            onChange={() => toggleMachineSelection(machine.machineNumber)}
                            disabled={!machine.isValid || machine.alreadyExists}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{machine.machineNumber}</td>
                        <td className="px-6 py-4 text-slate-600">{machine.magazineType || '-'}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {machine.materialBarLength ? `${machine.materialBarLength} mm` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {machine.isValid ? (
                            machine.alreadyExists ? (
                              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                                Existiert bereits
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Bereit
                              </span>
                            )
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
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
                className="px-6 py-3 bg-slate-500 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
              >
                Von vorn beginnen
              </button>
              <button
                onClick={createSelectedMachines}
                disabled={selectedMachines.size === 0 || isProcessing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                <SparklesIcon className="h-4 w-4 inline mr-2" />
                {selectedMachines.size} Maschinen erstellen
              </button>
            </div>
          </div>
        )}

        {/* Batch Creating Phase */}
        {step === 'batch-creating' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <CogIcon className="h-8 w-8 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">🏭 Batch-Erstellung läuft</h3>
            <p className="text-slate-600 mb-6">{batchProgress.status}</p>

            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Fortschritt</span>
                <span>{batchProgress.current} von {batchProgress.total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-lg font-semibold text-slate-700 mt-3">
                {batchProgress.total > 0 ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}% abgeschlossen
              </div>
            </div>
          </div>
        )}

        {/* Complete Phase */}
        {step === 'complete' && batchResult && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <CheckIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">🎉 Batch-Erstellung abgeschlossen!</h3>
            <p className="text-slate-600 text-lg mb-8">{batchResult.summary}</p>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-green-500 rounded-lg p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{batchResult.successfullyCreated}</div>
                <div className="text-green-700 font-medium">Erfolgreich erstellt</div>
              </div>
              <div className="bg-white border border-red-500 rounded-lg p-6">
                <div className="text-3xl font-bold text-red-600 mb-2">{batchResult.failed}</div>
                <div className="text-red-700 font-medium">Fehlgeschlagen</div>
              </div>
              <div className="bg-white border border-blue-500 rounded-lg p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{batchResult.totalMachines}</div>
                <div className="text-blue-700 font-medium">Gesamt verarbeitet</div>
              </div>
            </div>

            {/* Detailed Results */}
            {batchResult.results.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Detaillierte Ergebnisse</h4>
                <div className="bg-slate-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {batchResult.results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-white rounded border border-slate-200">
                        <div className="flex items-center">
                          {result.success ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                          ) : (
                            <ExclamationCircleIcon className="h-5 w-5 text-red-600 mr-3" />
                          )}
                          <span className="font-medium text-slate-900">{result.machineNumber}</span>
                        </div>
                        <div className="text-sm text-slate-600">
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
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <CogIcon className="h-4 w-4 inline mr-2" />
                Zur Maschinenliste
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 bg-slate-500 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
              >
                Neue PDF verarbeiten
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterprisePdfUpload;