import { Region, Project, Pin, MapState, SidebarState } from '../index'

describe('Type Definitions', () => {
  describe('Region interface', () => {
    it('should have all required properties', () => {
      const region: Region = {
        id: 1,
        name: 'Test Region',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(region.id).toBe(1)
      expect(region.name).toBe('Test Region')
      expect(region.created_at).toBe('2024-01-01T00:00:00Z')
      expect(region.updated_at).toBe('2024-01-01T00:00:00Z')
    })

    it('should allow optional projects property', () => {
      const regionWithProjects: Region = {
        id: 1,
        name: 'Test Region',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        projects: [
          {
            id: 1,
            region_id: 1,
            name: 'Test Project',
            geo_json: { type: 'Polygon' },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      expect(regionWithProjects.projects).toBeDefined()
      expect(regionWithProjects.projects!.length).toBe(1)
    })
  })

  describe('Project interface', () => {
    it('should have all required properties', () => {
      const project: Project = {
        id: 1,
        region_id: 1,
        name: 'Test Project',
        geo_json: { type: 'Polygon', coordinates: [] },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(project.id).toBe(1)
      expect(project.region_id).toBe(1)
      expect(project.name).toBe('Test Project')
      expect(project.geo_json).toEqual({ type: 'Polygon', coordinates: [] })
      expect(project.created_at).toBe('2024-01-01T00:00:00Z')
      expect(project.updated_at).toBe('2024-01-01T00:00:00Z')
    })

    it('should allow optional region and pins properties', () => {
      const projectWithRelations: Project = {
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
        pins: [
          {
            id: 1,
            project_id: 1,
            latitude: 40.7128,
            longitude: -74.0060,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      expect(projectWithRelations.region).toBeDefined()
      expect(projectWithRelations.pins).toBeDefined()
      expect(projectWithRelations.pins!.length).toBe(1)
    })

    it('should accept any geo_json format', () => {
      const projectWithGeoJson: Project = {
        id: 1,
        region_id: 1,
        name: 'Test Project',
        geo_json: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
              },
              properties: {},
            },
          ],
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(projectWithGeoJson.geo_json.type).toBe('FeatureCollection')
    })
  })

  describe('Pin interface', () => {
    it('should have all required properties', () => {
      const pin: Pin = {
        id: 1,
        project_id: 1,
        latitude: 40.7128,
        longitude: -74.0060,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(pin.id).toBe(1)
      expect(pin.project_id).toBe(1)
      expect(pin.latitude).toBe(40.7128)
      expect(pin.longitude).toBe(-74.0060)
      expect(pin.created_at).toBe('2024-01-01T00:00:00Z')
      expect(pin.updated_at).toBe('2024-01-01T00:00:00Z')
    })

    it('should allow optional project property', () => {
      const pinWithProject: Pin = {
        id: 1,
        project_id: 1,
        latitude: 40.7128,
        longitude: -74.0060,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        project: {
          id: 1,
          region_id: 1,
          name: 'Test Project',
          geo_json: { type: 'Polygon', coordinates: [] },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      }

      expect(pinWithProject.project).toBeDefined()
      expect(pinWithProject.project!.name).toBe('Test Project')
    })
  })

  describe('MapState interface', () => {
    it('should have all required properties with null values', () => {
      const mapState: MapState = {
        selectedRegion: null,
        selectedProject: null,
        selectedPin: null,
        drawingMode: null,
        editMode: null,
      }

      expect(mapState.selectedRegion).toBeNull()
      expect(mapState.selectedProject).toBeNull()
      expect(mapState.selectedPin).toBeNull()
      expect(mapState.drawingMode).toBeNull()
      expect(mapState.editMode).toBeNull()
    })

    it('should allow valid drawing modes', () => {
      const mapStateProject: MapState = {
        selectedRegion: null,
        selectedProject: null,
        selectedPin: null,
        drawingMode: 'project',
        editMode: null,
      }

      const mapStatePin: MapState = {
        selectedRegion: null,
        selectedProject: null,
        selectedPin: null,
        drawingMode: 'pin',
        editMode: null,
      }

      expect(mapStateProject.drawingMode).toBe('project')
      expect(mapStatePin.drawingMode).toBe('pin')
    })

    it('should allow valid edit modes', () => {
      const editModes: Array<'region' | 'project' | 'pin'> = ['region', 'project', 'pin']
      
      editModes.forEach(mode => {
        const mapState: MapState = {
          selectedRegion: null,
          selectedProject: null,
          selectedPin: null,
          drawingMode: null,
          editMode: mode,
        }
        
        expect(mapState.editMode).toBe(mode)
      })
    })

    it('should allow selected entities', () => {
      const region: Region = {
        id: 1,
        name: 'Test Region',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const project: Project = {
        id: 1,
        region_id: 1,
        name: 'Test Project',
        geo_json: { type: 'Polygon', coordinates: [] },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const pin: Pin = {
        id: 1,
        project_id: 1,
        latitude: 40.7128,
        longitude: -74.0060,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const mapState: MapState = {
        selectedRegion: region,
        selectedProject: project,
        selectedPin: pin,
        drawingMode: 'project',
        editMode: 'pin',
      }

      expect(mapState.selectedRegion).toEqual(region)
      expect(mapState.selectedProject).toEqual(project)
      expect(mapState.selectedPin).toEqual(pin)
    })
  })

  describe('SidebarState interface', () => {
    it('should have all required properties', () => {
      const sidebarState: SidebarState = {
        isOpen: true,
        mode: 'regions',
        data: null,
      }

      expect(sidebarState.isOpen).toBe(true)
      expect(sidebarState.mode).toBe('regions')
      expect(sidebarState.data).toBeNull()
    })

    it('should allow all valid modes', () => {
      const validModes: SidebarState['mode'][] = [
        'regions',
        'projects',
        'create-region',
        'create-project',
        'view-project',
        'edit-region',
        'edit-project',
        'view-pin',
        'edit-pin',
      ]

      validModes.forEach(mode => {
        const sidebarState: SidebarState = {
          isOpen: true,
          mode,
          data: null,
        }

        expect(sidebarState.mode).toBe(mode)
      })
    })

    it('should allow any data type', () => {
      const sidebarStateWithData: SidebarState = {
        isOpen: true,
        mode: 'view-project',
        data: {
          project: {
            id: 1,
            region_id: 1,
            name: 'Test Project',
            geo_json: { type: 'Polygon', coordinates: [] },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
      }

      expect(sidebarStateWithData.data).toBeDefined()
      expect(sidebarStateWithData.data.project.name).toBe('Test Project')
    })
  })
})
