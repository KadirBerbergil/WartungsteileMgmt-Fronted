// src/components/BackendTest.tsx - Reparierte Version
import { useState } from 'react';
import { api } from '../services/api';
import { maintenancePartService } from '../services';

const BackendTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const log = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  // Backend-Status prüfen (lokale Funktion)
  const checkBackendStatus = async () => {
    try {
      const response = await api.get('/Machines');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    log('🚀 Starte Backend-Tests...');
    
    // Test 1: Backend-Status
    log('1️⃣ Teste Backend-Verbindung...');
    try {
      const isReachable = await checkBackendStatus();
      if (isReachable) {
        log('✅ Backend ist erreichbar!');
      } else {
        log('❌ Backend nicht erreichbar!');
      }
    } catch (error) {
      log(`❌ Backend-Test fehlgeschlagen: ${error}`);
    }

    // Test 2: Wartungsteile laden
    log('2️⃣ Teste Wartungsteile-API...');
    try {
      const parts = await maintenancePartService.getAll();
      log(`✅ Wartungsteile geladen: ${parts.length} Teile gefunden`);
    } catch (error: any) {
      log(`❌ Wartungsteile-Test fehlgeschlagen: ${error.response?.status || error.message}`);
    }

    // Test 3: Neues Wartungsteil erstellen
    log('3️⃣ Teste Wartungsteil erstellen...');
    try {
      const testPart = {
        partNumber: 'TEST-' + Date.now(),
        name: 'Test Wartungsteil',
        description: 'Automatisch generiertes Testteil',
        category: 'WearPart',
        price: 99.99,
        manufacturer: 'Test Hersteller',
        stockQuantity: 10
      };
      
      log(`📤 Sende Daten: ${JSON.stringify(testPart, null, 2)}`);
      
      const newPartId = await maintenancePartService.create(testPart);
      log(`✅ Wartungsteil erstellt! ID: ${newPartId}`);
      
      // Test 4: Erstelltes Teil wieder löschen
      log('4️⃣ Räume Testteil auf...');
      try {
        await maintenancePartService.delete(newPartId);
        log('✅ Testteil erfolgreich gelöscht');
      } catch (deleteError: any) {
        log(`⚠️ Testteil konnte nicht gelöscht werden: ${deleteError.message}`);
      }
      
    } catch (createError: any) {
      log(`❌ Wartungsteil-Erstellung fehlgeschlagen:`);
      log(`   Status: ${createError.response?.status}`);
      log(`   Message: ${createError.message}`);
      log(`   Data: ${JSON.stringify(createError.response?.data, null, 2)}`);
    }

    log('🏁 Backend-Tests abgeschlossen!');
    setIsRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Backend-Verbindung testen</h2>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all"
          >
            {isRunning ? 'Tests laufen...' : 'Backend-Tests starten'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Test-Log:</h3>
            <div className="text-sm font-mono space-y-1 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`${
                    result.includes('✅') ? 'text-green-400' :
                    result.includes('❌') ? 'text-red-400' :
                    result.includes('⚠️') ? 'text-yellow-400' :
                    'text-gray-300'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <h4 className="font-medium mb-2">Debug-Informationen:</h4>
          <ul className="space-y-1 text-xs">
            <li><strong>Frontend-URL:</strong> {window.location.origin}</li>
            <li><strong>API-Base-URL:</strong> /api (proxied)</li>
            <li><strong>Erwartetes Backend:</strong> https://localhost:7024</li>
            <li><strong>Browser:</strong> {navigator.userAgent.split(' ').slice(-2).join(' ')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackendTest;