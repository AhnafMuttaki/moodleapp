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

import { test, expect } from '@playwright/test';

test.describe('Preconfigured Site Login', () => {
    test.beforeEach(async ({ page }) => {
        // Clear any existing storage
        await page.context().clearCookies();
        await page.context().clearPermissions();
    });

    test('should skip site entry with preconfigured site enabled', async ({ page }) => {
        // Mock brand config with preconfigured site
        await page.route('**/assets/brand-config.json', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    brandId: 'test-brand',
                    displayName: 'Test Brand',
                    siteUrl: 'http://localhost:8082',
                    featureToggles: {
                        preconfiguredSite: true
                    }
                })
            });
        });

        // Navigate to app root
        await page.goto('/');

        // Should redirect to login credentials page with preconfigured site URL
        await expect(page).toHaveURL('/login/credentials?siteUrl=http://localhost:8082');

        // Verify the site URL is pre-filled in the form
        const siteUrlInput = page.locator('input[name="siteUrl"]');
        await expect(siteUrlInput).toHaveValue('http://localhost:8082');
    });

    test('should show site entry without preconfigured site', async ({ page }) => {
        // Mock brand config without preconfigured site
        await page.route('**/assets/brand-config.json', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    brandId: 'test-brand',
                    displayName: 'Test Brand',
                    featureToggles: {
                        preconfiguredSite: false
                    }
                })
            });
        });

        // Navigate to app root
        await page.goto('/');

        // Should redirect to site entry page
        await expect(page).toHaveURL('/login/site');

        // Verify site entry form is visible
        const siteUrlInput = page.locator('input[name="siteUrl"]');
        await expect(siteUrlInput).toBeVisible();
    });

    test('should show site entry when preconfigured site is enabled but no siteUrl', async ({ page }) => {
        // Mock brand config with preconfigured site enabled but no siteUrl
        await page.route('**/assets/brand-config.json', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    brandId: 'test-brand',
                    displayName: 'Test Brand',
                    featureToggles: {
                        preconfiguredSite: true
                    }
                })
            });
        });

        // Navigate to app root
        await page.goto('/');

        // Should redirect to site entry page since no siteUrl is configured
        await expect(page).toHaveURL('/login/site');

        // Verify site entry form is visible
        const siteUrlInput = page.locator('input[name="siteUrl"]');
        await expect(siteUrlInput).toBeVisible();
    });

    test('should handle brand config loading failure gracefully', async ({ page }) => {
        // Mock brand config loading failure
        await page.route('**/assets/brand-config.json', route => {
            route.fulfill({
                status: 404,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Not found' })
            });
        });

        // Navigate to app root
        await page.goto('/');

        // Should redirect to site entry page as fallback
        await expect(page).toHaveURL('/login/site');

        // Verify site entry form is visible
        const siteUrlInput = page.locator('input[name="siteUrl"]');
        await expect(siteUrlInput).toBeVisible();
    });

    test('should handle invalid brand config gracefully', async ({ page }) => {
        // Mock invalid brand config
        await page.route('**/assets/brand-config.json', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    // Missing required fields
                    invalidConfig: true
                })
            });
        });

        // Navigate to app root
        await page.goto('/');

        // Should redirect to site entry page as fallback
        await expect(page).toHaveURL('/login/site');

        // Verify site entry form is visible
        const siteUrlInput = page.locator('input[name="siteUrl"]');
        await expect(siteUrlInput).toBeVisible();
    });

    test('should navigate to login credentials with preconfigured site', async ({ page }) => {
        // Mock brand config with preconfigured site
        await page.route('**/assets/brand-config.json', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    brandId: 'test-brand',
                    displayName: 'Test Brand',
                    siteUrl: 'http://localhost:8082',
                    featureToggles: {
                        preconfiguredSite: true
                    }
                })
            });
        });

        // Navigate to site entry page directly
        await page.goto('/login/site');

        // Should redirect to login credentials page with preconfigured site URL
        await expect(page).toHaveURL('/login/credentials?siteUrl=http://localhost:8082');

        // Verify the site URL is pre-filled in the form
        const siteUrlInput = page.locator('input[name="siteUrl"]');
        await expect(siteUrlInput).toHaveValue('http://localhost:8082');
    });

    test('should allow normal site entry when preconfigured site is disabled', async ({ page }) => {
        // Mock brand config without preconfigured site
        await page.route('**/assets/brand-config.json', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    brandId: 'test-brand',
                    displayName: 'Test Brand',
                    featureToggles: {
                        preconfiguredSite: false
                    }
                })
            });
        });

        // Navigate to site entry page directly
        await page.goto('/login/site');

        // Should stay on site entry page
        await expect(page).toHaveURL('/login/site');

        // Verify site entry form is visible and functional
        const siteUrlInput = page.locator('input[name="siteUrl"]');
        await expect(siteUrlInput).toBeVisible();
        await expect(siteUrlInput).toHaveValue('');

        // Test entering a site URL
        await siteUrlInput.fill('https://test.example.com');
        await expect(siteUrlInput).toHaveValue('https://test.example.com');
    });
});
