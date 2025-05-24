// src/pages/machines/PdfUploadExtractor.tsx - Intelligente PDF-zu-Maschine-Extraktion
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CogIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// TypeScript Interface für extrahierte Daten
interface ExtractedMachineData {
  // Kundendaten
  customerProcess?: string;
  customerNumber?: string;
  customerName?: string;
  
  // Maschinendaten
  machineNumber?: string;
  articleNumber?: string;
  magazineType?: string;
  
  // Technische Details
  synchronization?: boolean;
  feedChannel?: string;
  feedRod?: string;
  materialBarLength?: number;
  
  // Elektrische Daten
  magazineElectricalNumber?: string;
  controlPanel?: string;
  operatingVoltage?: string;
  
  // Drehmaschine
  manufacturer?: string;
  machineType?: string;
  latheNumber?: string;
  
  // Meta
  productionWeek?: string;
  colors?: string;
}

const PdfUploadExtractor = () => {
  const queryClient = useQueryClient();
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedMachineData>({});
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'complete'>('upload');
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

  // Intelligente Text-Extraktion (simuliert OCR)
  const extractTextFromPdf = async (_file: File): Promise<string> => {
    // In einer echten Implementierung würde hier Tesseract.js oder ein Backend-Service verwendet
    // Für die Demo simulieren wir die OCR-Erkennung
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulierter OCR-Text basierend auf dem Werkstattauftrag
        const simulatedOcrText = `
FMB Maschinenbau
Werkstattauftrag
Aussteller:
Produktions-Woche: 03/2010

Kundendaten
Kundenvorgang: 0000074391
Kundennr.: 805317
Kunde: EMCO

Magazindaten mechanisch:
Magazin-Typ: turbo ET 420
Maschinen-Nr: 39-000561
Artikel-Nr: 30-000562
Synchroneinrichtung: nein
Zuführkanal eing.: D 26
Vorschubstange: 1305
Materialstangenlänge: 3800

Magazindaten elektrisch:
Magazin-Nr.: 29
Pos.-Nr.: 2
Bedientableau: DPT_D001
Betriebsspannung: 400V
Schaltplan: 23D2150.9010

Drehmaschinendaten:
Hersteller: Emco
Typ: Emcoturn 420
Drehmaschinen-Nr.: 1029
        `;
        resolve(simulatedOcrText.trim());
      }, 2000);
    });
  };

  // Intelligente Daten-Extraktion aus OCR-Text
  const extractMachineDataFromText = (text: string): ExtractedMachineData => {
    const data: ExtractedMachineData = {};
    
    // Regex-Pattern für verschiedene Datenfelder
    const patterns = {
      customerProcess: /Kundenvorgang[:\s]*(\d+)/i,
      customerNumber: /Kundennr\.?[:\s]*(\d+)/i,
      customerName: /Kunde[:\s]*([A-Z]+)/i,
      machineNumber: /Maschinen-Nr[:\s]*([A-Z0-9-]+)/i,
      articleNumber: /Artikel-Nr[:\s]*([A-Z0-9-]+)/i,
      magazineType: /Magazin-Typ[:\s]*([^\n\r]+)/i,
      feedChannel: /Zuführkanal[^\n\r]*[:\s]*([A-Z0-9\s]+)/i,
      feedRod: /Vorschubstange[:\s]*(\d+)/i,
      materialBarLength: /Materialstangenlänge[:\s]*(\d+)/i,
      magazineElectricalNumber: /Magazin-Nr\.?[:\s]*(\d+)/i,
      controlPanel: /Bedientableau[:\s]*([A-Z0-9_]+)/i,
      operatingVoltage: /Betriebsspannung[:\s]*(\d+V)/i,
      manufacturer: /Hersteller[:\s]*([A-Za-z]+)/i,
      machineType: /Typ[:\s]*([A-Za-z0-9\s]+)/i,
      latheNumber: /Drehmaschinen-Nr\.?[:\s]*(\d+)/i,
      productionWeek: /Produktions-Woche[:\s]*([0-9\/]+)/i
    };

    // Synchroneinrichtung spezielle Behandlung
    const syncMatch = text.match(/Synchroneinrichtung[:\s]*(ja|nein)/i);
    if (syncMatch) {
      data.synchronization = syncMatch[1].toLowerCase() === 'ja';
    }

    // Alle anderen Pattern durchgehen
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match) {
        const value = match[1].trim();
        if (key === 'materialBarLength' || key === 'feedRod' || key === 'latheNumber') {
          (data as any)[key] = parseInt(value);
        } else {
          (data as any)[key] = value;
        }
      }
    });

    return data;
  };

  // PDF verarbeiten
  const processPdf = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setStep('processing');
    setErrors([]);

    try {
      // 1. OCR durchführen
      const text = await extractTextFromPdf(uploadedFile);
      setOcrText(text);
      
      // 2. Daten extrahieren
      const extracted = extractMachineDataFromText(text);
      setExtractedData(extracted);
      
      setStep('review');
    } catch (error) {
      console.error('Fehler bei PDF-Verarbeitung:', error);
      setErrors(['Fehler beim Verarbeiten der PDF-Datei.']);
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  // Formular-Daten aktualisieren
  const updateExtractedData = (field: keyof ExtractedMachineData, value: any) => {
    setExtractedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Maschine erstellen (Simulation)
  const createMachine = async () => {
    if (!extractedData.machineNumber) {
      setErrors(['Maschinennummer ist erforderlich.']);
      return;
    }

    setIsProcessing(true);
    try {
      // Simulation einer Maschinen-Erstellung
      console.log('Erstelle Maschine mit Daten:', {
        machineNumber: extractedData.machineNumber,
        type: extractedData.machineType || 'Unbekannt',
        installationDate: new Date().toISOString(),
        magazineProperties: {
          magazineType: extractedData.magazineType || '',
          materialBarLength: extractedData.materialBarLength || 0,
          hasSynchronizationDevice: extractedData.synchronization || false,
          feedChannel: extractedData.feedChannel || '',
          feedRod: extractedData.feedRod || ''
        }
      });

      // Simuliere API-Delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Cache invalidieren (wenn verfügbar)
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      
      setStep('complete');
      
      // Nach 3 Sekunden könnte zur neuen Maschine navigiert werden
      setTimeout(() => {
        console.log('Würde jetzt zur Maschine navigieren');
        // navigate(`/machines/${machineId}`);
      }, 3000);

    } catch (error: any) {
      console.error('Fehler beim Erstellen der Maschine:', error);
      setErrors([`Fehler beim Erstellen: ${error.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset
  const reset = () => {
    setUploadedFile(null);
    setOcrText('');
    setExtractedData({});
    setStep('upload');
    setErrors([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <SparklesIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🤖 Intelligente PDF-Extraktion</h1>
            <p className="text-gray-600">Werkstattauftrag hochladen → Automatische Maschinenerstellung</p>
          </div>
        </div>
        
        {/* Fortschritts-Indikator */}
        <div className="flex items-center justify-center space-x-8 mt-8">
          {[
            { id: 'upload', name: 'Upload', icon: CloudArrowUpIcon },
            { id: 'processing', name: 'OCR-Verarbeitung', icon: SparklesIcon },
            { id: 'review', name: 'Daten prüfen', icon: EyeIcon },
            { id: 'complete', name: 'Fertig', icon: CheckIcon }
          ].map((stepItem, index) => {
            const StepIcon = stepItem.icon;
            const isActive = step === stepItem.id;
            const isCompleted = ['upload', 'processing', 'review', 'complete'].indexOf(step) > index;
            
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
                {index < 3 && (
                  <div className={`mx-4 h-px w-12 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload-Bereich */}
      {step === 'upload' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
          >
            <CloudArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Werkstattauftrag (PDF) hier ablegen
            </h3>
            <p className="text-gray-500 mb-6">
              Oder klicken Sie zum Auswählen einer Datei
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
                    onClick={processPdf}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>KI-Extraktion starten</span>
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

      {/* Verarbeitungs-Anzeige */}
      {step === 'processing' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">🤖 KI analysiert Werkstattauftrag</h3>
          <div className="space-y-2 text-gray-600">
            <p>✅ PDF wird gelesen...</p>
            <p>🔍 OCR-Texterkennung läuft...</p>
            <p>🧠 Intelligente Datenextraktion...</p>
            <p>📋 Maschinendaten werden strukturiert...</p>
          </div>
        </div>
      )}

      {/* Daten überprüfen */}
      {step === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Extrahierte Daten bearbeiten */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <CogIcon className="h-5 w-5" />
              <span>Extrahierte Maschinendaten</span>
            </h3>
            
            <div className="space-y-4">
              {/* Maschinennummer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maschinennummer *
                </label>
                <input
                  type="text"
                  value={extractedData.machineNumber || ''}
                  onChange={(e) => updateExtractedData('machineNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 39-000561"
                />
              </div>

              {/* Magazin-Typ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Magazin-Typ
                </label>
                <input
                  type="text"
                  value={extractedData.magazineType || ''}
                  onChange={(e) => updateExtractedData('magazineType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. turbo ET 420"
                />
              </div>

              {/* Materialstangenlänge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materialstangenlänge (mm)
                </label>
                <input
                  type="number"
                  value={extractedData.materialBarLength || ''}
                  onChange={(e) => updateExtractedData('materialBarLength', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 3800"
                />
              </div>

              {/* Synchroneinrichtung */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Synchroneinrichtung
                </label>
                <select
                  value={extractedData.synchronization ? 'true' : 'false'}
                  onChange={(e) => updateExtractedData('synchronization', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="false">Nein</option>
                  <option value="true">Ja</option>
                </select>
              </div>

              {/* Zuführkanal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zuführkanal
                </label>
                <input
                  type="text"
                  value={extractedData.feedChannel || ''}
                  onChange={(e) => updateExtractedData('feedChannel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. D 26"
                />
              </div>

              {/* Vorschubstange */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorschubstange
                </label>
                <input
                  type="text"
                  value={extractedData.feedRod || ''}
                  onChange={(e) => updateExtractedData('feedRod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 1305"
                />
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Von vorn beginnen
              </button>
              <button
                onClick={createMachine}
                disabled={!extractedData.machineNumber || isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Wird erstellt...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Maschine erstellen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OCR-Text Vorschau */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <EyeIcon className="h-5 w-5" />
              <span>OCR-erkannter Text</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {ocrText || 'Kein Text erkannt'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Erfolgsmeldung */}
      {step === 'complete' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckIcon className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">🎉 Maschine erfolgreich erstellt!</h3>
          <p className="text-gray-600 mb-6">
            Die Daten aus dem Werkstattauftrag wurden erfolgreich extrahiert und die Maschine wurde automatisch angelegt.
          </p>
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-green-800 mb-2">Erstellte Daten:</h4>
            <ul className="text-sm text-green-700 space-y-1 text-left max-w-md mx-auto">
              <li>✅ Maschinennummer: {extractedData.machineNumber}</li>
              <li>✅ Magazin-Typ: {extractedData.magazineType}</li>
              <li>✅ Materialstangenlänge: {extractedData.materialBarLength}mm</li>
              <li>✅ Synchroneinrichtung: {extractedData.synchronization ? 'Ja' : 'Nein'}</li>
              <li>✅ Zuführkanal: {extractedData.feedChannel}</li>
              <li>✅ Vorschubstange: {extractedData.feedRod}</li>
            </ul>
          </div>
          <p className="text-sm text-gray-500">Sie werden automatisch zur neuen Maschine weitergeleitet...</p>
        </div>
      )}
    </div>
  );
};

export default PdfUploadExtractor;