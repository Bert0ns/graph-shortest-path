// Centralized constants for graph rendering/building (no magic numbers)

export const colors = {
    edge: {
        text: 'var(--foreground)',
        normal: '#94A3B8',
        active: '#64748b',
        path: '#8B5CF6',
        relaxed: '#FBBF24',
        weightBackground: 'var(--background)',
        arrowHead: {
            path: '#94A3B8',
            relaxed: '#FBBF24',
            active: '#8B5CF6',
        }
    },
    node: {
        normal: {
            fill: '#A7F3D0',
            stroke: '#34D399',
        },
        current: {
            fill: '#FDE68A',
            stroke: '#F59E0B',
        },
        frontier: {
            fill: '#BFDBFE',
            stroke: '#60A5FA',
        },
        visited: {
            fill: '#FCA5A5',
            stroke: '#F87171',
        },
        relaxed: {
            fill: '#FCD34D',
            stroke: '#F59E0B',
        },
        path: {
            fill: '#C4B5FD',
            stroke: '#8B5CF6',
        },
        startRing: '#10B981',
        endRing: '#6366F1',
        distanceText: '#cc0800',
        idText: 'var(--foreground)',
        labelText: 'var(--muted-foreground)',
    },
    grid: {
        minor: 'var(--border)',
        major: 'var(--border)',
        label: 'var(--muted-foreground)',
    },
    loadingCanvas: {
        text: 'var(--foreground)',
    }
}

// SVG viewBox dimensions and margins (logical units)
export const VIEWBOX_W = 100
export const VIEWBOX_H = 60
export const VIEWBOX_MARGIN = 6

// Node visuals
export const NODE_RADIUS = 3.2 // logical units (SVG viewBox)
export const NODE_STROKE_WIDTH = 0.9
export const NODE_ID_FONT_SIZE = 2.8
export const LABEL_FONT_SIZE = 2.4
export const LABEL_OFFSET = 1.2
export const DISTANCE_FONT_SIZE = 2.2
export const DISTANCE_OFFSET = 2.2

// Edge visuals
export const EDGE_STROKE_WIDTH = 0.4
export const PATH_EDGE_STROKE_WIDTH = 0.8
export const RELAXED_EDGE_STROKE_WIDTH = 0.6
export const EDGE_NODE_GAP = 0.6 // extra gap besides radius
export const EDGE_PARALLEL_OFFSET = 1.3 // offset for bidirectional parallel lines

// Arrowheads
export const ARROW_SIZE = 4 // marker width/height
export const ARROW_SIZE_PATH = 4.5 // slightly larger for path emphasis
export const ARROW_PULLBACK = 1.0 // extra gap to keep arrowheads out of node
export const ARROW_REF_X = 8 // refX used in marker for pointing to end of line
export const ARROW_REF_Y = 5 // marker viewBox midpoint on Y

// Node rings (start/end indicators)
export const START_RING_DELTA = 1.2
export const START_RING_STROKE_WIDTH = 0.7
export const END_RING_DELTA = 2.1
export const END_RING_STROKE_WIDTH = 0.7
export const END_RING_DASH = "2 1"

// Weight label bubble
export const WEIGHT_LABEL_FONT_SIZE = 3
export const WEIGHT_LABEL_HEIGHT = 3
export const WEIGHT_LABEL_PADDING = 1.5 // horizontal padding baseline
export const WEIGHT_LABEL_CHAR_WIDTH = 1.8 // approximate char width for sizing
export const WEIGHT_LABEL_BASELINE_TWEAK = 0.2 // small vertical optical correction for text baseline

// Builder-only defaults
export const DEFAULT_NODE_X = 0.2
export const DEFAULT_NODE_Y = 0.2
export const DEFAULT_EDGE_WEIGHT = 1

// Grid (builder canvas)
export const GRID_MINOR_STEP = 0.05 // normalized units
export const GRID_MAJOR_STEP = 0.25 // normalized units
export const GRID_LABEL_FONT_SIZE = 1.8
export const GRID_LABEL_OFFSET = 0.9 // offset from inner bounds
export const GRID_OPACITY_MINOR = 0.3
export const GRID_OPACITY_MAJOR = 0.45
