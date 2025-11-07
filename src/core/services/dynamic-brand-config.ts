// (C) Copyright 2015 Moodle Pty Ltd.
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
import { CoreConfig } from '@services/config';
import { CoreFile } from '@services/file';
import { CoreWS } from '@services/ws';
import { makeSingleton } from '@singletons';

export interface DynamicBrandConfig {
    appId?: string;
    appName?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    siteUrl?: string;
    preconfiguredSite?: boolean;
}

export interface BrandAssets {
    logo?: { url: string; path: string };
    splash?: { url: string; path: string };
    icon?: { url: string; path: string };
}

export interface BrandConfigResponse {
    success: boolean;
    data: {
        organizationId: number;
        organizationName: string;
        brandConfig: DynamicBrandConfig;
        assets: BrandAssets;
    };
}

const STORAGE_KEY_SECRET = 'dynamic_branding_secret_key';
const STORAGE_KEY_CONFIG = 'dynamic_branding_config';
const STORAGE_KEY_ORG_ID = 'dynamic_branding_org_id';
const BRANDING_API_URL = 'http://localhost/moodleapp/branding-api/public/brand-config.php';

/**
 * Service to handle dynamic branding configuration based on secret key validation.
 */
@Injectable({ providedIn: 'root' })
export class CoreDynamicBrandConfigProvider {

    /**
     * Check if secret key has been set up.
     *
     * @returns Promise resolved with boolean indicating if secret key exists.
     */
    async isSecretKeyConfigured(): Promise<boolean> {
        try {
            const secretKey = await CoreConfig.get<string>(STORAGE_KEY_SECRET);

            return !!secretKey;
        } catch (error) {
            console.error('[CoreDynamicBrandConfig] Error checking secret key:', error);
            // If there's an error (e.g., DB not ready), assume not configured
            return false;
        }
    }

    /**
     * Alias for isSecretKeyConfigured for compatibility.
     *
     * @returns Promise resolved with boolean indicating if secret key exists.
     */
    async isConfigured(): Promise<boolean> {
        return this.isSecretKeyConfigured();
    }

    /**
     * Load cached branding and apply it.
     *
     * @returns Promise resolved when branding is loaded.
     */
    async loadCachedBranding(): Promise<void> {
        try {
            console.log('[CoreDynamicBrandConfig] Loading cached branding...');
            const config = await this.getCachedConfig();

            if (!config) {
                console.log('[CoreDynamicBrandConfig] No cached branding found');
                return;
            }

            console.log('[CoreDynamicBrandConfig] Applying cached branding:', config);
            // Apply branding to CSS variables
            await this.applyBranding(config);
            console.log('[CoreDynamicBrandConfig] Cached branding applied successfully');
        } catch (error) {
            console.error('[CoreDynamicBrandConfig] Error loading cached branding:', error);
            // Don't throw - just skip branding if there's an error
        }
    }

    /**
     * Apply branding configuration to the app.
     *
     * @param config Brand configuration.
     */
    protected async applyBranding(config: DynamicBrandConfig): Promise<void> {
        const root = document.documentElement;

        if (config.primaryColor) {
            root.style.setProperty('--ion-color-primary', config.primaryColor);
        }

        if (config.secondaryColor) {
            root.style.setProperty('--ion-color-secondary', config.secondaryColor);
        }

        if (config.accentColor) {
            root.style.setProperty('--ion-color-accent', config.accentColor);
        }

        // Store in window for other components to access
        (window as any).brandConfig = config;
    }

    /**
     * Validate secret key and fetch branding configuration from API.
     *
     * @param secretKey The secret key to validate.
     * @returns Promise resolved with brand configuration response.
     */
    async validateAndFetchBranding(secretKey: string): Promise<BrandConfigResponse> {
        try {
            const response = await fetch(BRANDING_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ secretKey }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Invalid secret key');
            }

            const data: BrandConfigResponse = await response.json();

            if (!data.success) {
                throw new Error('Failed to fetch branding configuration');
            }

            // Store the secret key and configuration
            await CoreConfig.set(STORAGE_KEY_SECRET, secretKey);
            await CoreConfig.set(STORAGE_KEY_CONFIG, JSON.stringify(data.data.brandConfig));
            await CoreConfig.set(STORAGE_KEY_ORG_ID, data.data.organizationId);

            // Download and store assets
            await this.downloadAndStoreAssets(data.data.assets);

            // Apply branding immediately
            await this.applyBranding(data.data.brandConfig);

            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Download and store brand assets locally.
     *
     * @param assets Brand assets URLs.
     */
    protected async downloadAndStoreAssets(assets: BrandAssets): Promise<void> {
        const downloadPromises: Promise<void>[] = [];

        if (assets.logo?.url) {
            downloadPromises.push(this.downloadAsset('logo', assets.logo.url));
        }

        if (assets.splash?.url) {
            downloadPromises.push(this.downloadAsset('splash', assets.splash.url));
        }

        if (assets.icon?.url) {
            downloadPromises.push(this.downloadAsset('icon', assets.icon.url));
        }

        await Promise.all(downloadPromises);
    }

    /**
     * Download a single asset and store it locally.
     *
     * @param assetType Type of asset (logo, splash, icon).
     * @param url Asset URL.
     */
    protected async downloadAsset(assetType: string, url: string): Promise<void> {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            // Convert blob to base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onloadend = () => {
                    if (reader.result && typeof reader.result === 'string') {
                        resolve(reader.result);
                    } else {
                        reject(new Error('Failed to convert blob to base64'));
                    }
                };
                reader.onerror = reject;
            });

            reader.readAsDataURL(blob);
            const base64Data = await base64Promise;

            // Store in config
            await CoreConfig.set(`dynamic_branding_asset_${assetType}`, base64Data);
        } catch (error) {
            console.error(`Failed to download ${assetType}:`, error);
        }
    }

    /**
     * Get cached brand configuration.
     *
     * @returns Promise resolved with cached configuration or null.
     */
    async getCachedConfig(): Promise<DynamicBrandConfig | null> {
        const configString = await CoreConfig.get<string>(STORAGE_KEY_CONFIG);

        if (!configString) {
            return null;
        }

        try {
            return JSON.parse(configString);
        } catch {
            return null;
        }
    }

    /**
     * Get cached asset by type.
     *
     * @param assetType Type of asset (logo, splash, icon).
     * @returns Promise resolved with base64 data URL or null.
     */
    async getCachedAsset(assetType: string): Promise<string | null> {
        return await CoreConfig.get<string>(`dynamic_branding_asset_${assetType}`);
    }

    /**
     * Clear all stored branding data.
     */
    async clearBrandingData(): Promise<void> {
        await CoreConfig.delete(STORAGE_KEY_SECRET);
        await CoreConfig.delete(STORAGE_KEY_CONFIG);
        await CoreConfig.delete(STORAGE_KEY_ORG_ID);
        await CoreConfig.delete('dynamic_branding_asset_logo');
        await CoreConfig.delete('dynamic_branding_asset_splash');
        await CoreConfig.delete('dynamic_branding_asset_icon');
    }

    /**
     * Get the organization ID.
     *
     * @returns Promise resolved with organization ID or null.
     */
    async getOrganizationId(): Promise<number | null> {
        return await CoreConfig.get<number>(STORAGE_KEY_ORG_ID);
    }
}

export const CoreDynamicBrandConfig = makeSingleton(CoreDynamicBrandConfigProvider);
