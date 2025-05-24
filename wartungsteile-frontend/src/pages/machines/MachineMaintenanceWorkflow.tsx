// src/pages/machines/MachineMaintenanceWorkflow.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMachineDetail } from '../../hooks/useMachines';
import { machineService } from '../../services';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CogIcon,
  CalendarDaysIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// 🏭 Wartungspakete basierend auf eurer PDF
interface MaintenancePackage {
  code: string;
  name: string;
  type: 'regular' | 'extensive';
  couplings: number;
  materialCost: number;
  laborHours: number;
  laborCost: number;
  totalCost: number;
  interval: number; // Jahre
  parts: string[];
}

const MAINTENANCE_PACKAGES: MaintenancePackage[] = [
  // Reguläre Wartung (alle 3 Jahre)
  {
    code: 'W.3.0',
    name: 'LM-regularly (0 Kupplungen)',
    type: 'regular',
    couplings: 0,
    materialCost: 150,
    laborHours: 5,
    laborCost: 625,
    totalCost: 775,
    interval: 3,
    parts: ['Relais', 'Optokoppler-Modul komplett', 'Reparaturset - Kupplung Rotor/Anker']
  },
  {
    code: 'W.3.1',
    name: 'LM-regularly (1 Kupplung)',
    type: 'regular',
    couplings: 1,
    materialCost: 450,
    laborHours: 6,
    laborCost: 750,
    totalCost: 1200,
    interval: 3,
    parts: ['Relais', 'Optokoppler-Modul komplett', 'Reparaturset - Kupplung Rotor/Anker', 'Gasdruckdämpfer']
  },
  {
    code: 'W.3.2',
    name: 'LM-regularly (2 Kupplungen)',
    type: 'regular',
    couplings: 2,
    materialCost: 750,
    laborHours: 7,
    laborCost: 875,
    totalCost: 1625,
    interval: 3,
    parts: ['Relais', 'Optokoppler-Modul komplett', 'Reparaturset - Kupplung Rotor/Anker', 'Gasdruckdämpfer']
  },
  // Extensive Wartung (nach 9 Jahren)
  {
    code: 'W.9.0',
    name: 'LM-extensive (0 Kupplungen)',
    type: 'extensive',
    couplings: 0,
    materialCost: 400,
    laborHours: 7,
    laborCost: 875,
    totalCost: 1275,
    interval: 9,
    parts: ['Relais', 'Optokoppler-Modul komplett', 'Reparaturset - Kupplung Rotor/Anker', 'Messingführungen Synchronstange', 'Kunststoffführungen Schlitten', 'Synchronriemen', 'Antriebsriemen', 'Zahnriemen', 'Motor']
  },
  {
    code: 'W.9.1',
    name: 'LM-extensive (1 Kupplung)',
    type: 'extensive',
    couplings: 1,
    materialCost: 700,
    laborHours: 8,
    laborCost: 1000,
    totalCost: 1700,
    interval: 9,
    parts: ['Relais', 'Optokoppler-Modul komplett', 'Reparaturset - Kupplung Rotor/Anker', 'Messingführungen Synchronstange', 'Kunststoffführungen Schlitten', 'Synchronriemen', 'Antriebsriemen', 'Zahnriemen', 'Motor']
  },
  {
    code: 'W.9.2',
    name: 'LM-extensive (2 Kupplungen)',
    type: 'extensive',
    couplings: 2,
    materialCost: 1000,
    laborHours: 9,
    laborCost: 1125,
    totalCost: 2125,
    interval: 9,
    parts: ['Relais', 'Optokoppler-Modul komplett', 'Reparaturset - Kupplung Rotor/Anker', 'Messingführungen Synchronstange', 'Kunststoffführungen Schlitten', 'Synchronriemen', 'Antriebsriemen', 'Zahnriemen', 'Motor']
  }
];

const MachineMaintenanceWorkflow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: machine, isLoading, error } = useMachineDetail(id || '');

  const [selectedPackage, setSelectedPackage] = useState<MaintenancePackage | null>(null);
  const [isPerforming, setIsPerforming] = useState(false);
  const [comments, setComments] = useState('');

  // 🧠 Intelligente Wartungsempfehlung
  const getMaintenanceRecommendation = () => {
    if (!machine) return null;

    // 1. Alter der Maschine berechnen
    const installationDate = new Date(machine.installationDate);
    const now = new Date();
    const machineAgeYears = Math.floor((now.getTime() - installationDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

    // 2. Letzte Wartung finden
    let lastMaintenanceDate: Date | null = null;
    let yearsSinceLastMaintenance = machineAgeYears;
    
    if (machine.maintenanceRecords && machine.maintenanceRecords.length > 0) {
      const sortedRecords = machine.maintenanceRecords
        .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
      lastMaintenanceDate = new Date(sortedRecords[0].performedAt);
      yearsSinceLastMaintenance = Math.floor((now.getTime() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    }

    // 3. Anzahl Kupplungen ermitteln (vereinfacht: Synchroneinrichtung = 1 Kupplung)
    const couplings = machine.hasSynchronizationDevice ? 1 : 0;

    // 4. Wartungstyp bestimmen
    let recommendedType: 'regular' | 'extensive';
    let urgency: 'ok' | 'due' | 'overdue';

    if (machineAgeYears >= 9 || yearsSinceLastMaintenance >= 9) {
      recommendedType = 'extensive';
      urgency = yearsSinceLastMaintenance >= 10 ? 'overdue' : yearsSinceLastMaintenance >= 9 ? 'due' : 'ok';
    } else {
      recommendedType = 'regular';
      urgency = yearsSinceLastMaintenance >= 4 ? 'overdue' : yearsSinceLastMaintenance >= 3 ? 'due' : 'ok';
    }

    // 5. Passendes Wartungspaket finden
    const recommendedPackage = MAINTENANCE_PACKAGES.find(
      pkg => pkg.type === recommendedType && pkg.couplings === couplings
    );

    return {
      machineAgeYears,
      lastMaintenanceDate,
      yearsSinceLastMaintenance,
      couplings,
      recommendedType,
      recommendedPackage,
      urgency
    };
  };

  const recommendation = getMaintenanceRecommendation();

  // Auto-select recommended package
  useEffect(() => {
    if (recommendation?.recommendedPackage && !selectedPackage) {
      setSelectedPackage(recommendation.recommendedPackage);
    }
  }, [recommendation, selectedPackage]);

  // Wartung durchführen
  const handlePerformMaintenance = async () => {
    if (!machine || !selectedPackage || !id) return;

    setIsPerforming(true);
    try {
      // Wartung im Backend speichern
      const maintenanceData = {
        machineId: id,
        technicianId: '00000000-0000-0000-0000-000000000001', // Dummy Techniker-ID
        maintenanceType: selectedPackage.type === 'extensive' ? 'OnDemand' : 'Regular',
        comments: `${selectedPackage.code} - ${selectedPackage.name}\n\nMaterial: ${selectedPackage.materialCost}€\nArbeit: ${selectedPackage.laborHours} Std. / ${selectedPackage.laborCost}€\nGesamt: ${selectedPackage.totalCost}€\n\nKommentare: ${comments}`,
        replacedParts: [] // Hier könnten echte Teile-IDs stehen
      };

      await machineService.performMaintenance(id, maintenanceData);

      // Cache invalidieren
      queryClient.invalidateQueries({ queryKey: ['machine', id] });
      
      // Zurück zur Maschine mit Erfolgsmeldung
      navigate(`/machines/${id}`, { 
        state: { message: `Wartung ${selectedPackage.code} erfolgreich dokumentiert!` }
      });

    } catch (error: any) {
      console.error('Fehler beim Speichern der Wartung:', error);
      alert(`Fehler beim Speichern: ${error.response?.data || error.message}`);
    } finally {
      setIsPerforming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link to={`/machines/${id}`} className="text-primary hover:text-primary/80">
            ← Zurück zur Maschine
          </Link>
        </div>
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Wartungsanalyse läuft</h3>
          <p className="text-gray-500">Maschinendaten werden analysiert...</p>
        </div>
      </div>
    );
  }

  if (error || !machine || !recommendation) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link to={`/machines/${id}`} className="text-primary hover:text-primary/80">
            ← Zurück zur Maschine
          </Link>
        </div>
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-lg font-medium text-red-600 mb-2">Wartungsanalyse fehlgeschlagen</h3>
          <p className="text-gray-500 mb-4">Die Maschine konnte nicht analysiert werden.</p>
          <Link 
            to={`/machines/${id}`}
            className="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Zurück zur Maschine</span>
          </Link>
        </div>
      </div>
    );
  }

  const urgencyColors = {
    ok: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' },
    due: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-600' },
    overdue: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' }
  };

  const urgencyColor = urgencyColors[recommendation.urgency];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to={`/machines/${id}`}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Zurück zur Maschine</span>
          </Link>
          <div className="h-8 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Wartung durchführen</h1>
            <p className="text-gray-600 text-lg">Maschine {machine.number} - {machine.type}</p>
          </div>
        </div>
      </div>

      {/* Wartungsanalyse */}
      <div className={`p-6 rounded-xl border-2 ${urgencyColor.bg} ${urgencyColor.border}`}>
        <div className="flex items-center space-x-3 mb-4">
          <ChartBarIcon className={`h-6 w-6 ${urgencyColor.icon}`} />
          <div>
            <h2 className="text-xl font-bold text-gray-800">🤖 Intelligente Wartungsanalyse</h2>
            <p className={`text-sm ${urgencyColor.text}`}>
              {recommendation.urgency === 'overdue' ? '⚠️ Wartung überfällig!' :
               recommendation.urgency === 'due' ? '📅 Wartung empfohlen' : 
               '✅ Wartung nicht dringend erforderlich'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-blue-600 text-sm font-medium">Maschinenalter:</span>
              <p className="font-semibold text-gray-800">{recommendation.machineAgeYears} Jahre</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-blue-600 text-sm font-medium">Letzte Wartung:</span>
              <p className="font-semibold text-gray-800">
                {recommendation.lastMaintenanceDate 
                  ? `vor ${recommendation.yearsSinceLastMaintenance} Jahr${recommendation.yearsSinceLastMaintenance !== 1 ? 'en' : ''}`
                  : 'Noch nie'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CogIcon className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-blue-600 text-sm font-medium">Kupplungen:</span>
              <p className="font-semibold text-gray-800">{recommendation.couplings}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-blue-600 text-sm font-medium">Empfehlung:</span>
              <p className="font-semibold text-gray-800">
                {recommendation.recommendedType === 'extensive' ? 'Große Wartung' : 'Reguläre Wartung'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wartungspaket-Auswahl */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200">
          <h2 className="text-xl font-bold text-blue-800">💼 Wartungspaket auswählen</h2>
          <p className="text-blue-600 text-sm">Basierend auf eurer FMB-Preismatrix</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MAINTENANCE_PACKAGES
              .filter(pkg => pkg.couplings === recommendation.couplings)
              .map((pkg) => (
                <div
                  key={pkg.code}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPackage?.code === pkg.code
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  } ${pkg.code === recommendation.recommendedPackage?.code ? 'ring-2 ring-green-200' : ''}`}
                >
                  {pkg.code === recommendation.recommendedPackage?.code && (
                    <div className="flex items-center space-x-1 text-green-600 text-xs font-medium mb-2">
                      <CheckIcon className="h-3 w-3" />
                      <span>Empfohlen</span>
                    </div>
                  )}
                  
                  <div className="text-lg font-bold text-gray-800 mb-2">{pkg.code}</div>
                  <div className="text-sm text-gray-600 mb-3">{pkg.name}</div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Material:</span>
                      <span className="font-medium">{pkg.materialCost}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Arbeit:</span>
                      <span className="font-medium">{pkg.laborHours} Std. / {pkg.laborCost}€</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-bold">
                      <span>Gesamt:</span>
                      <span className="text-primary">{pkg.totalCost}€</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Wartungsdetails */}
      {selectedPackage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
            <h2 className="text-xl font-bold text-green-800">🔧 Wartungspaket: {selectedPackage.code}</h2>
            <p className="text-green-600 text-sm">{selectedPackage.name}</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Teileauswahl */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Enthaltene Arbeiten:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedPackage.parts.map((part, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">{part}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kommentare */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kommentare / Notizen:
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Zusätzliche Bemerkungen zur durchgeführten Wartung..."
              />
            </div>

            {/* Zusammenfassung */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📋 Wartungs-Zusammenfassung:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Wartungspaket:</span>
                  <p className="font-medium">{selectedPackage.code}</p>
                </div>
                <div>
                  <span className="text-gray-500">Arbeitszeit:</span>
                  <p className="font-medium">{selectedPackage.laborHours} Stunden</p>
                </div>
                <div>
                  <span className="text-gray-500">Materialkosten:</span>
                  <p className="font-medium">{selectedPackage.materialCost}€</p>
                </div>
                <div>
                  <span className="text-gray-500">Gesamtkosten:</span>
                  <p className="font-bold text-primary">{selectedPackage.totalCost}€</p>
                </div>
              </div>
            </div>

            {/* Aktionsbuttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Link
                to={`/machines/${id}`}
                className="px-6 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </Link>
              <button
                onClick={handlePerformMaintenance}
                disabled={isPerforming}
                className="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all shadow-sm disabled:cursor-not-allowed"
              >
                {isPerforming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Wird dokumentiert...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Wartung abschließen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineMaintenanceWorkflow;