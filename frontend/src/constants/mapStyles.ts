import type { StyleSpecification } from 'maplibre-gl';

// Draw styles for polygon drawing
export const DRAW_STYLES = [
  {
    id: 'gl-draw-polygon-fill',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#3bb2d0',
      'fill-outline-color': '#3bb2d0',
      'fill-opacity': 0.1
    }
  },
  {
    id: 'gl-draw-polygon-stroke',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#3bb2d0',
      'line-width': 2
    }
  }
];

// Map marker and layer styles
export const MAP_STYLES = {
  PIN: {
    DEFAULT: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: '#fbb03b',
      border: '2px solid #fff',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      zIndex: '500'
    },
    EDITING: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: '#ff4444',
      border: '3px solid #fff',
      cursor: 'grab',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
      zIndex: '1000'
    }
  },
  PROJECT: {
    FILL: {
      'fill-color': '#3bb2d0',
      'fill-opacity': 0.2
    },
    STROKE: {
      'line-color': '#3bb2d0',
      'line-width': 2
    }
  }
} as const;

// Map configuration
export const MAP_CONFIG = {
  INITIAL: {
    center: [0, 0] as [number, number],
    zoom: 2
  },
  TILES: {
    OSM: {
      version: 8,
      sources: {
        'osm': {
          type: 'raster' as const,
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
            'https://d.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png'
          ] as string[],
          tileSize: 256,
          attribution: '© CartoDB'
        }
      },
      layers: [{
        id: 'osm-tiles',
        type: 'raster' as const,
        source: 'osm',
        minzoom: 0,
        maxzoom: 22
      }]
    } as StyleSpecification
  }
} as const;

// Draw tool configuration
export const DRAW_CONFIG = {
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true
  }
} as const;