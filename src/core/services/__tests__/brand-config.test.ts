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

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CoreBrandConfigProvider } from '../brand-config';
import { BrandConfig, BrandConfigValidationResult } from '@/types/brand-config';

// Mock the fetch function
global.fetch = jest.fn();

describe('CoreBrandConfigProvider', () => {
    let service: CoreBrandConfigProvider;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CoreBrandConfigProvider]
        });
        service = TestBed.inject(CoreBrandConfigProvider);

        // Reset fetch mock
        (global.fetch as jest.Mock).mockClear();
    });

    describe('validateConfig', () => {
        it('should validate a correct configuration', () => {
            const config: BrandConfig = {
                brandId: 'test-brand',
                displayName: 'Test Brand',
                siteUrl: 'https://test.example.com',
                featureToggles: {
                    preconfiguredSite: true,
                    enforceBrandTheme: false
                }
            };

            const result = service.validateConfig(config);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject configuration without brandId', () => {
            const config = {
                displayName: 'Test Brand'
            };

            const result = service.validateConfig(config);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('brandId is required and must be a string');
        });

        it('should reject configuration without displayName', () => {
            const config = {
                brandId: 'test-brand'
            };

            const result = service.validateConfig(config);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('displayName is required and must be a string');
        });

        it('should reject invalid siteUrl', () => {
            const config = {
                brandId: 'test-brand',
                displayName: 'Test Brand',
                siteUrl: 'invalid-url'
            };

            const result = service.validateConfig(config);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('siteUrl must be a valid URL');
        });

        it('should accept valid siteUrl', () => {
            const config = {
                brandId: 'test-brand',
                displayName: 'Test Brand',
                siteUrl: 'https://test.example.com'
            };

            const result = service.validateConfig(config);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should warn about unknown feature toggles', () => {
            const config = {
                brandId: 'test-brand',
                displayName: 'Test Brand',
                featureToggles: {
                    preconfiguredSite: true,
                    unknownToggle: false
                }
            };

            const result = service.validateConfig(config);

            expect(result.valid).toBe(true);
            expect(result.warnings).toContain('Unknown feature toggle: unknownToggle');
        });

        it('should reject non-boolean feature toggles', () => {
            const config = {
                brandId: 'test-brand',
                displayName: 'Test Brand',
                featureToggles: {
                    preconfiguredSite: 'true'
                }
            };

            const result = service.validateConfig(config);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Feature toggle preconfiguredSite must be a boolean');
        });
    });

    describe('getSiteUrl', () => {
        it('should return siteUrl when configured', async () => {
            const mockConfig: BrandConfig = {
                brandId: 'test-brand',
                displayName: 'Test Brand',
                siteUrl: 'https://test.example.com'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockConfig)
            });

            await service.initialize();
            const siteUrl = await service.getSiteUrl();

            expect(siteUrl).toBe('https://test.example.com');
        });

        it('should return null when siteUrl not configured', async () => {
            const mockConfig: BrandConfig = {
                brandId: 'test-brand',
                displayName: 'Test Brand'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockConfig)
            });

            await service.initialize();
            const siteUrl = await service.getSiteUrl();

            expect(siteUrl).toBeNull();
        });
    });

    describe('isPreconfiguredSiteEnabled', () => {
        it('should return true when preconfiguredSite is enabled', async () => {
            const mockConfig: BrandConfig = {
                brandId: 'test-brand',
                displayName: 'Test Brand',
                featureToggles: {
                    preconfiguredSite: true
                }
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockConfig)
            });

            await service.initialize();
            const enabled = await service.isPreconfiguredSiteEnabled();

            expect(enabled).toBe(true);
        });

        it('should return false when preconfiguredSite is disabled', async () => {
            const mockConfig: BrandConfig = {
                brandId: 'test-brand',
                displayName: 'Test Brand',
                featureToggles: {
                    preconfiguredSite: false
                }
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockConfig)
            });

            await service.initialize();
            const enabled = await service.isPreconfiguredSiteEnabled();

            expect(enabled).toBe(false);
        });

        it('should return false when featureToggles not configured', async () => {
            const mockConfig: BrandConfig = {
                brandId: 'test-brand',
                displayName: 'Test Brand'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockConfig)
            });

            await service.initialize();
            const enabled = await service.isPreconfiguredSiteEnabled();

            expect(enabled).toBe(false);
        });
    });

    describe('fallback behavior', () => {
        it('should use default config when loading fails', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await service.initialize();
            const config = await service.getBrandConfig();

            expect(config).toBeDefined();
            expect(config?.brandId).toBe('default');
            expect(config?.siteUrl).toBe('http://localhost:8082');
        });

        it('should use default config when validation fails', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ brandId: 'invalid' }) // Missing required fields
            });

            await service.initialize();
            const config = await service.getBrandConfig();

            expect(config).toBeDefined();
            expect(config?.brandId).toBe('default');
        });
    });

    describe('ready', () => {
        it('should resolve when initialization is complete', async () => {
            const mockConfig: BrandConfig = {
                brandId: 'test',
                displayName: 'Test'
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockConfig)
            });

            await service.initialize();
            await expect(service.ready()).resolves.toBeUndefined();
        });
    });

    describe('resetToDefault', () => {
        it('should reset configuration to default values', () => {
            service.resetToDefault();
            const config = (service as any).config;

            expect(config.brandId).toBe('default');
            expect(config.displayName).toBe('Moodle Mobile');
            expect(config.siteUrl).toBe('http://localhost:8082');
            expect(config.featureToggles?.preconfiguredSite).toBe(true);
        });
    });
});
