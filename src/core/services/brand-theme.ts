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

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { makeSingleton } from '@singletons';
import { CoreLogger } from '@singletons/logger';
import { CoreBrandConfigProvider } from '@services/brand-config';
import { BrandColors } from '@/types/brand-config';
import {
    isValidHexColor,
    getContrastColor,
    generateColorVariations,
    meetsWCAGAA
} from '@/core/utils/color-validation';

/**
 * Service to manage brand theme application and CSS custom property injection.
 */
@Injectable({ providedIn: 'root' })
export class CoreBrandThemeProvider {

    protected logger = CoreLogger.getInstance('CoreBrandThemeProvider');
    protected isBrowser: boolean;
    protected themeApplied = false;

    constructor(
        @Inject(PLATFORM_ID) platformId: Object,
        protected brandConfig: CoreBrandConfigProvider
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    /**
     * Initialize brand theme service.
     */
    async initialize(): Promise<void> {
        if (!this.isBrowser) {
            this.logger.debug('Brand theme service not initialized on server side');
            return;
        }

        try {
            const isEnforced = await this.brandConfig.isBrandThemeEnforced();
            if (!isEnforced) {
                this.logger.debug('Brand theme enforcement is disabled');
                return;
            }

            const colors = await this.brandConfig.getColors();
            if (!colors) {
                this.logger.warn('Brand theme enforcement enabled but no colors configured');
                return;
            }

            await this.applyBrandTheme(colors);
            this.themeApplied = true;

            // Add brand theme class to body for CSS targeting
            if (this.isBrowser) {
                document.body.classList.add('brand-theme-enforced');
            }

            this.logger.debug('Brand theme applied successfully');

        } catch (error) {
            this.logger.error('Failed to initialize brand theme', error);
        }
    }

    /**
     * Apply brand theme colors to CSS custom properties.
     */
    async applyBrandTheme(colors: BrandColors): Promise<void> {
        if (!this.isBrowser) {
            return;
        }

        try {
            // Validate colors
            if (!this.validateColors(colors)) {
                this.logger.error('Invalid brand colors provided');
                return;
            }

            // Apply primary color
            if (colors.primary) {
                await this.applyPrimaryColor(colors.primary, colors.onPrimary);
            }

            // Apply secondary color
            if (colors.secondary) {
                await this.applySecondaryColor(colors.secondary, colors.onSecondary);
            }

            // Apply surface color
            if (colors.surface) {
                await this.applySurfaceColor(colors.surface, colors.onSurface);
            }

            this.logger.debug('Brand theme colors applied successfully');

        } catch (error) {
            this.logger.error('Failed to apply brand theme', error);
        }
    }

    /**
     * Apply primary color and its variations.
     */
    protected async applyPrimaryColor(primary: string, onPrimary?: string): Promise<void> {
        const root = document.documentElement;

        // Set primary color
        root.style.setProperty('--primary', primary);

        // Set contrast color
        const contrastColor = onPrimary || getContrastColor(primary);
        root.style.setProperty('--primary-contrast', contrastColor);

        // Generate and apply variations
        const variations = generateColorVariations(primary);
        if (variations) {
            root.style.setProperty('--primary-shade', variations.shade);
            root.style.setProperty('--primary-tint', variations.tint);
        }

        // Update brand color variable
        root.style.setProperty('--brand-color', primary);

        this.logger.debug(`Primary color applied: ${primary}`);
    }

    /**
     * Apply secondary color and its variations.
     */
    protected async applySecondaryColor(secondary: string, onSecondary?: string): Promise<void> {
        const root = document.documentElement;

        // Set secondary color
        root.style.setProperty('--secondary', secondary);

        // Set contrast color
        const contrastColor = onSecondary || getContrastColor(secondary);
        root.style.setProperty('--secondary-contrast', contrastColor);

        // Generate and apply variations
        const variations = generateColorVariations(secondary);
        if (variations) {
            root.style.setProperty('--secondary-shade', variations.shade);
            root.style.setProperty('--secondary-tint', variations.tint);
        }

        this.logger.debug(`Secondary color applied: ${secondary}`);
    }

    /**
     * Apply surface color and its variations.
     */
    protected async applySurfaceColor(surface: string, onSurface?: string): Promise<void> {
        const root = document.documentElement;

        // Set surface color
        root.style.setProperty('--surface', surface);

        // Set contrast color
        const contrastColor = onSurface || getContrastColor(surface);
        root.style.setProperty('--surface-contrast', contrastColor);

        this.logger.debug(`Surface color applied: ${surface}`);
    }

    /**
     * Validate brand colors.
     */
    protected validateColors(colors: BrandColors): boolean {
        if (!colors.primary || !isValidHexColor(colors.primary)) {
            this.logger.error('Invalid primary color');
            return false;
        }

        if (colors.secondary && !isValidHexColor(colors.secondary)) {
            this.logger.error('Invalid secondary color');
            return false;
        }

        if (colors.surface && !isValidHexColor(colors.surface)) {
            this.logger.error('Invalid surface color');
            return false;
        }

        // Check contrast if both colors are provided
        if (colors.primary && colors.onPrimary) {
            if (!meetsWCAGAA(colors.primary, colors.onPrimary)) {
                this.logger.warn('Primary color contrast does not meet WCAG AA standards');
            }
        }

        return true;
    }

    /**
     * Check if brand theme is currently applied.
     */
    isThemeApplied(): boolean {
        return this.themeApplied;
    }

    /**
     * Reset theme to default values.
     */
    async resetTheme(): Promise<void> {
        if (!this.isBrowser) {
            return;
        }

        const root = document.documentElement;

        // Reset to default Moodle colors
        root.style.setProperty('--primary', '#f98012');
        root.style.setProperty('--primary-contrast', '#ffffff');
        root.style.setProperty('--primary-shade', '#e6730a');
        root.style.setProperty('--primary-tint', '#fb8d2a');
        root.style.setProperty('--secondary', '#e9ecef');
        root.style.setProperty('--secondary-contrast', '#000000');
        root.style.setProperty('--surface', '#ffffff');
        root.style.setProperty('--surface-contrast', '#282828');
        root.style.setProperty('--brand-color', '#f98012');

        // Remove brand theme class from body
        if (this.isBrowser) {
            document.body.classList.remove('brand-theme-enforced');
        }

        this.themeApplied = false;
        this.logger.debug('Theme reset to default values');
    }

    /**
     * Update theme with new colors.
     */
    async updateTheme(colors: BrandColors): Promise<void> {
        await this.resetTheme();
        await this.applyBrandTheme(colors);
        this.themeApplied = true;
    }

    /**
     * Get current theme status.
     */
    async getThemeStatus(): Promise<{
        applied: boolean;
        enforced: boolean;
        colors: BrandColors | null;
    }> {
        const enforced = await this.brandConfig.isBrandThemeEnforced();
        const colors = await this.brandConfig.getColors();

        return {
            applied: this.themeApplied,
            enforced,
            colors
        };
    }

}

export const CoreBrandTheme = makeSingleton(CoreBrandThemeProvider);
