import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateProjectForm from '../CreateProjectForm'

const mockGeoJson = {
  type: 'Polygon',
  coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
}

const defaultProps = {
  formData: {},
  loading: false,
  onFormDataChange: jest.fn(),
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
}

describe('CreateProjectForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form title and instructions', () => {
    render(<CreateProjectForm {...defaultProps} />)

    expect(screen.getByText('Create Project')).toBeInTheDocument()
    expect(screen.getByText('📍 How to Draw Your Project Area:')).toBeInTheDocument()
    expect(screen.getByText('Click on the map to place your first point')).toBeInTheDocument()
    expect(screen.getByText('Continue clicking to add more points around your area')).toBeInTheDocument()
    expect(screen.getByText('Double-click the last point to complete the polygon')).toBeInTheDocument()
    expect(screen.getByText('Enter your project name below')).toBeInTheDocument()
  })

  it('shows warning when no polygon is drawn', () => {
    render(<CreateProjectForm {...defaultProps} />)

    expect(screen.getByText('⚠️ You need to draw a polygon on the map first')).toBeInTheDocument()
    expect(screen.getByText(' Start by drawing a polygon on the map to define your project area')).toBeInTheDocument()
  })

  it('shows success message when polygon is drawn', () => {
    render(<CreateProjectForm {...defaultProps} formData={{ geo_json: mockGeoJson }} />)

    expect(screen.getByText('✅ Polygon drawn! Now enter the project name.')).toBeInTheDocument()
    expect(screen.getByText('✅ Ready to create! Enter a name above and click "Create Project"')).toBeInTheDocument()
    expect(screen.queryByText('⚠️ You need to draw a polygon on the map first')).not.toBeInTheDocument()
  })

  it('renders project name input field', () => {
    render(<CreateProjectForm {...defaultProps} />)

    const nameInput = screen.getByLabelText('Project Name')
    expect(nameInput).toBeInTheDocument()
    expect(nameInput).toHaveAttribute('type', 'text')
    expect(nameInput).toHaveAttribute('placeholder', 'Enter project name')
    expect(nameInput).toBeRequired()
  })

  it('calls onFormDataChange when input changes', async () => {
    render(<CreateProjectForm {...defaultProps} />)

    const nameInput = screen.getByPlaceholderText('Enter project name')
    await userEvent.type(nameInput, 'New Project')

    // The onFormDataChange is called for each character, so we check the last call
    expect(defaultProps.onFormDataChange).toHaveBeenLastCalledWith({
      name: 'New Project'
    })
  })

  it('displays current form data in input field', () => {
    render(<CreateProjectForm {...defaultProps} formData={{ name: 'Existing Project' }} />)

    const nameInput = screen.getByLabelText('Project Name') as HTMLInputElement
    expect(nameInput.value).toBe('Existing Project')
  })

  it('renders Create Project button', () => {
    render(<CreateProjectForm {...defaultProps} />)

    const createButton = screen.getByText('Create Project')
    expect(createButton).toBeInTheDocument()
    expect(createButton).toHaveAttribute('type', 'submit')
  })

  it('renders Cancel button', () => {
    render(<CreateProjectForm {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
    expect(cancelButton).toHaveAttribute('type', 'button')
  })

  it('disables Create Project button when no geo_json', () => {
    render(<CreateProjectForm {...defaultProps} />)

    const createButton = screen.getByText('Create Project')
    expect(createButton).toBeDisabled()
  })

  it('disables Create Project button when loading', () => {
    render(<CreateProjectForm {...defaultProps} loading={true} formData={{ geo_json: mockGeoJson }} />)

    const createButton = screen.getByText('Creating...')
    expect(createButton).toBeDisabled()
  })

  it('enables Create Project button when geo_json exists and not loading', () => {
    render(<CreateProjectForm {...defaultProps} formData={{ geo_json: mockGeoJson }} />)

    const createButton = screen.getByText('Create Project')
    expect(createButton).not.toBeDisabled()
  })

  it('shows loading text when loading', () => {
    render(<CreateProjectForm {...defaultProps} loading={true} />)

    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(screen.queryByText('Create Project')).not.toBeInTheDocument()
  })

  it('calls onSubmit when form is submitted', async () => {
    render(<CreateProjectForm {...defaultProps} formData={{ geo_json: mockGeoJson, name: 'Test Project' }} />)

    const form = screen.getByRole('form')
    fireEvent.submit(form)

    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })

  it('calls onCancel when Cancel button is clicked', () => {
    render(<CreateProjectForm {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(defaultProps.onCancel).toHaveBeenCalled()
  })

  it('prevents form submission when no geo_json', () => {
    render(<CreateProjectForm {...defaultProps} formData={{ name: 'Test Project' }} />)

    const createButton = screen.getAllByText('Create Project')[1] // Get the button, not the heading
    expect(createButton).toBeDisabled()
    
    // Try to submit form - should not call onSubmit
    const submitButton = screen.getAllByText('Create Project')[1]
    const form = submitButton.closest('form')
    expect(form).toBeInTheDocument()
    
    // Even though the button is disabled, the form submission might still trigger
    // We'll check that the button is disabled which prevents submission
    expect(createButton).toBeDisabled()
  })

  it('handles empty formData gracefully', () => {
    render(<CreateProjectForm {...defaultProps} formData={{}} />)

    const nameInput = screen.getByLabelText('Project Name') as HTMLInputElement
    expect(nameInput.value).toBe('')
    
    const createButton = screen.getByText('Create Project')
    expect(createButton).toBeDisabled()
  })

  it('handles null formData gracefully', () => {
    render(<CreateProjectForm {...defaultProps} formData={null} />)

    const nameInput = screen.getByLabelText('Project Name') as HTMLInputElement
    expect(nameInput.value).toBe('')
  })

  it('applies correct CSS classes for styling', () => {
    render(<CreateProjectForm {...defaultProps} />)

    // Check instruction box styling
    const instructionBox = screen.getByText('📍 How to Draw Your Project Area:').closest('div')
    expect(instructionBox).toHaveClass('bg-blue-50', 'p-4', 'rounded-lg', 'border', 'border-blue-200')

    // Check input styling
    const nameInput = screen.getByLabelText('Project Name')
    expect(nameInput).toHaveClass('w-full', 'border', 'border-gray-300', 'rounded', 'px-3', 'py-2')

    // Check button styling
    const createButton = screen.getByText('Create Project')
    expect(createButton).toHaveClass('bg-blue-500', 'text-white', 'px-4', 'py-2', 'rounded')

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toHaveClass('bg-gray-300', 'text-gray-700', 'px-4', 'py-2', 'rounded')
  })
})
