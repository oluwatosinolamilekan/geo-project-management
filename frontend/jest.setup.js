import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock maplibre-gl
jest.mock('maplibre-gl', () => ({
  Map: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    addControl: jest.fn(),
    removeControl: jest.fn(),
    addSource: jest.fn(),
    removeSource: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    setLayoutProperty: jest.fn(),
    setPaintProperty: jest.fn(),
    getSource: jest.fn(),
    getLayer: jest.fn(),
    queryRenderedFeatures: jest.fn(),
    project: jest.fn(),
    unproject: jest.fn(),
    getBounds: jest.fn(),
    setBounds: jest.fn(),
    getCenter: jest.fn(),
    setCenter: jest.fn(),
    getZoom: jest.fn(),
    setZoom: jest.fn(),
    remove: jest.fn(),
  })),
  NavigationControl: jest.fn(),
  Marker: jest.fn(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  })),
  Popup: jest.fn(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    setHTML: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  })),
}))

// Mock maplibre-gl-draw
jest.mock('maplibre-gl-draw', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    delete: jest.fn(),
    deleteAll: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    changeMode: jest.fn(),
    getMode: jest.fn(),
  }))
})

// Mock fetch globally
global.fetch = jest.fn()

// Setup environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000'
