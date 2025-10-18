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
 * Brand configuration interface for white-labeling functionality.
 */
export interface BrandConfig {
    /** Unique identifier for the brand */
    brandId: string;
    /** Human-readable brand name */
    displayName: string;
    /** Optional description of the brand */
    description?: string;
    /** Preconfigured Moodle site URL */
    siteUrl?: string;
    /** Brand colors configuration */
    colors?: BrandColors;
    /** Brand assets configuration */
    assets?: BrandAssets;
    /** Feature toggle configuration */
    featureToggles?: FeatureToggles;
}

/**
 * Brand colors configuration for theming.
 */
export interface BrandColors {
    /** Primary brand color */
    primary: string;
    /** Secondary brand color */
    secondary?: string;
    /** Surface color (background) */
    surface?: string;
    /** Text color on primary background */
    onPrimary?: string;
    /** Text color on secondary background */
    onSecondary?: string;
    /** Text color on surface background */
    onSurface?: string;
}

/**
 * Brand assets configuration for logos and images.
 */
export interface BrandAssets {
    /** Logo asset path */
    logo?: string;
    /** Splash screen asset path */
    splash?: string;
    /** App icon asset path */
    appIcon?: string;
}

/**
 * Feature toggle configuration for brand-specific functionality.
 */
export interface FeatureToggles {
    /** Enable preconfigured site login */
    preconfiguredSite?: boolean;
    /** Enforce brand theme application */
    enforceBrandTheme?: boolean;
    /** Enable analytics tracking */
    enableAnalytics?: boolean;
    /** Enable user onboarding */
    enableOnboarding?: boolean;
    /** Enable dark mode support */
    darkMode?: boolean;
}

/**
 * Brand configuration validation result.
 */
export interface BrandConfigValidationResult {
    /** Whether the configuration is valid */
    valid: boolean;
    /** Validation errors if any */
    errors: string[];
    /** Warnings if any */
    warnings: string[];
}

/**
 * Brand configuration loading result.
 */
export interface BrandConfigLoadResult {
    /** The loaded configuration */
    config: BrandConfig | null;
    /** Whether the configuration was loaded successfully */
    success: boolean;
    /** Error message if loading failed */
    error?: string;
}
