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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { makeSingleton } from '@singletons';
import { CoreLogger } from '@singletons/logger';
import { CorePromisedValue } from '@classes/promised-value';
import {
    BrandConfig,
    BrandColors,
    BrandAssets,
    FeatureToggles,
    BrandConfigValidationResult,
    BrandConfigLoadResult
} from '@/types/brand-config';
import {
    isValidHexColor,
    getContrastRatio,
    meetsWCAGAA,
    generateColorVariations
} from '@/core/utils/color-validation';

/**
 * Service to manage brand configuration for white-labeling functionality.
 */
@Injectable({ providedIn: 'root' })
export class CoreBrandConfigProvider {

    protected logger = CoreLogger.getInstance('CoreBrandConfigProvider');
    protected config: BrandConfig | null = null;
    protected isReady = new CorePromisedValue<void>();
    protected loadPromise: Promise<BrandConfigLoadResult> | null = null;

    /**
     * Initialize the brand configuration service.
     */
    async initialize(): Promise<void> {
        if (this.loadPromise) {
            await this.loadPromise;
            return;
        }

        this.loadPromise = this.loadBrandConfig();
        const result = await this.loadPromise;

        if (result.success && result.config) {
            this.config = result.config;
            this.logger.debug('Brand configuration loaded successfully', this.config);
        } else {
            this.logger.warn('Failed to load brand configuration, using defaults', result.error);
            this.config = this.getDefaultConfig();
        }

        this.isReady.resolve();
    }

    /**
     * Wait until brand configuration is ready.
     */
    async ready(): Promise<void> {
        return this.isReady;
    }

    /**
     * Get the current brand configuration.
     */
    async getBrandConfig(): Promise<BrandConfig | null> {
        await this.ready();
        return this.config;
    }

    /**
     * Get the preconfigured site URL.
     */
    async getSiteUrl(): Promise<string | null> {
        await this.ready();
        return this.config?.siteUrl || null;
    }

    /**
     * Check if preconfigured site is enabled.
     */
    async isPreconfiguredSiteEnabled(): Promise<boolean> {
        await this.ready();
        return this.config?.featureToggles?.preconfiguredSite || false;
    }

    /**
     * Check if brand theme enforcement is enabled.
     */
    async isBrandThemeEnforced(): Promise<boolean> {
        await this.ready();
        return this.config?.featureToggles?.enforceBrandTheme || false;
    }

    /**
     * Get feature toggles configuration.
     */
    async getFeatureToggles(): Promise<FeatureToggles> {
        await this.ready();
        return this.config?.featureToggles || {};
    }

    /**
     * Validate brand configuration.
     */
    validateConfig(config: any): BrandConfigValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check required fields
        if (!config.brandId || typeof config.brandId !== 'string') {
            errors.push('brandId is required and must be a string');
        }

        if (!config.displayName || typeof config.displayName !== 'string') {
            errors.push('displayName is required and must be a string');
        }

        // Validate siteUrl if provided
        if (config.siteUrl) {
            if (typeof config.siteUrl !== 'string') {
                errors.push('siteUrl must be a string');
            } else if (!this.isValidUrl(config.siteUrl)) {
                errors.push('siteUrl must be a valid URL');
            }
        }

        // Validate colors if provided
        if (config.colors) {
            const colorValidation = this.validateColors(config.colors);
            errors.push(...colorValidation.errors);
            warnings.push(...colorValidation.warnings);
        }

        // Validate assets if provided
        if (config.assets) {
            const assets = config.assets;
            if (assets.logo && typeof assets.logo !== 'string') {
                errors.push('Logo asset path must be a string');
            }
            if (assets.splash && typeof assets.splash !== 'string') {
                errors.push('Splash asset path must be a string');
            }
            if (assets.appIcon && typeof assets.appIcon !== 'string') {
                errors.push('App icon asset path must be a string');
            }
        }

        // Validate feature toggles
        if (config.featureToggles) {
            const toggles = config.featureToggles;
            const validToggles = ['preconfiguredSite', 'enforceBrandTheme', 'enableAnalytics', 'enableOnboarding', 'darkMode'];

            Object.keys(toggles).forEach(key => {
                if (!validToggles.includes(key)) {
                    warnings.push(`Unknown feature toggle: ${key}`);
                }
                if (typeof toggles[key] !== 'boolean') {
                    errors.push(`Feature toggle ${key} must be a boolean`);
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Load brand configuration from assets.
     */
    protected async loadBrandConfig(): Promise<BrandConfigLoadResult> {
        try {
            const response = await fetch('/assets/brand-config.json');

            if (!response.ok) {
                throw new Error(`Failed to load brand config: ${response.status} ${response.statusText}`);
            }

            const config = await response.json();
            const validation = this.validateConfig(config);

            if (!validation.valid) {
                this.logger.error('Brand configuration validation failed', validation.errors);
                return {
                    config: null,
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }

            if (validation.warnings.length > 0) {
                this.logger.warn('Brand configuration warnings', validation.warnings);
            }

            return {
                config: config as BrandConfig,
                success: true
            };

        } catch (error) {
            this.logger.error('Failed to load brand configuration', error);
            return {
                config: null,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Get default brand configuration.
     */
    protected getDefaultConfig(): BrandConfig {
        return {
            brandId: 'default',
            displayName: 'Moodle Mobile',
            description: 'Default Moodle Mobile configuration',
            siteUrl: 'http://localhost:8082',
            featureToggles: {
                preconfiguredSite: true,
                enforceBrandTheme: false,
                enableAnalytics: false,
                enableOnboarding: true,
                darkMode: true
            }
        };
    }

    /**
     * Validate URL format.
     */
    protected isValidUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * Get brand colors configuration.
     */
    async getColors(): Promise<BrandColors | null> {
        await this.ready();
        return this.config?.colors || null;
    }

    /**
     * Get brand logo asset path.
     */
    async getLogoAsset(type: 'login' | 'top' = 'login'): Promise<string | null> {
        await this.ready();
        return this.config?.assets?.logo || null;
    }

    /**
     * Get brand splash asset path.
     */
    async getSplashAsset(): Promise<string | null> {
        await this.ready();
        return this.config?.assets?.splash || null;
    }

    /**
     * Get brand app icon asset path.
     */
    async getAppIconAsset(): Promise<string | null> {
        await this.ready();
        return this.config?.assets?.appIcon || null;
    }

    /**
     * Get all brand assets.
     */
    async getAssets(): Promise<BrandAssets | null> {
        await this.ready();
        return this.config?.assets || null;
    }

    /**
     * Validate brand colors for accessibility.
     */
    validateColors(colors: BrandColors): BrandConfigValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate primary color
        if (!colors.primary || !isValidHexColor(colors.primary)) {
            errors.push('Primary color is required and must be a valid hex color');
        }

        // Validate secondary color if provided
        if (colors.secondary && !isValidHexColor(colors.secondary)) {
            errors.push('Secondary color must be a valid hex color');
        }

        // Validate surface color if provided
        if (colors.surface && !isValidHexColor(colors.surface)) {
            errors.push('Surface color must be a valid hex color');
        }

        // Validate onPrimary color if provided
        if (colors.onPrimary && !isValidHexColor(colors.onPrimary)) {
            errors.push('OnPrimary color must be a valid hex color');
        }

        // Validate onSecondary color if provided
        if (colors.onSecondary && !isValidHexColor(colors.onSecondary)) {
            errors.push('OnSecondary color must be a valid hex color');
        }

        // Validate onSurface color if provided
        if (colors.onSurface && !isValidHexColor(colors.onSurface)) {
            errors.push('OnSurface color must be a valid hex color');
        }

        // Check color contrast if colors are provided
        if (colors.primary && colors.onPrimary) {
            if (!meetsWCAGAA(colors.primary, colors.onPrimary)) {
                warnings.push('Primary and onPrimary colors do not meet WCAG AA contrast requirements');
            }
        }

        if (colors.secondary && colors.onSecondary) {
            if (!meetsWCAGAA(colors.secondary, colors.onSecondary)) {
                warnings.push('Secondary and onSecondary colors do not meet WCAG AA contrast requirements');
            }
        }

        if (colors.surface && colors.onSurface) {
            if (!meetsWCAGAA(colors.surface, colors.onSurface)) {
                warnings.push('Surface and onSurface colors do not meet WCAG AA contrast requirements');
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Generate color variations for a given color.
     */
    generateColorVariations(color: string): { shade: string; tint: string; contrast: string } | null {
        return generateColorVariations(color);
    }

    /**
     * Reset configuration to default.
     */
    resetToDefault(): void {
        this.config = this.getDefaultConfig();
        this.logger.debug('Brand configuration reset to default');
    }

    /**
     * Update brand configuration dynamically (for secret-key based branding).
     *
     * @param config New brand configuration.
     */
    updateConfig(config: Partial<BrandConfig>): void {
        if (!this.config) {
            this.config = this.getDefaultConfig();
        }

        // Merge the new configuration with existing
        this.config = {
            ...this.config,
            ...config,
            colors: config.colors ? { ...this.config.colors, ...config.colors } : this.config.colors,
            assets: config.assets ? { ...this.config.assets, ...config.assets } : this.config.assets,
            featureToggles: config.featureToggles
                ? { ...this.config.featureToggles, ...config.featureToggles }
                : this.config.featureToggles,
        };

        this.logger.debug('Brand configuration updated dynamically', this.config);
    }

}

export const CoreBrandConfig = makeSingleton(CoreBrandConfigProvider);
