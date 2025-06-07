// src/App.tsx - Optimized with Code Splitting
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

// Lazy load all route components
const Dashboard = lazy(() => import('./pages/dashboard/EnhancedDashboard'))
const MachineList = lazy(() => import('./pages/machines/MachineList'))
const MachineCreate = lazy(() => import('./pages/machines/MachineCreate'))
const MachineEdit = lazy(() => import('./pages/machines/MachineEdit'))
const MachineDetail = lazy(() => import('./pages/machines/MachineDetail'))
const MachineMaintenancePartsList = lazy(() => import('./pages/machines/MachineMaintenancePartsList'))
const MachineMaintenanceWorkflow = lazy(() => import('./pages/machines/MachineMaintenanceWorkflow'))
const MaintenancePartsList = lazy(() => import('./pages/parts/MaintenancePartsList'))
const MaintenancePartDetail = lazy(() => import('./pages/parts/MaintenancePartDetail'))
const MaintenancePartEdit = lazy(() => import('./pages/parts/MaintenancePartEdit'))
const MaintenancePartCreate = lazy(() => import('./pages/parts/MaintenancePartCreate'))
const ModelTraining = lazy(() => import('./pages/model-training/ModelTraining'))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Dashboard */}
        <Route index element={
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        } />
        
        {/* Maschinen-Routen */}
        <Route path="machines">
          <Route index element={
            <Suspense fallback={<PageLoader />}>
              <MachineList />
            </Suspense>
          } />
          <Route path="create" element={
            <Suspense fallback={<PageLoader />}>
              <MachineCreate />
            </Suspense>
          } />
          <Route path=":id" element={
            <Suspense fallback={<PageLoader />}>
              <MachineDetail />
            </Suspense>
          } />
          <Route path=":id/edit" element={
            <Suspense fallback={<PageLoader />}>
              <MachineEdit />
            </Suspense>
          } />
          <Route path=":id/parts" element={
            <Suspense fallback={<PageLoader />}>
              <MachineMaintenancePartsList />
            </Suspense>
          } />
          <Route path=":id/maintenance" element={
            <Suspense fallback={<PageLoader />}>
              <MachineMaintenanceWorkflow />
            </Suspense>
          } />
        </Route>
        
        {/* Wartungsteile-Routen */}
        <Route path="parts">
          <Route index element={
            <Suspense fallback={<PageLoader />}>
              <MaintenancePartsList />
            </Suspense>
          } />
          <Route path="new" element={
            <Suspense fallback={<PageLoader />}>
              <MaintenancePartCreate />
            </Suspense>
          } />
          <Route path=":id" element={
            <Suspense fallback={<PageLoader />}>
              <MaintenancePartDetail />
            </Suspense>
          } />
          <Route path=":id/edit" element={
            <Suspense fallback={<PageLoader />}>
              <MaintenancePartEdit />
            </Suspense>
          } />
        </Route>
        
        {/* Model Training Route */}
        <Route path="model-training" element={
          <Suspense fallback={<PageLoader />}>
            <ModelTraining />
          </Suspense>
        } />
        
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