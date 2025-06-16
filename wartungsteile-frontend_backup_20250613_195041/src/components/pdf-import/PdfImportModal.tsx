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
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: any;
  error?: string;
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleImport = async () => {
    setIsImporting(true);
    const formData = new FormData();
    
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
            result: fileResult
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
      console.error('Import error:', error);
      setFiles(prev => prev.map(file => ({
        ...file,
        status: 'error',
        error: 'Import fehlgeschlagen'
      })));
    } finally {
      setIsImporting(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setImportResults(null);
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
            {/* Dropzone */}
            {files.length === 0 && (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors duration-200
                  ${isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
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
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">
                    {files.length} Datei{files.length !== 1 ? 'en' : ''} ausgewählt
                  </h3>
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
                      <div>
                        <p className="font-medium text-sm">{pdfFile.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(pdfFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {pdfFile.result && (
                          <div className="mt-1">
                            {pdfFile.result.machineNumber && (
                              <p className="text-xs text-green-600">
                                Maschine: {pdfFile.result.machineNumber}
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
                        <button
                          onClick={() => removeFile(pdfFile.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      )}
                      {pdfFile.status === 'uploading' && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                      )}
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
    </Dialog>
  );
};