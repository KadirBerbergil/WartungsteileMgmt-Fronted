// src/components/SimpleBackendTest.tsx
import { useState } from 'react';
import { maintenancePartService } from '../services';

const SimpleBackendTest = () => {
  const [status, setStatus] = useState<string>('Bereit');
  const [isLoading, setIsLoading] = useState(false);

  const testBackend = async () => {
    setIsLoading(true);
    setStatus('Teste Backend...');

    try {
      // Test 1: Wartungsteile laden
      setStatus('Lade Wartungsteile...');
      const parts = await maintenancePartService.getAll();
      setStatus(`✅ Backend funktioniert! ${parts.length} Wartungsteile gefunden.`);
      
    } catch (error: any) {
      console.error('Backend-Test Fehler:', error);
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setStatus('❌ Netzwerkfehler - Backend nicht erreichbar!');
      } else if (error.response?.status === 400) {
        setStatus(`❌ Bad Request (400) - Datenformat-Problem`);
      } else if (error.response?.status === 404) {
        setStatus(`❌ Not Found (404) - Endpoint existiert nicht`);
      } else if (error.response?.status >= 500) {
        setStatus(`❌ Server Error (${error.response?.status})`);
      } else {
        setStatus(`❌ Fehler: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testCreate = async () => {
    setIsLoading(true);
    setStatus('Teste Wartungsteil erstellen...');

    try {
      const testData = {
        partNumber: `TEST-${Date.now()}`,
        name: 'Test Wartungsteil',
        description: 'Test Beschreibung',
        category: 'WearPart',
        price: 99.99,
        manufacturer: 'Test Hersteller',
        stockQuantity: 5
      };

      const newId = await maintenancePartService.create(testData);
      setStatus(`✅ Wartungsteil erstellt! ID: ${newId}`);
      
      // Aufräumen - Teil wieder löschen
      setTimeout(async () => {
        try {
          await maintenancePartService.delete(newId);
          setStatus(`✅ Test erfolgreich - Testteil wurde aufgeräumt`);
        } catch (deleteError) {
          setStatus(`⚠️ Teil erstellt, aber Aufräumen fehlgeschlagen`);
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Create-Test Fehler:', error);
      
      if (error.response?.status === 400) {
        setStatus(`❌ Create fehlgeschlagen (400) - Validierungsfehler`);
        console.log('Gesendete Daten:', error.config?.data);
        console.log('Backend-Antwort:', error.response?.data);
      } else {
        setStatus(`❌ Create fehlgeschlagen: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 Backend-Test</h2>
        
        <div className="space-y-4">
          <div className="flex space-x-3">
            <button
              onClick={testBackend}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              {isLoading ? '⏳ Teste...' : '📋 Wartungsteile laden'}
            </button>

            <button
              onClick={testCreate}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              {isLoading ? '⏳ Teste...' : '➕ Wartungsteil erstellen'}
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-medium text-gray-700 mb-2">Status:</h3>
            <p className="text-sm font-mono">{status}</p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Frontend:</strong> {window.location.origin}</p>
            <p><strong>API-Proxy:</strong> /api → https://localhost:7024/api</p>
            <p><strong>Tipp:</strong> Öffne die Browser-Konsole (F12) für Details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBackendTest;