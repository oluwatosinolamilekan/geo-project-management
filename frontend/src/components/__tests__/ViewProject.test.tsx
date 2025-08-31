import { render, screen, fireEvent } from '@testing-library/react'
import ViewProject from '../ViewProject'
import { Project, Pin } from '@/types'

const mockPins: Pin[] = [
  {
    id: 1,
    project_id: 1,
    latitude: 40.7128,
    longitude: -74.0060,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    project_id: 1,
    latitude: 40.7580,
    longitude: -73.9855,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
]

const mockProject: Project = {
  id: 1,
  region_id: 1,
  name: 'Test Project',
  geo_json: { type: 'Polygon', coordinates: [] },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  region: {
    id: 1,
    name: 'Test Region',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  pins: mockPins,
}

const defaultProps = {
  project: mockProject,
  onSidebarStateChange: jest.fn(),
  onDeleteProject: jest.fn(),
  onPinSelect: jest.fn(),
}

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn()
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
})

describe('ViewProject', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders project name and details', () => {
    render(<ViewProject {...defaultProps} />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('Project Details')).toBeInTheDocument()
  })

  it('renders project information correctly', () => {
    render(<ViewProject {...defaultProps} />)

    expect(screen.getByText('Test Region')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // Pin count
    expect(screen.getByText('1/1/2024')).toBeInTheDocument() // Created date
  })

  it('renders Edit and Delete buttons', () => {
    render(<ViewProject {...defaultProps} />)

    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('renders Add Pin button', () => {
    render(<ViewProject {...defaultProps} />)

    expect(screen.getByText('Add Pin')).toBeInTheDocument()
  })

  it('calls onSidebarStateChange when Edit button is clicked', () => {
    render(<ViewProject {...defaultProps} />)

    fireEvent.click(screen.getByText('Edit'))

    expect(defaultProps.onSidebarStateChange).toHaveBeenCalledWith({
      mode: 'edit-project',
      data: { project: mockProject },
    })
  })

  it('calls onDeleteProject when Delete button is clicked', () => {
    render(<ViewProject {...defaultProps} />)

    fireEvent.click(screen.getByText('Delete'))

    expect(defaultProps.onDeleteProject).toHaveBeenCalledWith(mockProject)
  })

  it('dispatches startPinCreation event when Add Pin button is clicked', () => {
    render(<ViewProject {...defaultProps} />)

    fireEvent.click(screen.getByText('Add Pin'))

    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'startPinCreation',
      })
    )
  })

  it('renders pins list when project has pins', () => {
    render(<ViewProject {...defaultProps} />)

    expect(screen.getByText('📍 Pins in this project:')).toBeInTheDocument()
    expect(screen.getByText('Pin #1')).toBeInTheDocument()
    expect(screen.getByText('Pin #2')).toBeInTheDocument()
  })

  it('renders pin coordinates correctly', () => {
    render(<ViewProject {...defaultProps} />)

    expect(screen.getByText('40.7128, -74.0060')).toBeInTheDocument()
    expect(screen.getByText('40.7580, -73.9855')).toBeInTheDocument()
  })

  it('calls onPinSelect when pin is clicked', () => {
    render(<ViewProject {...defaultProps} />)

    fireEvent.click(screen.getByText('Pin #1'))

    expect(defaultProps.onPinSelect).toHaveBeenCalledWith(mockPins[0])
  })

  it('does not render pins list when project has no pins', () => {
    const projectWithoutPins = { ...mockProject, pins: [] }
    render(<ViewProject {...defaultProps} project={projectWithoutPins} />)

    expect(screen.queryByText('📍 Pins in this project:')).not.toBeInTheDocument()
    expect(screen.queryByText('Pin #1')).not.toBeInTheDocument()
  })

  it('handles project with null pins', () => {
    const projectWithNullPins = { ...mockProject, pins: null as any }
    render(<ViewProject {...defaultProps} project={projectWithNullPins} />)

    expect(screen.getByText('0')).toBeInTheDocument() // Pin count should be 0
    expect(screen.queryByText('📍 Pins in this project:')).not.toBeInTheDocument()
  })

  it('handles pins with null coordinates', () => {
    const pinsWithNullCoords: Pin[] = [
      {
        id: 1,
        project_id: 1,
        latitude: null as any,
        longitude: null as any,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]
    const projectWithNullCoords = { ...mockProject, pins: pinsWithNullCoords }

    render(<ViewProject {...defaultProps} project={projectWithNullCoords} />)

    expect(screen.getByText('N/A, N/A')).toBeInTheDocument()
  })

  it('calls onSidebarStateChange when Back to Projects button is clicked', () => {
    render(<ViewProject {...defaultProps} />)

    fireEvent.click(screen.getByText('Back to Projects'))

    expect(defaultProps.onSidebarStateChange).toHaveBeenCalledWith({
      mode: 'projects',
      data: { region: mockProject.region },
    })
  })

  it('formats date correctly', () => {
    render(<ViewProject {...defaultProps} />)

    // The date should be formatted as MM/DD/YYYY
    expect(screen.getByText('1/1/2024')).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<ViewProject {...defaultProps} />)

    // Check project details box styling
    const detailsBox = screen.getByText('Region:').closest('div')
    expect(detailsBox).toHaveClass('bg-gray-50', 'p-4', 'rounded-lg')

    // Check Add Pin button styling
    const addPinButton = screen.getByText('Add Pin')
    expect(addPinButton).toHaveClass('w-full', 'bg-green-500', 'text-white')

    // Check Back button styling
    const backButton = screen.getByText('Back to Projects')
    expect(backButton).toHaveClass('w-full', 'bg-gray-100', 'hover:bg-gray-200')
  })

  it('renders pin cards with correct hover effects', () => {
    render(<ViewProject {...defaultProps} />)

    const pinCard = screen.getByText('Pin #1').closest('button')
    expect(pinCard).toHaveClass(
      'hover:border-blue-400',
      'hover:bg-blue-50',
      'transition-all',
      'duration-200'
    )
  })

  it('shows correct pin count in project details', () => {
    render(<ViewProject {...defaultProps} />)

    // Should show "2" for the pin count
    const pinCountElement = screen.getByText('Pins:').nextSibling
    expect(pinCountElement).toHaveTextContent('2')
  })
})
