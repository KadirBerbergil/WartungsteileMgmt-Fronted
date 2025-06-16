import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Login from './Login'
import { userService } from '../../services/userService'

// Mock die Services
vi.mock('../../services/userService', () => ({
  userService: {
    login: vi.fn()
  }
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Wrapper für Router
const LoginWrapper = () => (
  <BrowserRouter>
    <Login />
  </BrowserRouter>
)

describe('Login Komponente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rendert das Login-Formular korrekt', () => {
    render(<LoginWrapper />)
    
    // Prüfe ob alle Elemente vorhanden sind
    expect(screen.getByText('Wartungsteile Management')).toBeInTheDocument()
    expect(screen.getByText('Melden Sie sich an, um fortzufahren')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ihr Benutzername')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ihr Passwort')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /anmelden/i })).toBeInTheDocument()
  })

  it('zeigt Fehler bei leeren Feldern', async () => {
    render(<LoginWrapper />)
    
    const submitButton = screen.getByRole('button', { name: /anmelden/i })
    fireEvent.click(submitButton)
    
    // Warte auf Fehlermeldung
    await waitFor(() => {
      const usernameInput = screen.getByPlaceholderText('Ihr Benutzername')
      const passwordInput = screen.getByPlaceholderText('Ihr Passwort')
      
      // HTML5 Validierung sollte greifen
      expect(usernameInput).toBeInvalid()
      expect(passwordInput).toBeInvalid()
    })
  })

  it('ruft Login-Service mit korrekten Daten auf', async () => {
    userService.login.mockResolvedValueOnce({ 
      user: { id: 1, username: 'testuser' },
      token: 'fake-token' 
    })
    
    render(<LoginWrapper />)
    
    // Fülle das Formular aus
    fireEvent.change(screen.getByPlaceholderText('Ihr Benutzername'), {
      target: { value: 'testuser' }
    })
    fireEvent.change(screen.getByPlaceholderText('Ihr Passwort'), {
      target: { value: 'testpass123' }
    })
    
    // Formular absenden
    const submitButton = screen.getByRole('button', { name: /anmelden/i })
    fireEvent.click(submitButton)
    
    // Prüfe ob Login aufgerufen wurde
    await waitFor(() => {
      expect(userService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpass123'
      })
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('zeigt Fehlermeldung bei falschen Anmeldedaten', async () => {
    userService.login.mockRejectedValueOnce(
      new Error('Ungültige Anmeldedaten')
    )
    
    render(<LoginWrapper />)
    
    // Fülle das Formular aus
    fireEvent.change(screen.getByPlaceholderText('Ihr Benutzername'), {
      target: { value: 'wronguser' }
    })
    fireEvent.change(screen.getByPlaceholderText('Ihr Passwort'), {
      target: { value: 'wrongpass' }
    })
    
    // Formular absenden
    const submitButton = screen.getByRole('button', { name: /anmelden/i })
    fireEvent.click(submitButton)
    
    // Warte auf Fehlermeldung
    await waitFor(() => {
      expect(screen.getByText('Ungültige Anmeldedaten')).toBeInTheDocument()
    })
  })

  it('deaktiviert den Button während des Ladens', async () => {
    // Mock einen langsamen Login
    userService.login.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<LoginWrapper />)
    
    // Fülle das Formular aus
    fireEvent.change(screen.getByPlaceholderText('Ihr Benutzername'), {
      target: { value: 'testuser' }
    })
    fireEvent.change(screen.getByPlaceholderText('Ihr Passwort'), {
      target: { value: 'testpass' }
    })
    
    // Formular absenden
    const submitButton = screen.getByRole('button', { name: /anmelden/i })
    fireEvent.click(submitButton)
    
    // Button sollte deaktiviert sein
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Wird angemeldet...')).toBeInTheDocument()
  })

  it('versteckt das Passwort standardmäßig', () => {
    render(<LoginWrapper />)
    
    const passwordInput = screen.getByPlaceholderText('Ihr Passwort')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})