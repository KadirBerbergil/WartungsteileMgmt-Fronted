// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/dashboard/Dashboard'
import MachineList from './pages/machines/MachineList'
import MachineDetail from './pages/machines/MachineDetail'
import MaintenancePartsList from './pages/parts/MaintenancePartsList'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="machines" element={<MachineList />} />
        <Route path="machines/:id" element={<MachineDetail />} />
        <Route path="parts" element={<MaintenancePartsList />} />
      </Route>
    </Routes>
  )
}

export default App