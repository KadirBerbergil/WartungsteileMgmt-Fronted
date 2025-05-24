// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import MachineList from './pages/machines/MachineList'
import MachineDetail from './pages/machines/MachineDetail'
import MachineMaintenancePartsList from './pages/machines/MachineMaintenancePartsList'  // ← Diese Zeile fehlt dir!
import MaintenancePartsList from './pages/parts/MaintenancePartsList'
import MaintenancePartDetail from './pages/parts/MaintenancePartDetail'
import MaintenancePartEdit from './pages/parts/MaintenancePartEdit'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="machines" element={<MachineList />} />
        <Route path="machines/:id" element={<MachineDetail />} />
        <Route path="machines/:id/parts" element={<MachineMaintenancePartsList />} />  {/* ← Diese Zeile fehlt dir! */}
        <Route path="parts" element={<MaintenancePartsList />} />
        <Route path="parts/:id" element={<MaintenancePartDetail />} />
        <Route path="parts/:id/edit" element={<MaintenancePartEdit />} />
      </Route>
    </Routes>
  )
}

export default App