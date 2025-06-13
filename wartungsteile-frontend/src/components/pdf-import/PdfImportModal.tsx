import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  DocumentIcon, 
  CloudArrowUpIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { Button } from '../ui';

interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface PdfFile {
  file: File;
  id: string;
<<<<<<< HEAD
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  result?: any;
  error?: string;
  progress?: number;
=======
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: any;
  error?: string;
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<string | null>(null);
  const [autoCreate, setAutoCreate] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
<<<<<<< HEAD
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size (50MB limit per file)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: `Datei zu groß (max. 50MB, ist ${(file.size / 1024 / 1024).toFixed(2)}MB)` };
    }
    
    // Check if file is already added
    const isDuplicate = files.some(f => 
      f.file.name === file.name && f.file.size === file.size
    );
    if (isDuplicate) {
      return { valid: false, error: 'Datei wurde bereits hinzugefügt' };
    }
    
    // Check total size with existing files
    const totalSize = files.reduce((sum, f) => sum + f.file.size, 0) + file.size;
    const maxTotalSize = 100 * 1024 * 1024; // 100MB total
    if (totalSize > maxTotalSize) {
      return { valid: false, error: 'Gesamtgröße überschreitet 100MB' };
    }
    
    return { valid: true };
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const validFiles: PdfFile[] = [];
    const errors: string[] = [];
    
    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending' as const
        });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });
    
    rejectedFiles.forEach(rejection => {
      const error = rejection.errors[0]?.message || 'Ungültige Datei';
      errors.push(`${rejection.file.name}: ${error}`);
    });
    
    if (errors.length > 0) {
      alert('Folgende Dateien konnten nicht hinzugefügt werden:\n\n' + errors.join('\n'));
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files]);
=======

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
<<<<<<< HEAD
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB per file
    noClick: isImporting || isPreviewing, // Disable click during operations
    noKeyboard: isImporting || isPreviewing
=======
    multiple: true
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

<<<<<<< HEAD
  const handlePreview = async (pdfFile: PdfFile) => {
    setIsPreviewing(true);
    setSelectedFileForPreview(pdfFile.id);
    
    const formData = new FormData();
    formData.append('file', pdfFile.file);
    
    try {
      const response = await fetch('/api/pdfimport/preview', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Preview fehlgeschlagen');
      }
      
      const data = await response.json();
      setPreviewData(data);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Fehler beim Vorschau der PDF-Datei');
    } finally {
      setIsPreviewing(false);
      setSelectedFileForPreview(null);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    // Set all files to processing state
    setFiles(prev => prev.map(file => ({
      ...file,
      status: 'processing',
      progress: 0
    })));

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setFiles(prev => prev.map(file => ({
        ...file,
        progress: Math.min((file.progress || 0) + Math.random() * 20, 90)
      })));
    }, 500);

    const formData = new FormData();
=======
  const handleImport = async () => {
    setIsImporting(true);
    const formData = new FormData();
    
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
    files.forEach(pdfFile => {
      formData.append('files', pdfFile.file);
    });

    try {
      const response = await fetch(
        `/api/pdfimport/workshop-orders?autoCreateMachines=${autoCreate}&overwriteExisting=${overwriteExisting}`,
        {
          method: 'POST',
          body: formData
        }
      );

<<<<<<< HEAD
      clearInterval(progressInterval);

=======
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
      if (!response.ok) {
        throw new Error('Import fehlgeschlagen');
      }

      const result = await response.json();
      setImportResults(result);
      
      // Update file statuses based on results
      setFiles(prev => prev.map(file => {
        const fileResult = result.fileResults?.find(
          (r: any) => r.fileName === file.file.name
        );
        
        if (fileResult) {
          return {
            ...file,
            status: fileResult.success ? 'success' : 'error',
<<<<<<< HEAD
            result: fileResult,
            progress: 100
=======
            result: fileResult
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
          };
        }
        return file;
      }));

      if (result.successfulImports > 0) {
        setTimeout(() => {
          onImportComplete();
        }, 2000);
      }
    } catch (error) {
<<<<<<< HEAD
      clearInterval(progressInterval);
=======
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
      console.error('Import error:', error);
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'error',
<<<<<<< HEAD
        error: 'Import fehlgeschlagen',
        progress: 0
=======
        error: 'Import fehlgeschlagen'
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
      })));
    } finally {
      setIsImporting(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setImportResults(null);
<<<<<<< HEAD
    setPreviewData(null);
    setShowPreviewModal(false);
=======
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b">
            <Dialog.Title className="text-xl font-semibold">
              Werkstattaufträge importieren
            </Dialog.Title>
            <p className="text-sm text-gray-600 mt-1">
              Laden Sie PDF-Dateien von Werkstattaufträgen hoch, um Maschineninformationen zu importieren
            </p>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
<<<<<<< HEAD
            {/* Dropzone - Always visible if no import results */}
            {!importResults && (
=======
            {/* Dropzone */}
            {files.length === 0 && (
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
<<<<<<< HEAD
                  transition-colors duration-200 mb-4
=======
                  transition-colors duration-200
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
                  ${isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
<<<<<<< HEAD
                  ${files.length > 0 ? 'p-4' : 'p-8'}
                `}
              >
                <input {...getInputProps()} />
                {files.length === 0 ? (
                  <>
                    <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium">
                      {isDragActive
                        ? 'Dateien hier ablegen...'
                        : 'PDF-Dateien hier ablegen oder klicken zum Auswählen'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Mehrere Dateien gleichzeitig möglich
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <CloudArrowUpIcon className="w-6 h-6 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {isDragActive
                        ? 'Dateien hier ablegen...'
                        : 'Weitere PDF-Dateien hinzufügen (Klicken oder Drag & Drop)'
                      }
                    </p>
                  </div>
                )}
=======
                `}
              >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium">
                  {isDragActive
                    ? 'Dateien hier ablegen...'
                    : 'PDF-Dateien hier ablegen oder klicken zum Auswählen'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Mehrere Dateien gleichzeitig möglich
                </p>
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4">
<<<<<<< HEAD
                  <div>
                    <h3 className="font-medium">
                      {files.length} Datei{files.length !== 1 ? 'en' : ''} ausgewählt
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Gesamtgröße: {(files.reduce((sum, f) => sum + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB von max. 100 MB
                    </p>
                  </div>
=======
                  <h3 className="font-medium">
                    {files.length} Datei{files.length !== 1 ? 'en' : ''} ausgewählt
                  </h3>
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
                  {!isImporting && !importResults && (
                    <Button size="sm" variant="ghost" onClick={reset}>
                      Zurücksetzen
                    </Button>
                  )}
                </div>

                {files.map(pdfFile => (
                  <div
                    key={pdfFile.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="w-8 h-8 text-red-600" />
<<<<<<< HEAD
                      <div className="flex-1">
=======
                      <div>
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
                        <p className="font-medium text-sm">{pdfFile.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(pdfFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
<<<<<<< HEAD
                        
                        {/* Progress Bar */}
                        {pdfFile.status === 'processing' && pdfFile.progress !== undefined && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Verarbeitung...</span>
                              <span>{Math.round(pdfFile.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${pdfFile.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
=======
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
                        {pdfFile.result && (
                          <div className="mt-1">
                            {pdfFile.result.machineNumber && (
                              <p className="text-xs text-green-600">
<<<<<<< HEAD
                                ✓ Maschine: {pdfFile.result.machineNumber}
=======
                                Maschine: {pdfFile.result.machineNumber}
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
                              </p>
                            )}
                            {pdfFile.result.warnings?.map((warning: string, idx: number) => (
                              <p key={idx} className="text-xs text-yellow-600">
                                ⚠️ {warning}
                              </p>
                            ))}
                            {pdfFile.result.errors?.map((error: string, idx: number) => (
                              <p key={idx} className="text-xs text-red-600">
                                ❌ {error}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {pdfFile.status === 'pending' && !isImporting && (
<<<<<<< HEAD
                        <>
                          <button
                            onClick={() => handlePreview(pdfFile)}
                            disabled={isPreviewing && selectedFileForPreview === pdfFile.id}
                            className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50"
                          >
                            {isPreviewing && selectedFileForPreview === pdfFile.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700 mr-1" />
                                Lädt...
                              </div>
                            ) : (
                              'Vorschau'
                            )}
                          </button>
                          <button
                            onClick={() => removeFile(pdfFile.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </>
=======
                        <button
                          onClick={() => removeFile(pdfFile.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
                      )}
                      {pdfFile.status === 'uploading' && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                      )}
<<<<<<< HEAD
                      {pdfFile.status === 'processing' && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                      )}
=======
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
                      {pdfFile.status === 'success' && (
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      )}
                      {pdfFile.status === 'error' && (
                        <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}

                {/* Import Options */}
                {!importResults && (
                  <div className="mt-6 space-y-3 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm">Import-Optionen</h4>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={autoCreate}
                        onChange={(e) => setAutoCreate(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">
                        Neue Maschinen automatisch erstellen
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={overwriteExisting}
                        onChange={(e) => setOverwriteExisting(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm">
                        Bestehende Maschinen überschreiben
                      </span>
                    </label>
                  </div>
                )}

                {/* Import Results Summary */}
                {importResults && (
                  <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h4 className="font-medium mb-2">Import-Ergebnis</h4>
                    <div className="space-y-1 text-sm">
                      <p>✅ Erfolgreich: {importResults.successfulImports}</p>
                      <p>❌ Fehlgeschlagen: {importResults.failedImports}</p>
                      <p>🆕 Neue Maschinen: {importResults.createdMachines}</p>
                      <p>📝 Aktualisierte Maschinen: {importResults.updatedMachines}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 border-t flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose} disabled={isImporting}>
              Abbrechen
            </Button>
            {files.length > 0 && !importResults && (
              <Button 
                onClick={handleImport} 
                disabled={isImporting}
                className="min-w-[120px]"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Importiere...
                  </>
                ) : (
                  'Importieren'
                )}
              </Button>
            )}
            {importResults && (
              <Button onClick={onClose}>
                Schließen
              </Button>
            )}
          </div>
        </Dialog.Panel>
      </div>
<<<<<<< HEAD

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <Dialog open={showPreviewModal} onClose={() => setShowPreviewModal(false)} className="relative z-60">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <Dialog.Title className="text-xl font-semibold">
                  PDF Vorschau - Extrahierte Daten
                </Dialog.Title>
                <p className="text-sm text-gray-600 mt-1">
                  Konfidenz: {previewData.confidenceScore ? `${(previewData.confidenceScore * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Basis-Informationen</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Maschinennummer:</dt>
                        <dd className="font-medium">{previewData.machineNumber || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Magazintyp:</dt>
                        <dd className="font-medium">{previewData.magazineType || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Stangenlänge:</dt>
                        <dd className="font-medium">{previewData.materialBarLength || '-'} mm</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Kunde</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Name:</dt>
                        <dd className="font-medium">{previewData.customerName || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Nummer:</dt>
                        <dd className="font-medium">{previewData.customerNumber || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Prozess:</dt>
                        <dd className="font-medium">{previewData.customerProcess || '-'}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Technische Daten</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Synchroneinrichtung:</dt>
                        <dd className="font-medium">{previewData.hasSynchronizationDevice ? 'Ja' : 'Nein'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Zuführkanal:</dt>
                        <dd className="font-medium">{previewData.feedChannel || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Vorschubstange:</dt>
                        <dd className="font-medium">{previewData.feedRod || '-'}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Drehmaschine</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Hersteller:</dt>
                        <dd className="font-medium">{previewData.latheManufacturer || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Typ:</dt>
                        <dd className="font-medium">{previewData.latheType || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Nummer:</dt>
                        <dd className="font-medium">{previewData.latheNumber || '-'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Warnungen und Probleme */}
                {previewData.issues && previewData.issues.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-600" />
                      Hinweise zur Extraktion
                    </h3>
                    <ul className="space-y-1">
                      {previewData.issues.map((issue: any, idx: number) => (
                        <li key={idx} className={`text-sm ${issue.severity === 'Error' ? 'text-red-600' : 'text-yellow-600'}`}>
                          • {issue.fieldName}: {issue.issue}
                          {issue.suggestedValue && <span className="text-gray-600"> (Vorschlag: {issue.suggestedValue})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex justify-end">
                <Button onClick={() => setShowPreviewModal(false)}>
                  Schließen
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
=======
>>>>>>> 7c5145f396b0f14ebda3d4a196bd00a9d7ca030d
    </Dialog>
  );
};