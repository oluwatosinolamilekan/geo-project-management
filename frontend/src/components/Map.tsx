'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import MapLibreDraw from 'maplibre-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'maplibre-gl-draw/dist/mapbox-gl-draw.css';
import { Region, Project, Pin, MapState } from '@/types';

interface MapProps {
  mapState: MapState;
  onMapStateChange: (state: Partial<MapState>) => void;
  onPinClick: (pin: Pin) => void;
  onProjectClick: (project: Project) => void;
  onPinCreation?: (latitude: number, longitude: number) => void;
}

export default function Map({ 
  mapState, 
  onMapStateChange, 
  onPinClick, 
  onProjectClick,
  onPinCreation 
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
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
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
      } as any,
      styles: [
        {
          id: 'gl-draw-polygon-fill-inactive',
          type: 'fill',
          filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': '#3bb2d0',
            'fill-outline-color': '#3bb2d0',
            'fill-opacity': 0.1
          }
        },
        {
          id: 'gl-draw-polygon-fill-active',
          type: 'fill',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': '#fbb03b',
            'fill-outline-color': '#fbb03b',
            'fill-opacity': 0.1
          }
        },
        {
          id: 'gl-draw-polygon-midpoint',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
          paint: {
            'circle-radius': 3,
            'circle-color': '#fbb03b'
          }
        },
        {
          id: 'gl-draw-polygon-stroke-inactive',
          type: 'line',
          filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#3bb2d0',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#fbb03b',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-line-inactive',
          type: 'line',
          filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#3bb2d0',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-line-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#fbb03b',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-halo-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 12,
            'circle-color': '#fff'
          }
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 8,
            'circle-color': '#fbb03b'
          }
        },
        {
          id: 'gl-draw-point-point-stroke-inactive',
          type: 'circle',
          filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#fff'
          }
        },
        {
          id: 'gl-draw-point-inactive',
          type: 'circle',
          filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 3,
            'circle-color': '#3bb2d0'
          }
        },
        {
          id: 'gl-draw-point-stroke-active',
          type: 'circle',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Point'], ['==', 'meta', 'vertex'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 7,
            'circle-color': '#fff'
          }
        },
        {
          id: 'gl-draw-point-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#fbb03b'
          }
        },
        {
          id: 'gl-draw-polygon-fill-static',
          type: 'fill',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': '#404040',
            'fill-outline-color': '#404040',
            'fill-opacity': 0.1
          }
        },
        {
          id: 'gl-draw-polygon-stroke-static',
          type: 'line',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#404040',
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-line-static',
          type: 'line',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#404040',
            'line-width': 2
          }
        },
        {
          id: 'gl-draw-point-static',
          type: 'circle',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#404040'
          }
        }
      ]
    });

    map.current.addControl(draw.current as any);

    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    // Handle draw events
    map.current.on('draw.create', (e) => {
      if (mapState.drawingMode === 'project') {
        const data = draw.current?.getAll();
        if (data && data.features.length > 0) {
          const feature = data.features[0];
          onMapStateChange({ drawingMode: null });
          // The polygon data will be used when creating the project
        }
      }
    });

    map.current.on('draw.update', (e) => {
      if (mapState.editMode === 'project') {
        const data = draw.current?.getAll();
        if (data && data.features.length > 0) {
          const feature = data.features[0];
          // The updated polygon data will be used when updating the project
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
      (draw.current as any).changeMode('draw_polygon');
    } else if (mapState.drawingMode === 'pin') {
      // Change cursor to indicate pin creation mode
      if (map.current) {
        map.current.getCanvas().style.cursor = 'crosshair';
      }
    } else if (mapState.drawingMode === null) {
      (draw.current as any).changeMode('simple_select');
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    }
  }, [mapState.drawingMode, isMapLoaded]);

  // Handle edit mode changes
  useEffect(() => {
    if (!draw.current || !isMapLoaded) return;

    if (mapState.editMode === 'project' && mapState.selectedProject) {
      // Load existing polygon for editing
      draw.current.set({
        type: 'FeatureCollection',
        features: [mapState.selectedProject.geo_json]
      });
      (draw.current as any).changeMode('direct_select');
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
      (draw.current as any).changeMode('simple_select');
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

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-2 space-y-2">
          {mapState.drawingMode === 'project' && (
            <div className="text-sm text-gray-600 bg-blue-100 p-2 rounded">
              Draw a polygon for your project
            </div>
          )}
          {mapState.drawingMode === 'pin' && (
            <div className="text-sm text-gray-600 bg-green-100 p-2 rounded">
              Click on the map to place a pin
            </div>
          )}
          {mapState.editMode === 'project' && (
            <div className="text-sm text-gray-600 bg-yellow-100 p-2 rounded">
              Edit the project polygon
            </div>
          )}
          {mapState.editMode === 'pin' && (
            <div className="text-sm text-gray-600 bg-red-100 p-2 rounded">
              Drag the pin to a new location
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
