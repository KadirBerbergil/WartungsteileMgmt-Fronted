// src/pages/dashboard/Dashboard.tsx
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Karte für Maschinen */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Maschinen</h2>
          <p className="text-gray-500 mb-4">Alle Maschinen verwalten und Wartungszustände prüfen.</p>
          <button 
            onClick={() => navigate('/machines')}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded"
          >
            Zu den Maschinen
          </button>
        </div>
        
        {/* Karte für Wartungsteile */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Wartungsteile</h2>
          <p className="text-gray-500 mb-4">Ersatzteile und Komponenten für die Wartung verwalten.</p>
          <button 
            onClick={() => navigate('/parts')}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded"
          >
            Zu den Wartungsteilen
          </button>
        </div>
        
        {/* Karte für Wartung planen */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Wartung planen</h2>
          <p className="text-gray-500 mb-4">Neue Wartungsaufträge erstellen und planen.</p>
          <button 
            className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded"
          >
            Neue Wartung
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;