import type { StyleSpecification } from 'maplibre-gl';

// Draw styles for polygon drawing
export const DRAW_STYLES = [
  // Polygon fill
  {
    id: 'gl-draw-polygon-fill',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: {
      'fill-color': '#3bb2d0',
      'fill-outline-color': '#3bb2d0',
      'fill-opacity': 0.1
    }
  },
  // Polygon outline
  {
    id: 'gl-draw-polygon-stroke',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#3bb2d0',
      'line-width': 2
    }
  },
  // Vertex points
  {
    id: 'gl-draw-polygon-and-line-vertex-active',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 6,
      'circle-color': '#fff',
      'circle-stroke-color': '#3bb2d0',
      'circle-stroke-width': 2
    }
  },
  // Active line string during drawing
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#3bb2d0',
      'line-width': 2,
      'line-dasharray': [0.2, 2]
    }
  },
  // Midpoints
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 4,
      'circle-color': '#fbb03b',
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 1
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
    SELECTED: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: '#4CAF50',
      border: '3px solid #fff',
      cursor: 'pointer',
      boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
      zIndex: '600',
      transform: 'scale(1.2)',
      transition: 'all 0.2s ease-in-out'
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
};

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
  },
  defaultMode: 'simple_select',
  styles: DRAW_STYLES,
  userProperties: true,
  touchEnabled: true,
  clickBuffer: 4
} as const;

// Export the type for MAP_STYLES.PIN
export type PinStyles = typeof MAP_STYLES.PIN;