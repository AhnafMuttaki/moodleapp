// (C) Copyright 2024 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Color validation utilities for brand theming.
 */

/**
 * Validate if a string is a valid hex color.
 */
export function isValidHexColor(color: string): boolean {
    if (!color || typeof color !== 'string') {
        return false;
    }

    // Remove # if present
    const cleanColor = color.replace('#', '');

    // Check if it's a valid hex color (3 or 6 characters)
    const hexPattern = /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/;
    return hexPattern.test(cleanColor);
}

/**
 * Convert hex color to RGB values.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!isValidHexColor(hex)) {
        return null;
    }

    const cleanHex = hex.replace('#', '');
    let r: number, g: number, b: number;

    if (cleanHex.length === 3) {
        // Convert 3-digit hex to 6-digit
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
    }

    return { r, g, b };
}

/**
 * Calculate the relative luminance of a color.
 */
export function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;

    // Convert to relative luminance
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate the contrast ratio between two colors.
 */
export function getContrastRatio(color1: string, color2: string): number | null {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) {
        return null;
    }

    const lum1 = getRelativeLuminance(rgb1);
    const lum2 = getRelativeLuminance(rgb2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color contrast meets WCAG AA standards.
 */
export function meetsWCAGAA(color1: string, color2: string): boolean {
    const contrastRatio = getContrastRatio(color1, color2);
    return contrastRatio !== null && contrastRatio >= 4.5;
}

/**
 * Check if color contrast meets WCAG AAA standards.
 */
export function meetsWCAGAAA(color1: string, color2: string): boolean {
    const contrastRatio = getContrastRatio(color1, color2);
    return contrastRatio !== null && contrastRatio >= 7;
}

/**
 * Generate a contrasting color (black or white) for a given background color.
 */
export function getContrastColor(backgroundColor: string): string {
    const rgb = hexToRgb(backgroundColor);
    if (!rgb) {
        return '#000000'; // Default to black
    }

    const luminance = getRelativeLuminance(rgb);
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Generate color variations (shade and tint) for a given color.
 */
export function generateColorVariations(color: string): {
    shade: string;
    tint: string;
    contrast: string;
} | null {
    const rgb = hexToRgb(color);
    if (!rgb) {
        return null;
    }

    const { r, g, b } = rgb;

    // Generate shade (darker)
    const shadeR = Math.max(0, Math.floor(r * 0.8));
    const shadeG = Math.max(0, Math.floor(g * 0.8));
    const shadeB = Math.max(0, Math.floor(b * 0.8));

    // Generate tint (lighter)
    const tintR = Math.min(255, Math.floor(r + (255 - r) * 0.2));
    const tintG = Math.min(255, Math.floor(g + (255 - g) * 0.2));
    const tintB = Math.min(255, Math.floor(b + (255 - b) * 0.2));

    const shade = `#${shadeR.toString(16).padStart(2, '0')}${shadeG.toString(16).padStart(2, '0')}${shadeB.toString(16).padStart(2, '0')}`;
    const tint = `#${tintR.toString(16).padStart(2, '0')}${tintG.toString(16).padStart(2, '0')}${tintB.toString(16).padStart(2, '0')}`;
    const contrast = getContrastColor(color);

    return { shade, tint, contrast };
}
