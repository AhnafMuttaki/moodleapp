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

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { CoreDynamicBrandConfig } from '@services/dynamic-brand-config';

/**
 * Guard to check if secret key has been configured.
 * If not configured, redirects to secret key setup page.
 */
export const secretKeyCheckGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);

    // Allow access to secret-key-setup page without checking
    const currentPath = route.routeConfig?.path || '';
    if (currentPath === 'secret-key-setup' || router.url.includes('secret-key-setup')) {
        console.log('[SecretKeyCheckGuard] Allowing access to secret-key-setup page');
        return true;
    }

    try {
        console.log('[SecretKeyCheckGuard] Checking if secret key is configured...');

        const isConfigured = await CoreDynamicBrandConfig.isSecretKeyConfigured();

        console.log('[SecretKeyCheckGuard] Is configured:', isConfigured);

        if (!isConfigured) {
            console.log('[SecretKeyCheckGuard] Not configured, redirecting to secret-key-setup');
            router.navigate(['/login/secret-key-setup']);

            return false;
        }

        console.log('[SecretKeyCheckGuard] Configured, allowing navigation');
        return true;
    } catch (error) {
        console.error('[SecretKeyCheckGuard] Error checking configuration:', error);
        // On error, redirect to setup page to be safe
        router.navigate(['/login/secret-key-setup']);
        return false;
    }
};
