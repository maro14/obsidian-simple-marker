import { MarkerType } from './constants';

/**
 * Interface for custom tag definition
 * @property {string} tag - The tag in format "prefix|postfix"
 * @property {string} category - Optional category for organizing tags
 */
export interface CustomTag {
    tag: string;
    category: string;
}

/**
 * Plugin settings interface
 * @property {MarkerType} defaultMarker - The default marker style to use
 * @property {CustomTag[]} customTags - Array of user-defined custom tags
 */
export interface SimpleMarkerSettings {
    defaultMarker: MarkerType;
    customTags: CustomTag[];
}
