'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import MapLibreDraw from 'maplibre-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'maplibre-gl-draw/dist/mapbox-gl-draw.css';
import { Project, Pin, MapState, GeoJSONPolygon } from '@/types';
import { DRAW_STYLES, MAP_STYLES, MAP_CONFIG, DRAW_CONFIG } from '@/constants/mapStyles';

interface MapProps {
  mapState: MapState;
  onMapStateChange: (state: Partial<MapState>) => void;
  onPinClick: (pin: Pin) => void;
  onProjectClick: (project: Project) => void;
  onPinCreation?: (latitude: number, longitude: number) => void;
  onPolygonCreation?: (polygonData: GeoJSONPolygon) => void;
  onPolygonUpdate?: (polygonData: GeoJSONPolygon) => void;
}

export default function Map({ 
  mapState, 
  onMapStateChange, 
  onPinClick, 
  onProjectClick,
  onPinCreation,
  onPolygonCreation,
  onPolygonUpdate 
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MapLibreDraw | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const pinMarkers = useRef<maplibregl.Marker[]>([]);
  const editingPinMarker = useRef<maplibregl.Marker | null>(null);

  // Helper functions
  const createMarkerElement = useCallback((styles: typeof MAP_STYLES.PIN[keyof typeof MAP_STYLES.PIN]) => {
    const el = document.createElement('div');
    Object.assign(el.style, styles);
    return el;
  }, []);

  // Map initialization configuration
  const getMapConfig = useCallback((): maplibregl.MapOptions => ({
    container: mapContainer.current!,
    style: MAP_CONFIG.TILES.OSM,
    center: MAP_CONFIG.INITIAL.center,
    zoom: MAP_CONFIG.INITIAL.zoom
  }), []);

  // Draw tool configuration
  const getDrawConfig = useCallback(() => DRAW_CONFIG, []);

  // Handle polygon creation/update
  const handlePolygonEvent = useCallback((eventType: 'create' | 'update') => {
    if (!draw.current) return;
    
    const data = draw.current.getAll();
    if (!data || !data.features.length) return;

    const feature = data.features[0];
    if (!feature.geometry) return;

    if (eventType === 'create' && onPolygonCreation) {
      onMapStateChange({ drawingMode: null });
      onPolygonCreation(feature.geometry as GeoJSONPolygon);
    } else if (eventType === 'update' && onPolygonUpdate) {
      onPolygonUpdate(feature.geometry as GeoJSONPolygon);
    }
  }, [onMapStateChange, onPolygonCreation, onPolygonUpdate]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map(getMapConfig());
    draw.current = new MapLibreDraw(getDrawConfig());
    map.current.addControl(draw.current as unknown as maplibregl.IControl);

    // Set up event listeners
    map.current.on('load', () => setIsMapLoaded(true));

    map.current.on('draw.create', () => {
      if (mapState.drawingMode === 'project') {
        handlePolygonEvent('create');
      }
    });

    map.current.on('draw.update', () => {
      if (mapState.editMode === 'project') {
        handlePolygonEvent('update');
      }
    });

    map.current.on('click', (e) => {
      if (mapState.drawingMode === 'pin' && onPinCreation) {
        const { lng, lat } = e.lngLat;
        onPinCreation(lat, lng);
        onMapStateChange({ drawingMode: null });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [getMapConfig, getDrawConfig, handlePolygonEvent, mapState.drawingMode, mapState.editMode, onPinCreation, onMapStateChange]);

  // Handle drawing mode changes
  useEffect(() => {
    if (!draw.current || !isMapLoaded) return;

    if (mapState.drawingMode === 'project') {
      // Clear any existing drawings
      draw.current.deleteAll();
      (draw.current as unknown as { changeMode: (mode: string) => void }).changeMode('draw_polygon');
      
      // Add keyboard event listener for ESC key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          draw.current?.deleteAll();
          (draw.current as unknown as { changeMode: (mode: string) => void }).changeMode('simple_select');
          onMapStateChange({ drawingMode: null });
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    } else if (mapState.drawingMode === 'pin') {
      // Change cursor to indicate pin creation mode
      if (map.current) {
        map.current.getCanvas().style.cursor = 'crosshair';
      }
    } else if (mapState.drawingMode === null) {
      (draw.current as unknown as { changeMode: (mode: string) => void }).changeMode('simple_select');
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    }
  }, [mapState.drawingMode, isMapLoaded, onMapStateChange]);

  // Handle edit mode changes
  useEffect(() => {
    if (!draw.current || !isMapLoaded) return;

    if (mapState.editMode === 'project' && mapState.selectedProject) {
      // Load existing polygon for editing
      draw.current.set({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: mapState.selectedProject.geo_json,
          properties: {}
        }]
      });
      (draw.current as unknown as { changeMode: (mode: string) => void }).changeMode('direct_select');
    } else if (mapState.editMode === 'pin' && mapState.selectedPin) {
      // Create a draggable marker for pin editing
      if (editingPinMarker.current) {
        editingPinMarker.current.remove();
      }
      
      const el = document.createElement('div');
      el.className = 'editing-pin-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#ff4444';
      el.style.border = '3px solid #fff';
      el.style.cursor = 'grab';
      el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
      el.style.zIndex = '1000';

      editingPinMarker.current = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([mapState.selectedPin.longitude, mapState.selectedPin.latitude])
        .addTo(map.current!);

      // Handle drag events
      editingPinMarker.current.on('dragend', () => {
        if (editingPinMarker.current && mapState.selectedPin) {
          const { lng, lat } = editingPinMarker.current.getLngLat();
          // Update the form data in the parent component
          onMapStateChange({ 
            selectedPin: { 
              ...mapState.selectedPin, 
              latitude: lat, 
              longitude: lng 
            } 
          });
        }
      });
    } else if (mapState.editMode === null) {
      (draw.current as unknown as { changeMode: (mode: string) => void }).changeMode('simple_select');
      if (editingPinMarker.current) {
        editingPinMarker.current.remove();
        editingPinMarker.current = null;
      }
    }
  }, [mapState.editMode, mapState.selectedProject, mapState.selectedPin, isMapLoaded, onMapStateChange]);

  // Project layer management
  const cleanupProjectLayers = useCallback(() => {
    if (!map.current) return;

    ['projects-fill', 'projects-stroke'].forEach(layerId => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    if (map.current?.getSource('projects-source')) {
      map.current.removeSource('projects-source');
    }
  }, []);

  const setupProjectLayers = useCallback(() => {
    if (!map.current || !mapState.selectedRegion?.projects?.length) return;

    // If a project is selected, only show that project
    const projects = mapState.selectedProject 
      ? [mapState.selectedProject]
      : mapState.selectedRegion.projects;

    const features = projects.map(project => ({
      type: 'Feature' as const,
      geometry: project.geo_json,
      properties: { 
        id: project.id, 
        name: project.name,
        selected: project.id === mapState.selectedProject?.id 
      }
    }));

    map.current.addSource('projects-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features }
    });

    // Add fill layer for unselected projects
    map.current.addLayer({
      id: 'projects-fill',
      type: 'fill',
      source: 'projects-source',
      paint: {
        'fill-color': [
          'case',
          ['get', 'selected'], '#4a90e2', // Selected project color
          MAP_STYLES.PROJECT.FILL['fill-color'] // Default color
        ],
        'fill-opacity': [
          'case',
          ['get', 'selected'], 0.4, // Selected project opacity
          0.2 // Default opacity
        ]
      },
      filter: ['!=', ['get', 'selected'], true] // Only show unselected projects
    });

    // Add fill layer for selected project
    map.current.addLayer({
      id: 'selected-project-fill',
      type: 'fill',
      source: 'projects-source',
      paint: {
        'fill-color': '#4a90e2',
        'fill-opacity': 0.4
      },
      filter: ['==', ['get', 'selected'], true] // Only show selected project
    });

    // Add stroke layer for all projects
    map.current.addLayer({
      id: 'projects-stroke',
      type: 'line',
      source: 'projects-source',
      paint: {
        ...MAP_STYLES.PROJECT.STROKE,
        'line-width': [
          'case',
          ['get', 'selected'], 3, // Selected project stroke width
          1 // Default stroke width
        ],
        'line-color': [
          'case',
          ['get', 'selected'], '#4a90e2', // Selected project stroke color
          MAP_STYLES.PROJECT.STROKE['line-color'] // Default stroke color
        ]
      }
    });
  }, [mapState.selectedRegion, mapState.selectedProject]);

  const setupProjectInteractions = useCallback(() => {
    if (!map.current) return;

    const handleProjectClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      if (e.features?.[0]) {
        const projectId = e.features[0].properties?.id;
        const project = mapState.selectedRegion?.projects?.find(p => p.id === projectId);
        if (project) onProjectClick(project);
      }
    };

    map.current.on('click', 'projects-fill', handleProjectClick);
    const handleMouseEnter = () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    };
    const handleMouseLeave = () => {
      if (map.current && mapState.drawingMode !== 'pin') {
        map.current.getCanvas().style.cursor = '';
      }
    };

    map.current.on('mouseenter', 'projects-fill', handleMouseEnter);
    map.current.on('mouseleave', 'projects-fill', handleMouseLeave);

    return () => {
      if (map.current) {
        map.current.off('click', 'projects-fill', handleProjectClick);
        map.current.off('mouseenter', 'projects-fill', handleMouseEnter);
        map.current.off('mouseleave', 'projects-fill', handleMouseLeave);
      }
    };
  }, [mapState.selectedRegion, onProjectClick, mapState.drawingMode]);

  // Add project polygons to map
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Wait for the style to be fully loaded
    if (!map.current.isStyleLoaded()) {
      const waitForStyle = () => {
        if (map.current?.isStyleLoaded()) {
          cleanupProjectLayers();
          setupProjectLayers();
          const cleanup = setupProjectInteractions();
          map.current.off('styledata', waitForStyle);
          return cleanup;
        }
      };
      map.current.on('styledata', waitForStyle);
      return () => map.current?.off('styledata', waitForStyle);
    }

    // Style is already loaded, proceed normally
    cleanupProjectLayers();
    setupProjectLayers();
    const cleanup = setupProjectInteractions();

    return cleanup;
  }, [isMapLoaded, cleanupProjectLayers, setupProjectLayers, setupProjectInteractions]);

  // Pin marker management
  const createPinMarker = useCallback((pin: Pin) => {
    if (!map.current) return;

    const isSelected = mapState.selectedPin?.id === pin.id;
    const el = createMarkerElement(isSelected ? MAP_STYLES.PIN.SELECTED : MAP_STYLES.PIN.DEFAULT);
    el.className = `pin-marker ${isSelected ? 'selected' : ''}`;

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([pin.longitude, pin.latitude])
      .addTo(map.current);

    el.addEventListener('click', () => onPinClick(pin));
    return marker;
  }, [createMarkerElement, onPinClick, mapState.selectedPin]);

  // Helper function to calculate bounds of a polygon
  const calculatePolygonBounds = useCallback((coordinates: number[][][]) => {
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    coordinates[0].forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });

    return new maplibregl.LngLatBounds([minLng, minLat], [maxLng, maxLat]);
  }, []);

  // Center map on selected project
  useEffect(() => {
    if (!map.current || !isMapLoaded || !mapState.selectedProject?.geo_json) return;

    const bounds = calculatePolygonBounds(mapState.selectedProject.geo_json.coordinates);
    map.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
      maxZoom: 16
    });
  }, [mapState.selectedProject, isMapLoaded, calculatePolygonBounds]);

  // Update project source data when selected project changes
  useEffect(() => {
    if (!map.current || !isMapLoaded || !mapState.selectedRegion?.projects?.length) return;

    const source = map.current.getSource('projects-source') as maplibregl.GeoJSONSource;
    if (!source) return;

    // If a project is selected, only show that project
    const projects = mapState.selectedProject 
      ? [mapState.selectedProject]
      : mapState.selectedRegion.projects;

    const features = projects.map(project => ({
      type: 'Feature' as const,
      geometry: project.geo_json,
      properties: { 
        id: project.id, 
        name: project.name,
        selected: project.id === mapState.selectedProject?.id 
      }
    }));

    source.setData({
      type: 'FeatureCollection',
      features
    });
  }, [mapState.selectedProject, mapState.selectedRegion, isMapLoaded]);

  // Add pin markers to map and handle pin selection
  useEffect(() => {
    if (!map.current || !isMapLoaded || !mapState.selectedProject) return;

    pinMarkers.current.forEach(marker => marker.remove());
    pinMarkers.current = mapState.selectedProject.pins?.map(createPinMarker).filter(Boolean) as maplibregl.Marker[] || [];

    // Center map on selected pin with animation
    if (mapState.selectedPin) {
      map.current.flyTo({
        center: [mapState.selectedPin.longitude, mapState.selectedPin.latitude],
        zoom: 15,
        duration: 1000,
        essential: true
      });
    }
  }, [mapState.selectedProject, mapState.selectedPin, isMapLoaded, createPinMarker]);

  // Map control components
  const ZoomButton = useCallback(({ type, onClick }: { type: 'in' | 'out', onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors ${type === 'in' ? 'border-b border-gray-200' : ''}`}
      title={`Zoom ${type === 'in' ? 'In' : 'Out'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
        {type === 'in' && (
          <>
            <line x1="11" x2="11" y1="8" y2="14"/>
            <line x1="8" x2="14" y1="11" y2="11"/>
          </>
        )}
        {type === 'out' && <line x1="8" x2="14" y1="11" y2="11"/>}
      </svg>
    </button>
  ), []);

  // Map zoom controls
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!map.current) return;
    direction === 'in' ? map.current.zoomIn() : map.current.zoomOut();
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <ZoomButton type="in" onClick={() => handleZoom('in')} />
          <ZoomButton type="out" onClick={() => handleZoom('out')} />
        </div>
      </div>
    </div>
  );
}
