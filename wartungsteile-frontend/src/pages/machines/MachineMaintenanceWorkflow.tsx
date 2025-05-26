// src/pages/machines/MachineMaintenanceWorkflow.tsx - Professionelle B2B-Version
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMachineDetail } from '../../hooks/useMachines';
import { useMaintenancePartsList } from '../../hooks/useParts';
import { machineService } from '../../services';
import { 
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  CogIcon,
  CalendarDaysIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CubeIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

type WorkflowStep = 'analysis' | 'parts' | 'confirm' | 'complete';

interface SelectedPart {
  partId: string;
  partNumber: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  isRequired: boolean;
  isOverdue: boolean;
  maxQuantity: number;
}

const MachineMaintenanceWorkflow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: machine, isLoading: machineLoading, error: machineError } = useMachineDetail(id || '');
  const { data: partsList, isLoading: partsLoading, error: partsError } = useMaintenancePartsList(machine?.number || '');

  const [currentStep, setCurrentStep] = useState<WorkflowStep>('analysis');
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [comments, setComments] = useState('');
  const [isPerforming, setIsPerforming] = useState(false);

  const getMaintenanceAnalysis = () => {
    if (!machine || !partsList) return null;

    const installationDate = new Date(machine.installationDate);
    const now = new Date();
    const machineAgeYears = Math.floor((now.getTime() - installationDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

    let lastMaintenanceDate: Date | null = null;
    let yearsSinceLastMaintenance = machineAgeYears;
    
    if (machine.maintenanceRecords && machine.maintenanceRecords.length > 0) {
      const sortedRecords = machine.maintenanceRecords
        .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
      lastMaintenanceDate = new Date(sortedRecords[0].performedAt);
      yearsSinceLastMaintenance = Math.floor((now.getTime() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    }

    const overdueCount = [...partsList.requiredParts, ...partsList.recommendedParts]
      .filter(part => part.isOverdue).length;
    
    const urgency = overdueCount > 0 ? 'high' : 
                  partsList.requiredParts.length > 0 ? 'medium' : 'low';

    const requiredCosts = partsList.requiredParts.reduce((sum, part) => 
      sum + (part.price * part.recommendedQuantity), 0);
    const recommendedCosts = partsList.recommendedParts.reduce((sum, part) => 
      sum + (part.price * part.recommendedQuantity), 0);

    return {
      machineAgeYears,
      lastMaintenanceDate,
      yearsSinceLastMaintenance,
      urgency,
      requiredPartsCount: partsList.requiredParts.length,
      recommendedPartsCount: partsList.recommendedParts.length,
      overdueCount,
      requiredCosts,
      recommendedCosts,
      totalPossibleCosts: requiredCosts + recommendedCosts
    };
  };

  const analysis = getMaintenanceAnalysis();

  useEffect(() => {
    if (partsList && selectedParts.length === 0) {
      const initialSelection: SelectedPart[] = [];
      
      partsList.requiredParts.forEach(part => {
        initialSelection.push({
          partId: part.partId,
          partNumber: part.partNumber,
          name: part.name,
          category: part.category,
          price: part.price,
          quantity: part.recommendedQuantity,
          isRequired: true,
          isOverdue: part.isOverdue,
          maxQuantity: part.recommendedQuantity * 2
        });
      });

      partsList.recommendedParts.filter(part => part.isOverdue).forEach(part => {
        initialSelection.push({
          partId: part.partId,
          partNumber: part.partNumber,
          name: part.name,
          category: part.category,
          price: part.price,
          quantity: part.recommendedQuantity,
          isRequired: false,
          isOverdue: part.isOverdue,
          maxQuantity: part.recommendedQuantity * 3
        });
      });

      setSelectedParts(initialSelection);
    }
  }, [partsList, selectedParts.length]);

  const togglePartSelection = (part: any, isRequired: boolean = false) => {
    const existingIndex = selectedParts.findIndex(p => p.partId === part.partId);
    
    if (existingIndex >= 0) {
      if (!selectedParts[existingIndex].isRequired) {
        setSelectedParts(prev => prev.filter((_, i) => i !== existingIndex));
      }
    } else {
      const newPart: SelectedPart = {
        partId: part.partId,
        partNumber: part.partNumber,
        name: part.name,
        category: part.category,
        price: part.price,
        quantity: part.recommendedQuantity,
        isRequired,
        isOverdue: part.isOverdue,
        maxQuantity: part.recommendedQuantity * (isRequired ? 2 : 3)
      };
      setSelectedParts(prev => [...prev, newPart]);
    }
  };

  const updatePartQuantity = (partId: string, newQuantity: number) => {
    setSelectedParts(prev => prev.map(part => 
      part.partId === partId 
        ? { ...part, quantity: Math.max(1, Math.min(newQuantity, part.maxQuantity)) }
        : part
    ));
  };

  const calculateTotalCosts = () => {
    return selectedParts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
  };

  const handlePerformMaintenance = async () => {
    if (!machine || !id || selectedParts.length === 0) return;

    setIsPerforming(true);
    try {
      const maintenanceData = {
        machineId: id,
        technicianId: '00000000-0000-0000-0000-000000000001',
        maintenanceType: analysis?.urgency === 'high' ? 'Repair' : 'Regular',
        comments: `Wartung durchgeführt:\n\n${selectedParts.length} Teile ausgetauscht:\n${selectedParts.map(p => `- ${p.name} (${p.partNumber}): ${p.quantity}x`).join('\n')}\n\nGesamtkosten: ${calculateTotalCosts().toFixed(2)}€\n\nKommentare: ${comments}`,
        replacedParts: selectedParts.map(part => ({
          partId: part.partId,
          quantity: part.quantity
        }))
      };

      await machineService.performMaintenance(id, maintenanceData);
      queryClient.invalidateQueries({ queryKey: ['machine', id] });
      queryClient.invalidateQueries({ queryKey: ['maintenancePartsList', machine.number] });
      
      setCurrentStep('complete');
      
      setTimeout(() => {
        navigate(`/machines/${id}`);
      }, 3000);

    } catch (error: any) {
      alert(`Fehler beim Speichern: ${error.response?.data || error.message}`);
    } finally {
      setIsPerforming(false);
    }
  };

  const steps = [
    { id: 'analysis', name: 'Analyse', icon: ChartBarIcon },
    { id: 'parts', name: 'Teile', icon: CogIcon },
    { id: 'confirm', name: 'Bestätigen', icon: DocumentTextIcon },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id as WorkflowStep);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id as WorkflowStep);
    }
  };

  if (machineLoading || partsLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Wartungsanalyse läuft</h3>
          <p className="text-gray-500">System analysiert Maschinenspezifikationen und generiert Wartungsteileliste...</p>
        </div>
      </div>
    );
  }

  if (machineError || partsError || !machine || !partsList || !analysis) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white border border-gray-200 p-8 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-600 mb-2">Systemintegration fehlgeschlagen</h3>
          <p className="text-gray-500 mb-4">
            Die Wartungsanalyse konnte nicht durchgeführt werden.
          </p>
          <Link 
            to={`/machines/${id}`}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-all"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Zurück zur Maschine</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to={`/machines/${id}`}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Zurück zur Maschine</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Wartung durchführen</h1>
            <p className="text-gray-600">Maschine {machine.number} - {machine.type}</p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p className="font-medium">Systemanalyse erfolgreich</p>
          <p>{analysis.requiredPartsCount + analysis.recommendedPartsCount} Teile analysiert</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-3 ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 flex items-center justify-center border-2 ${
                    isActive ? 'border-blue-600 bg-blue-50' : 
                    isCompleted ? 'border-green-600 bg-green-50' : 'border-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-medium">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-px w-16 ${
                    index < currentStepIndex ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'analysis' && (
        <div className="space-y-6">
          <div className={`p-6 border-2 ${
            analysis.urgency === 'high' ? 'bg-red-50 border-red-200' :
            analysis.urgency === 'medium' ? 'bg-amber-50 border-amber-200' :
            'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ChartBarIcon className={`h-6 w-6 ${
                  analysis.urgency === 'high' ? 'text-red-600' :
                  analysis.urgency === 'medium' ? 'text-amber-600' :
                  'text-green-600'
                }`} />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Wartungsanalyse</h2>
                  <p className={`text-sm ${
                    analysis.urgency === 'high' ? 'text-red-700' :
                    analysis.urgency === 'medium' ? 'text-amber-700' :
                    'text-green-700'
                  }`}>
                    {analysis.urgency === 'high' ? 'Wartung dringend erforderlich' :
                     analysis.urgency === 'medium' ? 'Wartung empfohlen' : 
                     'Präventive Wartung'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-blue-600">{analysis.totalPossibleCosts.toFixed(0)}€</div>
                <div className="text-sm text-gray-600">Mögliche Gesamtkosten</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <CalendarDaysIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Maschinenalter</p>
                <p className="text-lg font-semibold text-gray-800">{analysis.machineAgeYears} Jahre</p>
              </div>
              <div className="text-center">
                <ClockIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Letzte Wartung</p>
                <p className="text-lg font-semibold text-gray-800">
                  vor {analysis.yearsSinceLastMaintenance} Jahr{analysis.yearsSinceLastMaintenance !== 1 ? 'en' : ''}
                </p>
              </div>
              <div className="text-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Pflichtteile</p>
                <p className="text-lg font-semibold text-red-600">{analysis.requiredPartsCount}</p>
              </div>
              <div className="text-center">
                <CogIcon className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Empfohlene Teile</p>
                <p className="text-lg font-semibold text-amber-600">{analysis.recommendedPartsCount}</p>
              </div>
              <div className="text-center">
                <WrenchScrewdriverIcon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Überfällig</p>
                <p className="text-lg font-semibold text-orange-600">{analysis.overdueCount}</p>
              </div>
            </div>

            <div className="bg-white/50 p-4">
              <h3 className="font-medium text-gray-800 mb-2">Analyse-Report:</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                Ihre <strong>{machine.type}</strong> Maschine (Baujahr {partsList.machineProductionYear}) wurde 
                analysiert. Das System hat basierend auf Maschinennummer <strong>{machine.number}</strong>, 
                Magazin-Eigenschaften (Materialstangenlänge: {machine.materialBarLength}mm, 
                Synchroneinrichtung: {machine.hasSynchronizationDevice ? 'Ja' : 'Nein'}) und 
                Wartungshistorie eine optimale Teileliste generiert. 
                {analysis.overdueCount > 0 && (
                  <span className="text-red-700 font-medium"> {analysis.overdueCount} Teile sind überfällig.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium transition-all"
            >
              <span>Wartungsteile auswählen</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'parts' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
              <h2 className="text-xl font-semibold text-blue-800">Teile-Auswahl</h2>
              <p className="text-blue-600 text-sm">Basiert auf Systemkompatibilitätsmatrix und Maschineneigenschaften</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-800">Aktuell ausgewählt:</h3>
                    <p className="text-blue-600 text-sm">{selectedParts.length} Teile</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-blue-800">{calculateTotalCosts().toFixed(2)}€</div>
                    <div className="text-blue-600 text-sm">Gesamtkosten</div>
                  </div>
                </div>
              </div>

              {partsList.requiredParts.length > 0 && (
                <div>
                  <h3 className="font-medium text-red-700 mb-3 flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span>Pflichtteile (automatisch ausgewählt)</span>
                  </h3>
                  <div className="space-y-2">
                    {partsList.requiredParts.map((part, index) => {
                      const selectedPart = selectedParts.find(p => p.partId === part.partId);
                      return (
                        <div key={index} className="flex items-center justify-between p-4 bg-red-50 border border-red-200">
                          <div className="flex items-center space-x-3">
                            <CheckIcon className="h-5 w-5 text-red-600" />
                            <div>
                              <p className="font-medium text-gray-800">{part.name}</p>
                              <p className="text-sm text-gray-600">{part.partNumber} • {part.price.toFixed(2)}€/Stück</p>
                              {part.isOverdue && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800">
                                  Überfällig
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => selectedPart && updatePartQuantity(part.partId, selectedPart.quantity - 1)}
                                disabled={!selectedPart || selectedPart.quantity <= 1}
                                className="w-6 h-6 bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                              >
                                <MinusIcon className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center font-medium">{selectedPart?.quantity || 0}</span>
                              <button
                                onClick={() => selectedPart && updatePartQuantity(part.partId, selectedPart.quantity + 1)}
                                disabled={!selectedPart || selectedPart.quantity >= selectedPart.maxQuantity}
                                className="w-6 h-6 bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                              >
                                <PlusIcon className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="text-right min-w-[70px]">
                              <p className="font-semibold text-gray-800 text-sm">{selectedPart ? (selectedPart.price * selectedPart.quantity).toFixed(2) : '0.00'}€</p>
                              <p className="text-xs text-gray-500">Gesamt</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {partsList.recommendedParts.length > 0 && (
                <div>
                  <h3 className="font-medium text-amber-700 mb-3 flex items-center space-x-2">
                    <CogIcon className="h-5 w-5" />
                    <span>Empfohlene Teile (auswählbar)</span>
                  </h3>
                  <div className="space-y-2">
                    {partsList.recommendedParts.map((part, index) => {
                      const isSelected = selectedParts.some(p => p.partId === part.partId);
                      const selectedPart = selectedParts.find(p => p.partId === part.partId);
                      
                      return (
                        <div key={index} className={`flex items-center justify-between p-4 border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-amber-50 border-amber-200' 
                            : 'bg-gray-50 border-gray-200 hover:bg-amber-25 hover:border-amber-300'
                        } ${part.isOverdue ? 'ring-2 ring-orange-200' : ''}`}>
                          <div className="flex items-center space-x-3" onClick={() => togglePartSelection(part)}>
                            <div className={`w-5 h-5 border-2 flex items-center justify-center ${
                              isSelected ? 'bg-amber-600 border-amber-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{part.name}</p>
                              <p className="text-sm text-gray-600">{part.partNumber} • {part.price.toFixed(2)}€/Stück</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {part.isOverdue && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800">
                                    Überfällig
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  Wartungsintervall: {part.maintenanceIntervalYears} Jahre
                                </span>
                              </div>
                            </div>
                          </div>
                          {isSelected && selectedPart && (
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updatePartQuantity(part.partId, selectedPart.quantity - 1);
                                  }}
                                  disabled={selectedPart.quantity <= 1}
                                  className="w-6 h-6 bg-amber-100 text-amber-600 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                                >
                                  <MinusIcon className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center font-medium">{selectedPart.quantity}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updatePartQuantity(part.partId, selectedPart.quantity + 1);
                                  }}
                                  disabled={selectedPart.quantity >= selectedPart.maxQuantity}
                                  className="w-6 h-6 bg-amber-100 text-amber-600 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                                >
                                  <PlusIcon className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="text-right min-w-[70px]">
                                <p className="font-semibold text-gray-800 text-sm">{(selectedPart.price * selectedPart.quantity).toFixed(2)}€</p>
                                <p className="text-xs text-gray-500">Gesamt</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {partsList.requiredParts.length === 0 && partsList.recommendedParts.length === 0 && (
                <div className="text-center py-8">
                  <CubeIcon className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">Keine Wartungsteile erforderlich</h3>
                  <p className="text-gray-500">Das System hat für diese Maschine keine Wartungsteile gefunden.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-2 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Zurück zur Analyse</span>
            </button>
            <button
              onClick={nextStep}
              disabled={selectedParts.length === 0}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed"
            >
              <span>Wartung bestätigen ({selectedParts.length} Teile)</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {currentStep === 'confirm' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Wartung bestätigen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Maschine</h3>
                  <p className="text-gray-600">{machine.number} - {machine.type}</p>
                  <p className="text-sm text-gray-500">Baujahr {partsList.machineProductionYear}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Wartungsteile</h3>
                  <p className="text-gray-600">{selectedParts.length} Teile ausgewählt</p>
                  <p className="text-sm text-gray-500">
                    {selectedParts.filter(p => p.isRequired).length} Pflichtteile, {' '}
                    {selectedParts.filter(p => !p.isRequired).length} empfohlene Teile
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Wartungstyp</h3>
                  <p className="text-gray-600">
                    {analysis.urgency === 'high' ? 'Reparatur (überfällige Teile)' : 'Reguläre Wartung'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4">
                <h3 className="font-medium text-gray-700 mb-3">Kostenzusammenfassung</h3>
                <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                  {selectedParts.map((part, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">{part.name} ({part.quantity}x):</span>
                      <span className="font-medium">{(part.price * part.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Gesamt:</span>
                    <span className="text-blue-600">{calculateTotalCosts().toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Ausgewählte Teile im Detail</h3>
              <div className="bg-gray-50 p-4 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {selectedParts.map((part, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 ${part.isRequired ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        <span className="font-medium">{part.partNumber}</span>
                        <span className="text-gray-600">{part.name}</span>
                        {part.isOverdue && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1">Überfällig</span>
                        )}
                      </div>
                      <span className="font-medium">{part.quantity}x • {(part.price * part.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zusätzliche Kommentare:
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Besondere Beobachtungen, zusätzliche Arbeiten, Auffälligkeiten..."
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-2 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Zurück zu Teilen</span>
            </button>
            <button
              onClick={handlePerformMaintenance}
              disabled={isPerforming || selectedParts.length === 0}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed"
            >
              {isPerforming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Wird gespeichert...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Wartung durchführen ({calculateTotalCosts().toFixed(2)}€)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'complete' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Wartung abgeschlossen</h2>
          <p className="text-gray-600 mb-2">
            <strong>{selectedParts.length} Wartungsteile</strong> wurden erfolgreich in der Datenbank dokumentiert.
          </p>
          <p className="text-gray-600 mb-6">
            Gesamtkosten: <strong>{calculateTotalCosts().toFixed(2)}€</strong>
          </p>
          <div className="bg-green-50 p-4 mb-6 max-w-lg mx-auto">
            <h3 className="font-medium text-green-800 mb-2">Systemintegration erfolgreich:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Maschinendaten aktualisiert</li>
              <li>• Wartungshistorie erweitert</li>
              <li>• Teileverwendung dokumentiert</li>
              <li>• Kompatibilitätsmatrix berücksichtigt</li>
            </ul>
          </div>
          <div className="flex justify-center space-x-4">
            <Link 
              to={`/machines/${id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium transition-all"
            >
              Zurück zur Maschine
            </Link>
            <Link 
              to="/machines"
              className="border border-gray-300 text-gray-700 px-6 py-2 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Zu allen Maschinen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineMaintenanceWorkflow;