import { render, screen, fireEvent } from '@testing-library/react'
import RegionsList from '../RegionsList'
import { Region } from '@/types'

const mockRegions: Region[] = [
  {
    id: 1,
    name: 'Test Region 1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    projects: [
      {
        id: 1,
        region_id: 1,
        name: 'Project 1',
        geo_json: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 2,
    name: 'Test Region 2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
]

const defaultProps = {
  regions: mockRegions,
  loading: false,
  error: null,
  onSidebarStateChange: jest.fn(),
  onRegionSelect: jest.fn(),
  onDeleteRegion: jest.fn(),
}

describe('RegionsList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders regions list with title and add button', () => {
    render(<RegionsList {...defaultProps} />)

    expect(screen.getByText('Regions')).toBeInTheDocument()
    expect(screen.getByText('Add Region')).toBeInTheDocument()
  })

  it('renders all regions correctly', () => {
    render(<RegionsList {...defaultProps} />)

    expect(screen.getByText('Test Region 1')).toBeInTheDocument()
    expect(screen.getByText('Test Region 2')).toBeInTheDocument()
    expect(screen.getByText('1 projects')).toBeInTheDocument()
    expect(screen.getByText('0 projects')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<RegionsList {...defaultProps} loading={true} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Test Region 1')).not.toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<RegionsList {...defaultProps} error="Failed to load regions" />)

    expect(screen.getByText('Failed to load regions')).toBeInTheDocument()
    expect(screen.queryByText('Test Region 1')).not.toBeInTheDocument()
  })

  it('shows empty state when no regions', () => {
    render(<RegionsList {...defaultProps} regions={[]} />)

    expect(screen.getByText('No regions found. Create your first region!')).toBeInTheDocument()
  })

  it('shows empty state when regions is null', () => {
    render(<RegionsList {...defaultProps} regions={null as any} />)

    expect(screen.getByText('No regions found. Create your first region!')).toBeInTheDocument()
  })

  it('calls onSidebarStateChange when Add Region button is clicked', () => {
    render(<RegionsList {...defaultProps} />)

    fireEvent.click(screen.getByText('Add Region'))

    expect(defaultProps.onSidebarStateChange).toHaveBeenCalledWith({
      mode: 'create-region',
      data: null,
    })
  })

  it('calls onRegionSelect when region is clicked', () => {
    render(<RegionsList {...defaultProps} />)

    fireEvent.click(screen.getByText('Test Region 1'))

    expect(defaultProps.onRegionSelect).toHaveBeenCalledWith(mockRegions[0])
  })

  it('calls onSidebarStateChange when Edit button is clicked', () => {
    render(<RegionsList {...defaultProps} />)

    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    expect(defaultProps.onSidebarStateChange).toHaveBeenCalledWith({
      mode: 'edit-region',
      data: { region: mockRegions[0] },
    })
  })

  it('calls onDeleteRegion when Delete button is clicked', () => {
    render(<RegionsList {...defaultProps} />)

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    expect(defaultProps.onDeleteRegion).toHaveBeenCalledWith(mockRegions[0])
  })

  it('renders correct project count for each region', () => {
    const regionsWithProjects: Region[] = [
      {
        ...mockRegions[0],
        projects: [
          {
            id: 1,
            region_id: 1,
            name: 'Project 1',
            geo_json: {},
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 2,
            region_id: 1,
            name: 'Project 2',
            geo_json: {},
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      },
    ]

    render(<RegionsList {...defaultProps} regions={regionsWithProjects} />)

    expect(screen.getByText('2 projects')).toBeInTheDocument()
  })

  it('applies hover styles correctly', () => {
    render(<RegionsList {...defaultProps} />)

    const regionCard = screen.getByText('Test Region 1').closest('div')
    expect(regionCard).toHaveClass('hover:bg-gray-50')
  })

  it('renders edit and delete buttons for each region', () => {
    render(<RegionsList {...defaultProps} />)

    const editButtons = screen.getAllByText('Edit')
    const deleteButtons = screen.getAllByText('Delete')

    expect(editButtons).toHaveLength(2) // One for each region
    expect(deleteButtons).toHaveLength(2) // One for each region
  })
})
