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
    FeatureToggles,
    BrandConfigValidationResult,
    BrandConfigLoadResult
} from '@/types/brand-config';

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
     * Reset configuration to default.
     */
    resetToDefault(): void {
        this.config = this.getDefaultConfig();
        this.logger.debug('Brand configuration reset to default');
    }

}

export const CoreBrandConfig = makeSingleton(CoreBrandConfigProvider);
