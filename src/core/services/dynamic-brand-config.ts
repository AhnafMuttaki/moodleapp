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
import { CoreConfig, CoreConfigProvider } from '@services/config';
import { CoreFile } from '@services/file';
import { CoreWS } from '@services/ws';
import { CoreBrandConfig, CoreBrandConfigProvider } from '@services/brand-config';
import { CoreBrandTheme, CoreBrandThemeProvider } from '@services/brand-theme';
import { makeSingleton } from '@singletons';
import { BrandConfig } from '@/types/brand-config';

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
        secretKeyId: number;
        adminUsername: string;
        brandConfig: DynamicBrandConfig;
        assets: BrandAssets;
    };
}

const STORAGE_KEY_SECRET = 'dynamic_branding_secret_key';
const STORAGE_KEY_CONFIG = 'dynamic_branding_config';
const STORAGE_KEY_SECRET_KEY_ID = 'dynamic_branding_secret_key_id';
const BRANDING_API_URL = 'http://10.112.11.39/moodleapp/moodleapp-branding-api/public/brand-config.php';

/**
 * Service to handle dynamic branding configuration based on secret key validation.
 */
@Injectable({ providedIn: 'root' })
export class CoreDynamicBrandConfigProvider {

    // Helper methods to work around TypeScript singleton typing issues
    private get config(): CoreConfigProvider {
        return CoreConfig as unknown as CoreConfigProvider;
    }

    private get brandConfig(): CoreBrandConfigProvider {
        return CoreBrandConfig as unknown as CoreBrandConfigProvider;
    }

    private get brandTheme(): CoreBrandThemeProvider {
        return CoreBrandTheme as unknown as CoreBrandThemeProvider;
    }

    /**
     * Check if secret key has been set up.
     *
     * @returns Promise resolved with boolean indicating if secret key exists.
     */
    async isSecretKeyConfigured(): Promise<boolean> {
        try {
            const secretKey = await this.config.get<string>(STORAGE_KEY_SECRET);

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

            // Update CoreBrandConfig with cached branding
            const logoData = await this.getCachedAsset('logo');
            const splashData = await this.getCachedAsset('splash');
            const iconData = await this.getCachedAsset('icon');

            console.log('[CoreDynamicBrandConfig] Cached assets:', {
                hasLogo: !!logoData,
                hasSplash: !!splashData,
                hasIcon: !!iconData,
            });

            const brandConfigUpdate: Partial<BrandConfig> = {
                brandId: 'dynamic',
                displayName: config.appName || 'Moodle Mobile',
                featureToggles: {
                    enforceBrandTheme: true,
                    preconfiguredSite: config.preconfiguredSite || false,
                },
            };

            // Only include siteUrl if it exists
            if (config.siteUrl) {
                brandConfigUpdate.siteUrl = config.siteUrl;
            }

            // Only include colors if primary color exists
            if (config.primaryColor) {
                brandConfigUpdate.colors = {
                    primary: config.primaryColor,
                };
                // Add secondary color if it exists
                if (config.secondaryColor) {
                    brandConfigUpdate.colors.secondary = config.secondaryColor;
                }
            }

            // Only include assets if at least one exists
            if (logoData || splashData || iconData) {
                brandConfigUpdate.assets = {};
                if (logoData) brandConfigUpdate.assets.logo = logoData;
                if (splashData) brandConfigUpdate.assets.splash = splashData;
                if (iconData) brandConfigUpdate.assets.appIcon = iconData;
            }

            this.brandConfig.updateConfig(brandConfigUpdate);

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
        console.log('[CoreDynamicBrandConfig] Applying branding:', config);

        // Create brand colors object
        const brandColors: any = {};

        if (config.primaryColor) {
            brandColors.primary = config.primaryColor;
            brandColors.onPrimary = '#ffffff'; // Default contrast color
        }

        if (config.secondaryColor) {
            brandColors.secondary = config.secondaryColor;
            brandColors.onSecondary = '#ffffff'; // Default contrast color
        }

        // Always set surface colors
        brandColors.surface = '#ffffff';
        brandColors.onSurface = config.primaryColor || '#282828';

        // Use CoreBrandTheme to apply colors properly (same as static branding)
        if (Object.keys(brandColors).length > 0) {
            await this.brandTheme.applyBrandTheme(brandColors);
            console.log('[CoreDynamicBrandConfig] Brand colors applied via CoreBrandTheme');
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
            await this.config.set(STORAGE_KEY_SECRET, secretKey);
            await this.config.set(STORAGE_KEY_CONFIG, JSON.stringify(data.data.brandConfig));
            await this.config.set(STORAGE_KEY_SECRET_KEY_ID, data.data.secretKeyId);

            // Download and store assets
            await this.downloadAndStoreAssets(data.data.assets);

            // Apply branding immediately
            await this.applyBranding(data.data.brandConfig);

            // Update CoreBrandConfig with dynamic branding
            await this.updateCoreBrandConfig(data.data.brandConfig, data.data.assets);

            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update CoreBrandConfig with dynamic branding data.
     *
     * @param config Brand configuration.
     * @param assets Brand assets.
     */
    protected async updateCoreBrandConfig(config: DynamicBrandConfig, assets: BrandAssets): Promise<void> {
        try {
            console.log('[CoreDynamicBrandConfig] Updating CoreBrandConfig with dynamic branding...');

            // Get the cached asset data URLs
            const logoData = await this.getCachedAsset('logo');
            const splashData = await this.getCachedAsset('splash');
            const iconData = await this.getCachedAsset('icon');

            // Create a brand config object compatible with CoreBrandConfig
            const brandConfigUpdate: Partial<BrandConfig> = {
                brandId: 'dynamic',
                displayName: config.appName || 'Moodle Mobile',
                description: 'Dynamically configured branding',
                featureToggles: {
                    preconfiguredSite: config.preconfiguredSite || false,
                    enforceBrandTheme: true, // Always enforce for dynamic branding
                    enableAnalytics: false,
                    enableOnboarding: true,
                    darkMode: true,
                },
            };

            // Only include siteUrl if it exists
            if (config.siteUrl) {
                brandConfigUpdate.siteUrl = config.siteUrl;
            }

            // Only include colors if primary color exists
            if (config.primaryColor) {
                brandConfigUpdate.colors = {
                    primary: config.primaryColor,
                    surface: '#ffffff',
                    onPrimary: '#ffffff',
                    onSecondary: '#ffffff',
                    onSurface: config.primaryColor || '#282828',
                };
                // Add secondary color if it exists
                if (config.secondaryColor) {
                    brandConfigUpdate.colors.secondary = config.secondaryColor;
                }
            }

            // Only include assets if at least one exists
            if (logoData || splashData || iconData) {
                brandConfigUpdate.assets = {};
                if (logoData) brandConfigUpdate.assets.logo = logoData;
                if (splashData) brandConfigUpdate.assets.splash = splashData;
                if (iconData) brandConfigUpdate.assets.appIcon = iconData;
            }

            // Update CoreBrandConfig
            this.brandConfig.updateConfig(brandConfigUpdate);

            console.log('[CoreDynamicBrandConfig] CoreBrandConfig updated successfully');
        } catch (error) {
            console.error('[CoreDynamicBrandConfig] Failed to update CoreBrandConfig:', error);
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
            await this.config.set(`dynamic_branding_asset_${assetType}`, base64Data);
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
        const configString = await this.config.get<string>(STORAGE_KEY_CONFIG);

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
        return await this.config.get<string>(`dynamic_branding_asset_${assetType}`);
    }

    /**
     * Clear all stored branding data.
     */
    async clearBrandingData(): Promise<void> {
        await this.config.delete(STORAGE_KEY_SECRET);
        await this.config.delete(STORAGE_KEY_CONFIG);
        await this.config.delete(STORAGE_KEY_SECRET_KEY_ID);
        await this.config.delete('dynamic_branding_asset_logo');
        await this.config.delete('dynamic_branding_asset_splash');
        await this.config.delete('dynamic_branding_asset_icon');
    }

    /**
     * Get the secret key ID.
     *
     * @returns Promise resolved with secret key ID or null.
     */
    async getSecretKeyId(): Promise<number | null> {
        return await this.config.get<number>(STORAGE_KEY_SECRET_KEY_ID);
    }
}

export const CoreDynamicBrandConfig = makeSingleton(CoreDynamicBrandConfigProvider);
