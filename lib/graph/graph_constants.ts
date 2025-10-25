// Centralized constants for graph rendering/building (no magic numbers)

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

// Hit areas
export const HITBOX_PADDING = 0.8

// Builder-only defaults
export const DEFAULT_NODE_X = 0.2
export const DEFAULT_NODE_Y = 0.2
export const DEFAULT_EDGE_WEIGHT = 1
