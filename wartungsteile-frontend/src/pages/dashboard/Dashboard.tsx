// src/pages/dashboard/Dashboard.tsx - TypeScript-Fehler behoben
import { useNavigate } from 'react-router-dom';
import { useMachines } from '../../hooks/useMachines';
import { useMaintenanceParts } from '../../hooks/useParts';
import { 
  CogIcon, 
  WrenchScrewdriverIcon, 
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// TypeScript Interface für Aktivitäten
interface Activity {
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  color: string;
  title: string;
  description: string;
  time: Date;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: machines, isLoading: machinesLoading } = useMachines();
  const { data: parts, isLoading: partsLoading } = useMaintenanceParts();

  // Echte Statistiken aus den Daten berechnen
  const machineStats = machines ? {
    total: machines.length,
    active: machines.filter(m => m.status === 'Active').length,
    inMaintenance: machines.filter(m => m.status === 'InMaintenance').length,
    outOfService: machines.filter(m => m.status === 'OutOfService').length,
    avgOperatingHours: machines.length > 0 ? Math.round(machines.reduce((sum, m) => sum + m.operatingHours, 0) / machines.length) : 0,
    maintenanceDue: machines.filter(m => m.operatingHours > 1000).length, // Beispiel: über 1000h = wartungsfällig
    recentMaintenances: machines.filter(m => m.lastMaintenanceDate && 
      new Date(m.lastMaintenanceDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length // Letzte 30 Tage
  } : { total: 0, active: 0, inMaintenance: 0, outOfService: 0, avgOperatingHours: 0, maintenanceDue: 0, recentMaintenances: 0 };

  const partStats = parts ? {
    total: parts.length,
    wearParts: parts.filter(p => p.category === 'WearPart').length,
    lowStock: parts.filter(p => p.stockQuantity <= 3 && p.stockQuantity > 0).length,
    outOfStock: parts.filter(p => p.stockQuantity === 0).length,
    totalValue: parts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0)
  } : { total: 0, wearParts: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };

  const mainCards = [
    {
      title: "Maschinen",
      description: `${machineStats.total} CNC-Lademagazine verwalten und Wartungszustände prüfen`,
      icon: CogIcon,
      action: () => navigate('/machines'),
      actionText: "Zu den Maschinen",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      buttonColor: "bg-primary hover:bg-primary/90",
      stats: `${machineStats.active} aktiv, ${machineStats.inMaintenance} in Wartung`
    },
    {
      title: "Wartungsteile", 
      description: `${partStats.total} Ersatzteile und Komponenten für die Wartung verwalten`,
      icon: WrenchScrewdriverIcon,
      action: () => navigate('/parts'),
      actionText: "Zu den Wartungsteilen",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600", 
      buttonColor: "bg-secondary hover:bg-secondary/90",
      stats: `${partStats.wearParts} Verschleißteile, ${partStats.lowStock} niedrige Bestände`
    },
    {
      title: "Wartung planen",
      description: `${machineStats.maintenanceDue} Maschinen benötigen bald eine Wartung`,
      icon: CalendarDaysIcon,
      action: () => alert('Wartungsplanung wird bald verfügbar sein!'),
      actionText: "Neue Wartung",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      buttonColor: "bg-green-600 hover:bg-green-700",
      stats: `${machineStats.recentMaintenances} Wartungen in letzten 30 Tagen`
    }
  ];

  const statsCards = [
    {
      title: "Aktive Maschinen",
      value: machinesLoading ? "..." : machineStats.active.toString(),
      total: machinesLoading ? "" : `/ ${machineStats.total}`,
      icon: CheckCircleIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
      isLoading: machinesLoading
    },
    {
      title: "Wartungen fällig",
      value: machinesLoading ? "..." : machineStats.maintenanceDue.toString(), 
      icon: ExclamationTriangleIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      isLoading: machinesLoading
    },
    {
      title: "Wartungsteile",
      value: partsLoading ? "..." : partStats.total.toString(),
      subtitle: partsLoading ? "" : `${partStats.outOfStock} ausverkauft`,
      icon: WrenchScrewdriverIcon,
      color: "text-blue-600", 
      bgColor: "bg-blue-100",
      isLoading: partsLoading
    },
    {
      title: "Lagerwert",
      value: partsLoading ? "..." : `${Math.round(partStats.totalValue).toLocaleString('de-DE')}€`,
      icon: CubeIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      isLoading: partsLoading
    }
  ];

  // Echte letzte Aktivitäten basierend auf den Daten - mit korrekter Typisierung
  const getRecentActivities = (): Activity[] => {
    const activities: Activity[] = [];
    
    // Wartungen aus den letzten Tagen
    if (machines) {
      machines.forEach(machine => {
        if (machine.lastMaintenanceDate) {
          const maintenanceDate = new Date(machine.lastMaintenanceDate);
          const daysAgo = Math.ceil((Date.now() - maintenanceDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysAgo <= 7) {
            activities.push({
              icon: CheckCircleIcon,
              color: "text-green-600",
              title: "Wartung abgeschlossen",
              description: `Maschine ${machine.number} - vor ${daysAgo} Tag${daysAgo !== 1 ? 'en' : ''}`,
              time: maintenanceDate
            });
          }
        }
      });
    }

    // Niedrige Bestände als Aktivität
    if (parts) {
      parts.filter(p => p.stockQuantity <= 3 && p.stockQuantity > 0).slice(0, 2).forEach(part => {
        activities.push({
          icon: ExclamationTriangleIcon,
          color: "text-yellow-600",
          title: "Niedriger Lagerbestand",
          description: `${part.name} (${part.partNumber}) - nur noch ${part.stockQuantity} Stück`,
          time: new Date()
        });
      });
    }

    // Ausverkaufte Teile
    if (parts) {
      parts.filter(p => p.stockQuantity === 0).slice(0, 1).forEach(part => {
        activities.push({
          icon: XCircleIcon,
          color: "text-red-600",
          title: "Teil ausverkauft",
          description: `${part.name} (${part.partNumber}) - Nachbestellung erforderlich`,
          time: new Date()
        });
      });
    }

    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Wartungsteile-Management-System Übersicht</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Letztes Update: {new Date().toLocaleString('de-DE')}</p>
          <p className="text-xs">
            {machinesLoading || partsLoading ? 'Daten werden geladen...' : 'Alle Daten aktuell'}
          </p>
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <div className="flex items-baseline space-x-1">
                  <p className="text-3xl font-bold text-gray-800">
                    {card.isLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      card.value
                    )}
                  </p>
                  {card.total && (
                    <span className="text-sm text-gray-500">{card.total}</span>
                  )}
                </div>
                {card.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Haupt-Aktionskarten */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {mainCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1`}>
            <div className="flex items-start space-x-4">
              <div className={`p-3 bg-white rounded-lg shadow-sm`}>
                <card.icon className={`h-8 w-8 ${card.iconColor}`} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h2>
                <p className="text-gray-600 mb-2 leading-relaxed">{card.description}</p>
                <p className="text-sm text-gray-500 mb-6">{card.stats}</p>
                <button 
                  onClick={card.action}
                  className={`${card.buttonColor} text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg`}
                >
                  {card.actionText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Letzte Aktivitäten */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Letzte Aktivitäten</h2>
        <div className="space-y-4">
          {getRecentActivities().length > 0 ? (
            getRecentActivities().map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <activity.icon className={`h-5 w-5 ${activity.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              <ClockIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Noch keine aktuellen Aktivitäten</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;