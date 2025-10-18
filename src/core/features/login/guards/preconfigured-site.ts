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

import { CanActivateFn } from '@angular/router';
import { CoreBrandConfig } from '@services/brand-config';
import { CoreLogger } from '@singletons/logger';
import { Router } from '@singletons';

/**
 * Guard to check if preconfigured site is enabled and redirect accordingly.
 *
 * This guard checks if a preconfigured site is enabled in the brand configuration.
 * If enabled and a siteUrl is configured, it redirects to the login credentials page.
 * If disabled or no siteUrl is configured, it allows the normal flow to continue.
 *
 * @returns True if normal flow should continue, redirect route if preconfigured site should be used
 */
export const preconfiguredSiteGuard: CanActivateFn = async () => {
    const logger = CoreLogger.getInstance('PreconfiguredSiteGuard');

    try {
        // Wait for brand configuration to be ready
        await CoreBrandConfig.ready();

        // Check if preconfigured site is enabled
        const isEnabled = await CoreBrandConfig.isPreconfiguredSiteEnabled();

        if (!isEnabled) {
            logger.debug('Preconfigured site is disabled, allowing normal flow');
            return true;
        }

        // Get the preconfigured site URL
        const siteUrl = await CoreBrandConfig.getSiteUrl();

        if (!siteUrl) {
            logger.warn('Preconfigured site is enabled but no siteUrl is configured, allowing normal flow');
            return true;
        }

        // Redirect to login credentials page with the preconfigured site URL
        logger.debug('Preconfigured site is enabled, redirecting to login credentials', { siteUrl });

        const route = Router.parseUrl('/login/credentials');
        route.queryParams = { siteUrl };

        return route;

    } catch (error) {
        logger.error('Error in preconfigured site guard, allowing normal flow', error);
        return true;
    }
};
