'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import MapLibreDraw from 'maplibre-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'maplibre-gl-draw/dist/mapbox-gl-draw.css';
import { Project, Pin, MapState, GeoJSONPolygon } from '@/types';
import { DRAW_STYLES } from '@/constants/mapStyles';

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', 'https://b.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', 'https://c.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', 'https://d.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© CartoDB'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [0, 0],
      zoom: 2
    });

    // Initialize draw tools
    draw.current = new MapLibreDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      styles: DRAW_STYLES
    });

    map.current.addControl(draw.current as unknown as maplibregl.IControl);

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    // Handle draw events
    map.current.on('draw.create', (_e) => {
      if (mapState.drawingMode === 'project') {
        const data = draw.current?.getAll();
        if (data && data.features.length > 0) {
          const feature = data.features[0];
          onMapStateChange({ drawingMode: null });
          // Pass the polygon data to the parent component
          if (onPolygonCreation && feature.geometry) {
            onPolygonCreation(feature.geometry as GeoJSONPolygon);
          }
        }
      }
    });

    map.current.on('draw.update', (_e) => {
      if (mapState.editMode === 'project') {
        const data = draw.current?.getAll();
        if (data && data.features.length > 0) {
          const feature = data.features[0];
          // Pass the updated polygon data to the parent component
          if (onPolygonUpdate && feature.geometry) {
            onPolygonUpdate(feature.geometry as GeoJSONPolygon);
          }
        }
      }
    });

    // Handle map clicks for pin creation
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
  }, []);

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

  // Add project polygons to map
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // Remove existing project sources and layers
    const existingSources = ['projects-source'];
    const existingLayers = ['projects-fill', 'projects-stroke'];

    existingLayers.forEach(layerId => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    existingSources.forEach(sourceId => {
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });

    // Add projects from selected region
    if (mapState.selectedRegion?.projects && mapState.selectedRegion.projects.length > 0) {
      const features = mapState.selectedRegion.projects.map(project => ({
        type: 'Feature' as const,
        geometry: project.geo_json,
        properties: {
          id: project.id,
          name: project.name
        }
      }));

      map.current.addSource('projects-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      });

      map.current.addLayer({
        id: 'projects-fill',
        type: 'fill',
        source: 'projects-source',
        paint: {
          'fill-color': '#3bb2d0',
          'fill-opacity': 0.2
        }
      });

      map.current.addLayer({
        id: 'projects-stroke',
        type: 'line',
        source: 'projects-source',
        paint: {
          'line-color': '#3bb2d0',
          'line-width': 2
        }
      });

      // Add click handler for projects
      map.current.on('click', 'projects-fill', (e) => {
        if (e.features && e.features[0]) {
          const projectId = e.features[0].properties?.id;
          const project = mapState.selectedRegion?.projects?.find(p => p.id === projectId);
          if (project) {
            onProjectClick(project);
          }
        }
      });

      map.current.on('mouseenter', 'projects-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'projects-fill', () => {
        if (map.current && mapState.drawingMode !== 'pin') {
          map.current.getCanvas().style.cursor = '';
        }
      });
    }
  }, [mapState.selectedRegion, isMapLoaded, onProjectClick, mapState.drawingMode]);

  // Add pin markers to map
  useEffect(() => {
    if (!map.current || !isMapLoaded || !mapState.selectedProject) return;

    // Remove existing pin markers
    pinMarkers.current.forEach(marker => marker.remove());
    pinMarkers.current = [];

    // Add pin markers
    mapState.selectedProject.pins?.forEach(pin => {
      const el = document.createElement('div');
      el.className = 'pin-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#fbb03b';
      el.style.border = '2px solid #fff';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.zIndex = '500';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pin.longitude, pin.latitude])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onPinClick(pin);
      });

      pinMarkers.current.push(marker);
    });
  }, [mapState.selectedProject, isMapLoaded, onPinClick]);

  // Zoom in function
  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  // Zoom out function
  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors border-b border-gray-200"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="11" x2="11" y1="8" y2="14"/>
              <line x1="8" x2="14" y1="11" y2="11"/>
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="8" x2="14" y1="11" y2="11"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Map Controls - Removed duplicate controls, handled by main page overlay */}
    </div>
  );
}
