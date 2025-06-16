import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import MachineList from './MachineList'

// Mock die Hooks
vi.mock('../../hooks/useMachines', () => ({
  useMachines: vi.fn(),
  useDeleteMachine: vi.fn()
}))

// Test-Daten
const mockMachines = [
  {
    id: '1',
    number: 'M-001',
    type: 'CNC',
    magazineType: 'Standard',
    status: 'Active',
    operatingHours: 1250,
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-04-15'
  },
  {
    id: '2',
    number: 'M-002',
    type: 'Laser',
    magazineType: 'Extended',
    status: 'InMaintenance',
    operatingHours: 2500,
    lastMaintenance: '2024-02-01',
    nextMaintenance: '2024-05-01'
  },
  {
    id: '3',
    number: 'M-003',
    type: 'Press',
    magazineType: 'Compact',
    status: 'UnderRepair',
    operatingHours: 500,
    lastMaintenance: '2024-03-01',
    nextMaintenance: '2024-06-01'
  }
]

// Wrapper für Tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('MachineList Komponente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('zeigt Loading-State während des Ladens', () => {
    const { useMachines } = require('../../hooks/useMachines')
    useMachines.mockReturnValue({
      data: null,
      isLoading: true,
      error: null
    })

    render(<MachineList />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Maschinen werden geladen...')).toBeInTheDocument()
  })

  it('zeigt Fehlermeldung bei API-Fehler', () => {
    const { useMachines } = require('../../hooks/useMachines')
    useMachines.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('API Error')
    })

    render(<MachineList />, { wrapper: createWrapper() })
    
    expect(screen.getByText(/Fehler beim Laden der Maschinen/i)).toBeInTheDocument()
  })

  it('zeigt Maschinenliste korrekt an', () => {
    const { useMachines, useDeleteMachine } = require('../../hooks/useMachines')
    useMachines.mockReturnValue({
      data: mockMachines,
      isLoading: false,
      error: null
    })
    useDeleteMachine.mockReturnValue({
      mutate: vi.fn()
    })

    render(<MachineList />, { wrapper: createWrapper() })
    
    // Prüfe ob alle Maschinen angezeigt werden
    expect(screen.getByText('M-001')).toBeInTheDocument()
    expect(screen.getByText('M-002')).toBeInTheDocument()
    expect(screen.getByText('M-003')).toBeInTheDocument()
    
    // Prüfe Statistiken
    expect(screen.getByText('3')).toBeInTheDocument() // Total
    expect(screen.getByText('1')).toBeInTheDocument() // Active
  })

  it('filtert Maschinen nach Suchbegriff', async () => {
    const { useMachines, useDeleteMachine } = require('../../hooks/useMachines')
    useMachines.mockReturnValue({
      data: mockMachines,
      isLoading: false,
      error: null
    })
    useDeleteMachine.mockReturnValue({
      mutate: vi.fn()
    })

    render(<MachineList />, { wrapper: createWrapper() })
    
    // Suche nach M-001
    const searchInput = screen.getByPlaceholderText('Maschine suchen...')
    fireEvent.change(searchInput, { target: { value: 'M-001' } })
    
    // Nur M-001 sollte sichtbar sein
    expect(screen.getByText('M-001')).toBeInTheDocument()
    expect(screen.queryByText('M-002')).not.toBeInTheDocument()
    expect(screen.queryByText('M-003')).not.toBeInTheDocument()
  })

  it('filtert Maschinen nach Status', () => {
    const { useMachines, useDeleteMachine } = require('../../hooks/useMachines')
    useMachines.mockReturnValue({
      data: mockMachines,
      isLoading: false,
      error: null
    })
    useDeleteMachine.mockReturnValue({
      mutate: vi.fn()
    })

    render(<MachineList />, { wrapper: createWrapper() })
    
    // Filter auf "Active" setzen
    const statusFilter = screen.getByRole('combobox')
    fireEvent.change(statusFilter, { target: { value: 'Active' } })
    
    // Nur aktive Maschine sollte sichtbar sein
    expect(screen.getByText('M-001')).toBeInTheDocument()
    expect(screen.queryByText('M-002')).not.toBeInTheDocument()
    expect(screen.queryByText('M-003')).not.toBeInTheDocument()
  })

  it('wechselt zwischen Grid und Tabellen-Ansicht', () => {
    const { useMachines, useDeleteMachine } = require('../../hooks/useMachines')
    useMachines.mockReturnValue({
      data: mockMachines,
      isLoading: false,
      error: null
    })
    useDeleteMachine.mockReturnValue({
      mutate: vi.fn()
    })

    render(<MachineList />, { wrapper: createWrapper() })
    
    // Standardmäßig Tabellen-Ansicht
    expect(screen.getByRole('table')).toBeInTheDocument()
    
    // Zu Grid-Ansicht wechseln
    const gridButton = screen.getByLabelText('Grid-Ansicht')
    fireEvent.click(gridButton)
    
    // Grid sollte sichtbar sein, Tabelle nicht
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.getByTestId('machine-grid')).toBeInTheDocument()
  })

  it('öffnet Lösch-Modal beim Klick auf Löschen', async () => {
    const { useMachines, useDeleteMachine } = require('../../hooks/useMachines')
    const mockDelete = vi.fn()
    
    useMachines.mockReturnValue({
      data: mockMachines,
      isLoading: false,
      error: null
    })
    useDeleteMachine.mockReturnValue({
      mutate: mockDelete
    })

    render(<MachineList />, { wrapper: createWrapper() })
    
    // Klick auf ersten Lösch-Button
    const deleteButtons = screen.getAllByLabelText(/löschen/i)
    fireEvent.click(deleteButtons[0])
    
    // Modal sollte erscheinen
    await waitFor(() => {
      expect(screen.getByText(/Maschine löschen/i)).toBeInTheDocument()
      expect(screen.getByText(/Sind Sie sicher/i)).toBeInTheDocument()
    })
  })

  it('ruft Delete-Funktion auf bei Bestätigung', async () => {
    const { useMachines, useDeleteMachine } = require('../../hooks/useMachines')
    const mockDelete = vi.fn()
    
    useMachines.mockReturnValue({
      data: mockMachines,
      isLoading: false,
      error: null
    })
    useDeleteMachine.mockReturnValue({
      mutate: mockDelete
    })

    render(<MachineList />, { wrapper: createWrapper() })
    
    // Lösch-Button klicken
    const deleteButtons = screen.getAllByLabelText(/löschen/i)
    fireEvent.click(deleteButtons[0])
    
    // Im Modal bestätigen
    await waitFor(() => {
      const confirmButton = screen.getByText('Löschen', { selector: 'button' })
      fireEvent.click(confirmButton)
    })
    
    // Delete sollte aufgerufen worden sein
    expect(mockDelete).toHaveBeenCalledWith('1')
  })

  it('zeigt PDF-Import Modal bei Klick', async () => {
    const { useMachines, useDeleteMachine } = require('../../hooks/useMachines')
    useMachines.mockReturnValue({
      data: mockMachines,
      isLoading: false,
      error: null
    })
    useDeleteMachine.mockReturnValue({
      mutate: vi.fn()
    })

    render(<MachineList />, { wrapper: createWrapper() })
    
    // PDF Import Button klicken
    const pdfImportButton = screen.getByText('PDF Import')
    fireEvent.click(pdfImportButton)
    
    // Modal sollte erscheinen
    await waitFor(() => {
      expect(screen.getByText(/PDF-Datei importieren/i)).toBeInTheDocument()
    })
  })

  it('zeigt korrekten Status-Badge für jede Maschine', () => {
    const { useMachines, useDeleteMachine } = require('../../hooks/useMachines')
    useMachines.mockReturnValue({
      data: mockMachines,
      isLoading: false,
      error: null
    })
    useDeleteMachine.mockReturnValue({
      mutate: vi.fn()
    })

    render(<MachineList />, { wrapper: createWrapper() })
    
    // Prüfe Status-Badges
    expect(screen.getByText('Aktiv')).toBeInTheDocument()
    expect(screen.getByText('In Wartung')).toBeInTheDocument()
    expect(screen.getByText('In Reparatur')).toBeInTheDocument()
  })
})