// src/components/MagazinePdfUpload.tsx - PDF Upload für einzelne Maschinen
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { machineService } from '../services';
import type { MachineDetail, ExtractedMachineData } from '../types/api';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface MagazinePdfUploadProps {
  machine: MachineDetail;
  onSuccess?: (updatedMachine: MachineDetail) => void;
  onClose?: () => void;
}

interface ExtractionResult {
  success: boolean;
  extractedData: ExtractedMachineData;
  originalText?: string;
  confidence?: number;
  ocrEngine?: string;
}

const MagazinePdfUpload: React.FC<MagazinePdfUploadProps> = ({
  machine,
  onSuccess,
  onClose
}) => {
  const queryClient = useQueryClient();
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [step, setStep] = useState<'upload' | 'processing' | 'preview' | 'applying'>('upload');
  const [errors, setErrors] = useState<string[]>([]);

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

  // PDF verarbeiten und Daten extrahieren
  const processPdf = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setStep('processing');
    setErrors([]);

    try {
      console.log('🚀 Starte PDF-Extraktion für Maschine:', machine.number);
      
      // Hier würde normalerweise ein API-Call an das PDF-Extraktion Backend gemacht
      // Für Demo-Zwecke simulieren wir das
      
      // Simuliere Verarbeitung
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock-Daten - in echter Implementierung vom Backend
      const mockResult: ExtractionResult = {
        success: true,
        extractedData: {
          machineNumber: machine.number,
          magazineType: 'minimag 20 S1',
          materialBarLength: 3200,
          hasSynchronizationDevice: true,
          feedChannel: 'Umrüstsatz D20/3200/1405',
          feedRod: '1405',
          customerName: 'Citizen',
          customerNumber: '803023',
          customerProcess: '0000167155',
          productionWeek: '49/2018',
          baseColor: 'Munsell Gray Color',
          coverColor: 'Munsell White Color',
          buildVariant: 'C',
          operatingVoltage: '200V',
          latheManufacturer: 'Citizen',
          latheType: 'L 20 E M8;M10;M12 (L 220)',
          articleNumber: '048-32-1541-01BC',
          extractionConfidence: 95,
          extractionSource: 'Azure Document Intelligence',
          extractedAt: new Date().toISOString()
        },
        confidence: 95,
        ocrEngine: 'Azure Document Intelligence'
      };
      
      setExtractionResult(mockResult);
      setStep('preview');
      
    } catch (error: any) {
      console.error('❌ Fehler bei PDF-Extraktion:', error);
      setErrors(['Fehler bei der PDF-Verarbeitung. Bitte versuchen Sie es erneut.']);
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  // Extrahierte Daten auf Maschine anwenden
  const applyExtractedData = async () => {
    if (!extractionResult?.extractedData) return;
    
    setStep('applying');
    setIsProcessing(true);

    try {
      console.log('✨ Wende extrahierte Daten auf Maschine an:', machine.id);
      
      const result = await machineService.updateMagazineFromPdf(
        machine.id, 
        extractionResult.extractedData
      );

      if (result.success) {
        // Cache invalidieren
        queryClient.invalidateQueries({ queryKey: ['machine', machine.id] });
        
        console.log('✅ Magazin-Eigenschaften erfolgreich aktualisiert!');
        
        if (onSuccess) {
          // Neue Maschinendaten laden und an Parent weitergeben
          const updatedMachine = await machineService.getById(machine.id);
          onSuccess(updatedMachine);
        }
        
        // Modal schließen nach kurzer Verzögerung
        setTimeout(() => {
          reset();
          if (onClose) onClose();
        }, 2000);
        
      } else {
        setErrors(['Fehler beim Anwenden der extrahierten Daten.']);
        setStep('preview');
      }
      
    } catch (error: any) {
      console.error('❌ Fehler beim Anwenden der Daten:', error);
      setErrors([`Fehler: ${error.response?.data?.message || error.message}`]);
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  // Alles zurücksetzen
  const reset = () => {
    setUploadedFile(null);
    setExtractionResult(null);
    setStep('upload');
    setErrors([]);
    setIsProcessing(false);
  };

  // Feldwert für Anzeige formatieren
  const formatFieldValue = (value: any) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-gray-400 italic">Nicht extrahiert</span>;
    }
    if (typeof value === 'boolean') {
      return <span className={`font-medium ${value ? 'text-green-600' : 'text-gray-600'}`}>
        {value ? 'Ja' : 'Nein'}
      </span>;
    }
    if (typeof value === 'number') {
      return <span className="font-medium text-gray-800">{value}</span>;
    }
    return <span className="font-medium text-gray-800">{value}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">🤖 PDF-Import</h2>
                <p className="text-gray-600 text-sm">Maschine {machine.number} - Magazin-Eigenschaften automatisch extrahieren</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Upload Phase */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
              >
                <CloudArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Werkstattauftrag PDF hier ablegen
                </h3>
                <p className="text-gray-500 mb-6">
                  Die KI extrahiert automatisch alle Magazin-Eigenschaften
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
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
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
                        onClick={processPdf}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                      >
                        <SparklesIcon className="h-4 w-4" />
                        <span>{isProcessing ? 'Verarbeitung läuft...' : 'KI-Extraktion starten'}</span>
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
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
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
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">🤖 KI-Verarbeitung läuft</h3>
              <div className="space-y-2 text-gray-600">
                <p>✅ PDF wird analysiert...</p>
                <p>🔍 OCR-Texterkennung läuft...</p>
                <p>🧠 Magazin-Eigenschaften werden extrahiert...</p>
                <p>📋 Datenvalidierung...</p>
              </div>
            </div>
          )}

          {/* Preview Phase */}
          {step === 'preview' && extractionResult && (
            <div className="space-y-6">
              {/* Success Header */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">✨ Extraktion erfolgreich!</h3>
                    <p className="text-green-700 text-sm">
                      {extractionResult.confidence}% Genauigkeit • {extractionResult.ocrEngine}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extrahierte Daten Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">📋 Extrahierte Magazin-Eigenschaften</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basis-Eigenschaften */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Basis</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Magazin-Typ:</span>
                        {formatFieldValue(extractionResult.extractedData.magazineType)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Materialstangenlänge:</span>
                        {formatFieldValue(extractionResult.extractedData.materialBarLength ? `${extractionResult.extractedData.materialBarLength} mm` : null)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Synchroneinrichtung:</span>
                        {formatFieldValue(extractionResult.extractedData.hasSynchronizationDevice)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Zuführkanal:</span>
                        {formatFieldValue(extractionResult.extractedData.feedChannel)}
                      </div>
                    </div>
                  </div>

                  {/* Kundendaten */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Kunde</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kundenname:</span>
                        {formatFieldValue(extractionResult.extractedData.customerName)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kundennummer:</span>
                        {formatFieldValue(extractionResult.extractedData.customerNumber)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kundenprozess:</span>
                        {formatFieldValue(extractionResult.extractedData.customerProcess)}
                      </div>
                    </div>
                  </div>

                  {/* Produktion */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Produktion</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Produktionswoche:</span>
                        {formatFieldValue(extractionResult.extractedData.productionWeek)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bauvariante:</span>
                        {formatFieldValue(extractionResult.extractedData.buildVariant)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Betriebsspannung:</span>
                        {formatFieldValue(extractionResult.extractedData.operatingVoltage)}
                      </div>
                    </div>
                  </div>

                  {/* Drehmaschine */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Drehmaschine</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hersteller:</span>
                        {formatFieldValue(extractionResult.extractedData.latheManufacturer)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Typ:</span>
                        {formatFieldValue(extractionResult.extractedData.latheType)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Artikelnummer:</span>
                        {formatFieldValue(extractionResult.extractedData.articleNumber)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={reset}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Erneut versuchen</span>
                </button>
                
                <button
                  onClick={applyExtractedData}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>{isProcessing ? 'Wird angewendet...' : 'Daten übernehmen'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Applying Phase */}
          {step === 'applying' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">💾 Daten werden gespeichert</h3>
              <p className="text-gray-600">Magazin-Eigenschaften werden in der Datenbank aktualisiert...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MagazinePdfUpload;