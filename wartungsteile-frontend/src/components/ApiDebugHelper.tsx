// src/components/ApiDebugHelper.tsx - Neue Debug-Komponente
import { useState } from 'react';
import { api, checkBackendStatus } from '../services/api';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  GlobeAltIcon,
  ServerIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface DebugResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const ApiDebugHelper = ({ onClose }: { onClose?: () => void }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    const newResults: DebugResult[] = [];

    // Test 1: Frontend-Konfiguration
    newResults.push({
      test: 'Frontend-Konfiguration',
      status: 'success',
      message: 'Frontend läuft korrekt',
      details: `URL: ${window.location.origin}\nPort: ${window.location.port || '80'}`
    });

    // Test 2: API-Proxy-Test
    try {
      newResults.push({
        test: 'API-Proxy-Test',
        status: 'success',
        message: 'Proxy-Route ist konfiguriert',
        details: 'Route: /api → https://localhost:7024/api'
      });
    } catch (error) {
      newResults.push({
        test: 'API-Proxy-Test',
        status: 'error',
        message: 'Proxy-Konfiguration fehlerhaft',
        details: 'Prüfe vite.config.ts'
      });
    }

    // Test 3: Backend-Erreichbarkeit (über Proxy)
    try {
      const isReachable = await checkBackendStatus();
      if (isReachable) {
        newResults.push({
          test: 'Backend-Verbindung (Proxy)',
          status: 'success',
          message: 'Backend ist über Proxy erreichbar',
          details: 'API-Calls funktionieren korrekt'
        });
      } else {
        newResults.push({
          test: 'Backend-Verbindung (Proxy)',
          status: 'error',
          message: 'Backend nicht über Proxy erreichbar',
          details: 'Prüfe Backend-Status und Proxy-Konfiguration'
        });
      }
    } catch (error: any) {
      newResults.push({
        test: 'Backend-Verbindung (Proxy)',
        status: 'error',
        message: 'Proxy-Verbindung fehlgeschlagen',
        details: error.message
      });
    }

    // Test 4: Direkter Backend-Test (Troubleshooting)
    try {
      const response = await fetch('https://localhost:7024/api/Machines', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        newResults.push({
          test: 'Backend-Direct-Test',
          status: 'warning',
          message: 'Backend läuft, aber Proxy wird nicht genutzt',
          details: 'API-Konfiguration sollte auf /api geändert werden'
        });
      }
    } catch (error: any) {
      if (error.message.includes('CORS') || error.message.includes('cors')) {
        newResults.push({
          test: 'Backend-Direct-Test',
          status: 'warning',
          message: 'Backend läuft, aber CORS-Probleme',
          details: 'Nutze Proxy statt direkter Verbindung'
        });
      } else {
        newResults.push({
          test: 'Backend-Direct-Test',
          status: 'error',
          message: 'Backend ist nicht erreichbar',
          details: 'Backend möglicherweise nicht gestartet (dotnet run)'
        });
      }
    }

    // Test 5: API-Endpoint-Test
    try {
      const response = await api.get('/Machines');
      if (response.status === 200) {
        newResults.push({
          test: 'API-Endpoint-Test',
          status: 'success',
          message: `API funktioniert (${response.data?.length || 0} Maschinen)`,
          details: 'Alle API-Calls sollten funktionieren'
        });
      }
    } catch (error: any) {
      newResults.push({
        test: 'API-Endpoint-Test',
        status: 'error',
        message: 'API-Endpoints nicht erreichbar',
        details: error.response?.data || error.message
      });
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DebugResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: DebugResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warning');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">🔧 API-Diagnose</h2>
                <p className="text-gray-600 text-sm">Backend-Verbindung testen</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          
          {/* Start Button */}
          <div className="mb-6">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Diagnose läuft...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Diagnose starten</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              
              {/* Summary */}
              <div className={`p-4 rounded-lg border ${
                hasErrors 
                  ? 'border-red-200 bg-red-50' 
                  : hasWarnings 
                    ? 'border-amber-200 bg-amber-50' 
                    : 'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-center space-x-3">
                  {hasErrors ? (
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  ) : hasWarnings ? (
                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                  ) : (
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  )}
                  <div>
                    <p className={`font-semibold ${
                      hasErrors ? 'text-red-800' : hasWarnings ? 'text-amber-800' : 'text-green-800'
                    }`}>
                      {hasErrors 
                        ? 'Probleme erkannt' 
                        : hasWarnings 
                          ? 'Warnungen vorhanden' 
                          : 'Alles funktioniert'
                      }
                    </p>
                    <p className={`text-sm ${
                      hasErrors ? 'text-red-700' : hasWarnings ? 'text-amber-700' : 'text-green-700'
                    }`}>
                      {results.filter(r => r.status === 'success').length} erfolgreich, {' '}
                      {results.filter(r => r.status === 'warning').length} Warnungen, {' '}
                      {results.filter(r => r.status === 'error').length} Fehler
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{result.test}</p>
                        <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                        {showDetails && result.details && (
                          <div className="mt-2 p-2 bg-white rounded text-xs font-mono text-gray-600">
                            {result.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Toggle Details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showDetails ? 'Details ausblenden' : 'Details anzeigen'}
              </button>

              {/* Lösungsvorschläge */}
              {hasErrors && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3">💡 Lösungsvorschläge:</h3>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li>1. ✅ API-Konfiguration auf <code>/api</code> ändern (nicht <code>https://localhost:7024/api</code>)</li>
                    <li>2. 🚀 Backend starten: <code>dotnet run</code> im Backend-Verzeichnis</li>
                    <li>3. 🔄 Frontend neu starten: <code>npm run dev</code></li>
                    <li>4. 🌐 Proxy-Konfiguration in <code>vite.config.ts</code> prüfen</li>
                    <li>5. 🔍 Browser-Konsole auf Fehler prüfen (F12)</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* System Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">Frontend:</span> {window.location.origin}
              </div>
              <div>
                <span className="font-medium">API-Base:</span> /api
              </div>
              <div>
                <span className="font-medium">Proxy-Target:</span> https://localhost:7024
              </div>
              <div>
                <span className="font-medium">User-Agent:</span> {navigator.userAgent.split(' ').slice(-1)[0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDebugHelper;