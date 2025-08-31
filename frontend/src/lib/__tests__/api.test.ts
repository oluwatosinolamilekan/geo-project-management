import { regionsApi, projectsApi, pinsApi, ApiError } from '../api'

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('ApiError', () => {
    it('should create an ApiError with status and message', () => {
      const error = new ApiError(404, 'Not found')
      expect(error.status).toBe(404)
      expect(error.message).toBe('Not found')
      expect(error.name).toBe('ApiError')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('regionsApi', () => {
    describe('getAll', () => {
      it('should fetch all regions successfully', async () => {
        const mockRegions = [
          { id: 1, name: 'Region 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
          { id: 2, name: 'Region 2', created_at: '2024-01-02', updated_at: '2024-01-02' },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockRegions }),
        } as Response)

        const result = await regionsApi.getAll()

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/regions',
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
        expect(result).toEqual(mockRegions)
      })

      it('should handle response without data wrapper', async () => {
        const mockRegions = [
          { id: 1, name: 'Region 1', created_at: '2024-01-01', updated_at: '2024-01-01' },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockRegions,
        } as Response)

        const result = await regionsApi.getAll()
        expect(result).toEqual(mockRegions)
      })

      it('should throw ApiError on HTTP error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ message: 'Internal Server Error' }),
        } as Response)

        await expect(regionsApi.getAll()).rejects.toThrow(ApiError)
        await expect(regionsApi.getAll()).rejects.toThrow('Internal Server Error')
      })

      it('should throw ApiError with default message on HTTP error without message', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => { throw new Error('Invalid JSON') },
        } as Response)

        await expect(regionsApi.getAll()).rejects.toThrow(ApiError)
        await expect(regionsApi.getAll()).rejects.toThrow('HTTP 404')
      })
    })
  })

  describe('projectsApi', () => {
    describe('getByRegion', () => {
      it('should fetch projects by region ID successfully', async () => {
        const mockProjects = [
          {
            id: 1,
            region_id: 1,
            name: 'Project 1',
            geo_json: { type: 'Polygon', coordinates: [] },
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockProjects }),
        } as Response)

        const result = await projectsApi.getByRegion(1)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/regions/1/projects',
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
        expect(result).toEqual(mockProjects)
      })

      it('should throw ApiError on HTTP error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'Region not found' }),
        } as Response)

        await expect(projectsApi.getByRegion(999)).rejects.toThrow(ApiError)
        await expect(projectsApi.getByRegion(999)).rejects.toThrow('Region not found')
      })
    })

    describe('getById', () => {
      it('should fetch project by ID successfully', async () => {
        const mockProject = {
          id: 1,
          region_id: 1,
          name: 'Project 1',
          geo_json: { type: 'Polygon', coordinates: [] },
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockProject }),
        } as Response)

        const result = await projectsApi.getById(1)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/projects/1',
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
        expect(result).toEqual(mockProject)
      })

      it('should throw ApiError on HTTP error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'Project not found' }),
        } as Response)

        await expect(projectsApi.getById(999)).rejects.toThrow(ApiError)
        await expect(projectsApi.getById(999)).rejects.toThrow('Project not found')
      })
    })
  })

  describe('pinsApi', () => {
    describe('getByProject', () => {
      it('should fetch pins by project ID successfully', async () => {
        const mockPins = [
          {
            id: 1,
            project_id: 1,
            latitude: 40.7128,
            longitude: -74.0060,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPins }),
        } as Response)

        const result = await pinsApi.getByProject(1)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/projects/1/pins',
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
        expect(result).toEqual(mockPins)
      })

      it('should throw ApiError on HTTP error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'Project not found' }),
        } as Response)

        await expect(pinsApi.getByProject(999)).rejects.toThrow(ApiError)
        await expect(pinsApi.getByProject(999)).rejects.toThrow('Project not found')
      })
    })

    describe('getById', () => {
      it('should fetch pin by ID successfully', async () => {
        const mockPin = {
          id: 1,
          project_id: 1,
          latitude: 40.7128,
          longitude: -74.0060,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPin }),
        } as Response)

        const result = await pinsApi.getById(1)

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/pins/1',
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
        expect(result).toEqual(mockPin)
      })

      it('should throw ApiError on HTTP error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'Pin not found' }),
        } as Response)

        await expect(pinsApi.getById(999)).rejects.toThrow(ApiError)
        await expect(pinsApi.getById(999)).rejects.toThrow('Pin not found')
      })
    })
  })

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(regionsApi.getAll()).rejects.toThrow('Network error')
    })

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Malformed JSON') },
      } as Response)

      await expect(regionsApi.getAll()).rejects.toThrow(ApiError)
      await expect(regionsApi.getAll()).rejects.toThrow('HTTP 500')
    })
  })
})
