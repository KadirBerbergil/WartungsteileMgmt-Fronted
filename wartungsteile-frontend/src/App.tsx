// src/App.tsx - Korrigiertes und bereinigtes Routing
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import MachineList from './pages/machines/MachineList'
import MachineCreate from './pages/machines/MachineCreate'  // ✅ HINZUGEFÜGT
import MachineDetail from './pages/machines/MachineDetail'
import MachineMaintenancePartsList from './pages/machines/MachineMaintenancePartsList'
import MachineMaintenanceWorkflow from './pages/machines/MachineMaintenanceWorkflow'
import PdfUploadExtractor from './pages/machines/PdfUploadExtractor'
import MaintenancePartsList from './pages/parts/MaintenancePartsList'
import MaintenancePartDetail from './pages/parts/MaintenancePartDetail'
import MaintenancePartEdit from './pages/parts/MaintenancePartEdit'
import MaintenancePartCreate from './pages/parts/MaintenancePartCreate'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* Maschinen-Routen */}
        <Route path="machines">
          <Route index element={<MachineList />} />
          <Route path="create" element={<MachineCreate />} />  {/* ✅ HINZUGEFÜGT - WICHTIG: VOR :id Route! */}
          <Route path="upload" element={<PdfUploadExtractor />} />
          <Route path=":id" element={<MachineDetail />} />
          <Route path=":id/parts" element={<MachineMaintenancePartsList />} />
          <Route path=":id/maintenance" element={<MachineMaintenanceWorkflow />} />
        </Route>
        
        {/* Wartungsteile-Routen */}
        <Route path="parts">
          <Route index element={<MaintenancePartsList />} />
          <Route path="new" element={<MaintenancePartCreate />} />
          <Route path=":id" element={<MaintenancePartDetail />} />
          <Route path=":id/edit" element={<MaintenancePartEdit />} />
        </Route>
        
        {/* Catch-all Route für 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Seite nicht gefunden</h1>
              <p className="text-gray-600 mb-6">Die angeforderte Seite existiert nicht.</p>
              <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                Zurück zum Dashboard
              </a>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  )
}

export default App