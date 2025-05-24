// src/pages/machines/MachineDetail.tsx - Button funktional machen
import { useParams, Link } from 'react-router-dom';
import { useMachineDetail } from '../../hooks/useMachines';
import { WrenchScrewdriverIcon, CogIcon } from '@heroicons/react/24/outline';

const MachineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: machine, isLoading, error } = useMachineDetail(id || '');

  // Helper-Funktion für Status-Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Aktiv</span>;
      case 'InMaintenance':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">In Wartung</span>;
      case 'OutOfService':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Außer Betrieb</span>;
      default:
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unbekannt</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Link to="/machines" className="text-primary hover:text-primary/80">
          &larr; Zurück zur Liste
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          {isLoading ? 'Maschine wird geladen...' : error ? 'Fehler' : `Maschine ${machine?.number}`}
        </h1>
      </div>

      {isLoading ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          Daten werden geladen...
        </div>
      ) : error ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center text-red-500">
          Fehler beim Laden der Maschinendaten: {error instanceof Error ? error.message : 'Unbekannter Fehler'}
        </div>
      ) : machine ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allgemeine Informationen */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Allgemeine Informationen</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Maschinennummer:</span>
                  <span className="font-medium">{machine.number}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Typ:</span>
                  <span className="font-medium">{machine.type}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Status:</span>
                  <span>{renderStatusBadge(machine.status)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Betriebsstunden:</span>
                  <span className="font-medium">{machine.operatingHours} h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Installationsdatum:</span>
                  <span className="font-medium">{new Date(machine.installationDate).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
            </div>

            {/* Magazin-Eigenschaften */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Magazin-Eigenschaften</h2>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Magazin-Typ:</span>
                  <span className="font-medium">{machine.magazineType || 'Nicht angegeben'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Materialstangenlänge:</span>
                  <span className="font-medium">{machine.materialBarLength || 'Nicht angegeben'} mm</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Synchroneinrichtung:</span>
                  <span className="font-medium">{machine.hasSynchronizationDevice ? 'Ja' : 'Nein'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Zuführkanal:</span>
                  <span className="font-medium">{machine.feedChannel || 'Nicht angegeben'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vorschubstange:</span>
                  <span className="font-medium">{machine.feedRod || 'Nicht angegeben'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wartungshistorie */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Wartungshistorie</h2>
            
            {machine.maintenanceRecords && machine.maintenanceRecords.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Techniker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ausgetauschte Teile</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kommentare</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {machine.maintenanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.performedAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.maintenanceType === 'Regular' ? 'Regulär' : 
                         record.maintenanceType === 'OnDemand' ? 'Auf Anfrage' : 'Reparatur'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.technicianId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.replacedParts && record.replacedParts.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {record.replacedParts.map((part, index) => (
                              <li key={index}>
                                {part.partName} ({part.partNumber}) - {part.quantity} Stück
                              </li>
                            ))}
                          </ul>
                        ) : (
                          'Keine Teile ausgetauscht'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {record.comments || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Keine Wartungseinträge vorhanden.
              </div>
            )}
          </div>

          {/* Aktionsbuttons - HIER IST DIE ÄNDERUNG! */}
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg">
              Maschine bearbeiten
            </button>
            
            {/* ✅ WARTUNG DURCHFÜHREN BUTTON - JETZT FUNKTIONAL! */}
            <Link 
              to={`/machines/${machine.id}/maintenance`}
              className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg inline-flex items-center space-x-2"
            >
              <CogIcon className="h-4 w-4" />
              <span>Wartung durchführen</span>
            </Link>
            
            <Link 
              to={`/machines/${machine.id}/parts`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all hover:shadow-lg inline-flex items-center space-x-2"
            >
              <WrenchScrewdriverIcon className="h-4 w-4" />
              <span>Wartungsteile anzeigen</span>
            </Link>
            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-all">
              Betriebsstunden aktualisieren
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default MachineDetail;