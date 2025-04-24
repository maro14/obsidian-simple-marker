/**
 * Available marker types and their configurations
 */
export const MARKER_TYPES = {
    highlight: { prefix: '==', postfix: '==', name: 'Highlight' },
    bold: { prefix: '**', postfix: '**', name: 'Bold' },
    italic: { prefix: '_', postfix: '_', name: 'Italic' },
    strikethrough: { prefix: '~~', postfix: '~~', name: 'Strikethrough' },
    code: { prefix: '`', postfix: '`', name: 'Inline Code' }
} as const;

/**
 * Type definition for marker types
 */
export type MarkerType = keyof typeof MARKER_TYPES;

/**
 * Default settings for the plugin
 */
export const DEFAULT_SETTINGS = {
    defaultMarker: 'highlight' as MarkerType,
    customTags: []
};
