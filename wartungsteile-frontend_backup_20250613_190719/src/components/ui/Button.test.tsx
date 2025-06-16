import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Komponente', () => {
  it('rendert mit dem richtigen Text', () => {
    render(<Button>Klick mich</Button>)
    expect(screen.getByText('Klick mich')).toBeInTheDocument()
  })

  it('ruft onClick Handler auf', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Test Button</Button>)
    
    fireEvent.click(screen.getByText('Test Button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('ist deaktiviert wenn disabled prop gesetzt', () => {
    render(<Button disabled>Deaktiviert</Button>)
    const button = screen.getByText('Deaktiviert')
    
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('zeigt Loading-State mit Spinner', () => {
    render(<Button loading>Wird geladen</Button>)
    
    // Spinner sollte vorhanden sein
    expect(screen.getByRole('status')).toBeInTheDocument()
    // Button sollte deaktiviert sein
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('rendert verschiedene Varianten korrekt', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByText('Primary')).toHaveClass('bg-blue-600')
    
    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-200')
    
    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByText('Danger')).toHaveClass('bg-red-600')
  })

  it('rendert verschiedene Größen korrekt', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByText('Small')).toHaveClass('px-3', 'py-1.5', 'text-sm')
    
    rerender(<Button size="md">Medium</Button>)
    expect(screen.getByText('Medium')).toHaveClass('px-4', 'py-2')
    
    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByText('Large')).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('rendert mit Icon', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>
    render(
      <Button icon={<TestIcon />}>
        Mit Icon
      </Button>
    )
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByText('Mit Icon')).toBeInTheDocument()
  })

  it('verhindert mehrfache Klicks während Loading', () => {
    const handleClick = vi.fn()
    const { rerender } = render(
      <Button onClick={handleClick}>Click</Button>
    )
    
    // Erster Klick funktioniert
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
    
    // Loading state aktivieren
    rerender(<Button onClick={handleClick} loading>Click</Button>)
    
    // Weitere Klicks werden ignoriert
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1) // Immer noch nur 1
  })

  it('wendet zusätzliche className korrekt an', () => {
    render(
      <Button className="custom-class another-class">
        Custom
      </Button>
    )
    
    const button = screen.getByText('Custom')
    expect(button).toHaveClass('custom-class', 'another-class')
  })

  it('rendert als Link mit href', () => {
    render(
      <Button as="a" href="/test">
        Link Button
      </Button>
    )
    
    const link = screen.getByText('Link Button')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/test')
  })
})