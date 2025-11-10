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

import { CoreAutoLogout } from '@features/autologout/services/autologout';
import { CoreBrandConfig } from '@services/brand-config';
import { CoreBrandTheme } from '@services/brand-theme';
import { CoreDynamicBrandConfig } from '@services/dynamic-brand-config';
import { CoreConfig } from '@services/config';
import { CoreFilepool } from '@services/filepool';
import { CoreLang } from '@services/lang';
import { CoreLocalNotifications } from '@services/local-notifications';
import { CoreNetwork } from '@services/network';
import { CoreSites } from '@services/sites';
import { CoreUpdateManager } from '@services/update-manager';
import { CoreTime } from '@singletons/time';

/**
 * Initializes various core components asynchronously.
 */
export default async function (): Promise<void> {
    await Promise.all([
        CoreBrandConfig.initialize(),
        CoreConfig.initialize(),
        CoreFilepool.initialize(),
        CoreSites.initialize(),
        CoreLang.initialize(),
        CoreLocalNotifications.initialize(),
        CoreNetwork.initialize(),
        CoreUpdateManager.initialize(),
        CoreTime.initialize(),
        CoreAutoLogout.initialize(),
    ]);

    // Load cached branding if secret key is configured (non-blocking)
    try {
        console.log('[InitializeServices] Checking for cached branding...');
        const isConfigured = await CoreDynamicBrandConfig.isConfigured();
        console.log('[InitializeServices] Is secret key configured:', isConfigured);

        if (isConfigured) {
            console.log('[InitializeServices] Loading cached branding...');
            await CoreDynamicBrandConfig.loadCachedBranding();
            console.log('[InitializeServices] Cached branding loaded');

            // Initialize brand theme to ensure colors are applied
            console.log('[InitializeServices] Initializing brand theme...');
            await CoreBrandTheme.initialize();
            console.log('[InitializeServices] Brand theme initialized');
        } else {
            console.log('[InitializeServices] No cached branding, user needs to configure secret key');
        }
    } catch (error) {
        console.error('[InitializeServices] Error loading branding, continuing anyway:', error);
        // Don't block initialization if branding fails
    }
}
