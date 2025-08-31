import { render, screen, fireEvent } from '@testing-library/react'
import ProjectsList from '../ProjectsList'
import { SidebarState, Project } from '@/types'

const mockRegion = {
  id: 1,
  name: 'Test Region',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockProjects: Project[] = [
  {
    id: 1,
    region_id: 1,
    name: 'Test Project 1',
    geo_json: { type: 'Polygon', coordinates: [] },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    pins: [
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
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 2,
    region_id: 1,
    name: 'Test Project 2',
    geo_json: { type: 'Polygon', coordinates: [] },
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
]

const mockSidebarState: SidebarState = {
  isOpen: true,
  mode: 'projects',
  data: {
    region: {
      ...mockRegion,
      projects: mockProjects,
    },
  },
}

const defaultProps = {
  sidebarState: mockSidebarState,
  loading: false,
  error: null,
  onSidebarStateChange: jest.fn(),
  onProjectSelect: jest.fn(),
  onDeleteProject: jest.fn(),
}

describe('ProjectsList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders projects list with title and region name', () => {
    render(<ProjectsList {...defaultProps} />)

    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Test Region')).toBeInTheDocument()
  })

  it('renders Add Project button', () => {
    render(<ProjectsList {...defaultProps} />)

    expect(screen.getByText('Add Project')).toBeInTheDocument()
  })

  it('renders all projects correctly', () => {
    render(<ProjectsList {...defaultProps} />)

    expect(screen.getByText('Test Project 1')).toBeInTheDocument()
    expect(screen.getByText('Test Project 2')).toBeInTheDocument()
    expect(screen.getByText('2 pins')).toBeInTheDocument()
    expect(screen.getByText('0 pins')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<ProjectsList {...defaultProps} loading={true} />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Test Project 1')).not.toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<ProjectsList {...defaultProps} error="Failed to load projects" />)

    expect(screen.getByText('Failed to load projects')).toBeInTheDocument()
    expect(screen.queryByText('Test Project 1')).not.toBeInTheDocument()
  })

  it('shows empty state when no projects', () => {
    const sidebarStateWithoutProjects = {
      ...mockSidebarState,
      data: {
        region: {
          ...mockRegion,
          projects: [],
        },
      },
    }

    render(<ProjectsList {...defaultProps} sidebarState={sidebarStateWithoutProjects} />)

    expect(screen.getByText('No projects found. Create your first project!')).toBeInTheDocument()
  })

  it('shows empty state when projects is null', () => {
    const sidebarStateWithNullProjects = {
      ...mockSidebarState,
      data: {
        region: {
          ...mockRegion,
          projects: null,
        },
      },
    }

    render(<ProjectsList {...defaultProps} sidebarState={sidebarStateWithNullProjects} />)

    expect(screen.getByText('No projects found. Create your first project!')).toBeInTheDocument()
  })

  it('calls onSidebarStateChange when Add Project button is clicked', () => {
    render(<ProjectsList {...defaultProps} />)

    fireEvent.click(screen.getByText('Add Project'))

    expect(defaultProps.onSidebarStateChange).toHaveBeenCalledWith({
      mode: 'create-project',
      data: { region: mockRegion, regionId: mockRegion.id },
    })
  })

  it('disables Add Project button when no region', () => {
    const sidebarStateWithoutRegion = {
      ...mockSidebarState,
      data: {
        region: null,
      },
    }

    render(<ProjectsList {...defaultProps} sidebarState={sidebarStateWithoutRegion} />)

    const addButton = screen.getByText('Add Project')
    expect(addButton).toBeDisabled()
  })

  it('calls onProjectSelect when project is clicked', () => {
    render(<ProjectsList {...defaultProps} />)

    fireEvent.click(screen.getByText('Test Project 1'))

    expect(defaultProps.onProjectSelect).toHaveBeenCalledWith(mockProjects[0])
  })

  it('calls onSidebarStateChange when Edit button is clicked', () => {
    render(<ProjectsList {...defaultProps} />)

    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    expect(defaultProps.onSidebarStateChange).toHaveBeenCalledWith({
      mode: 'edit-project',
      data: { project: mockProjects[0] },
    })
  })

  it('calls onDeleteProject when Delete button is clicked', () => {
    render(<ProjectsList {...defaultProps} />)

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    expect(defaultProps.onDeleteProject).toHaveBeenCalledWith(mockProjects[0])
  })

  it('calls onSidebarStateChange when Back to Regions button is clicked', () => {
    render(<ProjectsList {...defaultProps} />)

    fireEvent.click(screen.getByText('Back to Regions'))

    expect(defaultProps.onSidebarStateChange).toHaveBeenCalledWith({
      mode: 'regions',
      data: null,
    })
  })

  it('renders correct pin count for each project', () => {
    render(<ProjectsList {...defaultProps} />)

    expect(screen.getByText('2 pins')).toBeInTheDocument()
    expect(screen.getByText('0 pins')).toBeInTheDocument()
  })

  it('renders edit and delete buttons for each project', () => {
    render(<ProjectsList {...defaultProps} />)

    const editButtons = screen.getAllByText('Edit')
    const deleteButtons = screen.getAllByText('Delete')

    expect(editButtons).toHaveLength(2) // One for each project
    expect(deleteButtons).toHaveLength(2) // One for each project
  })

  it('applies hover styles correctly', () => {
    render(<ProjectsList {...defaultProps} />)

    const projectCard = screen.getByText('Test Project 1').closest('div')
    expect(projectCard).toHaveClass('hover:bg-gray-50')
  })

  it('renders Back to Regions button with correct styling', () => {
    render(<ProjectsList {...defaultProps} />)

    const backButton = screen.getByText('Back to Regions')
    expect(backButton).toHaveClass(
      'w-full',
      'bg-gray-100',
      'hover:bg-gray-200',
      'text-gray-800',
      'font-medium'
    )
  })
})
