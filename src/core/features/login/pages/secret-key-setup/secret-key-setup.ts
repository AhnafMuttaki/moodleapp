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

import { Component, OnInit } from '@angular/core';
import { CoreDynamicBrandConfig } from '@services/dynamic-brand-config';
import { CoreDomUtils } from '@services/utils/dom';
import { CoreNavigator } from '@services/navigator';
import { CoreSharedModule } from '@/core/shared.module';

/**
 * Page to enter secret key for dynamic branding configuration.
 */
@Component({
    selector: 'page-secret-key-setup',
    templateUrl: 'secret-key-setup.html',
    styleUrls: ['secret-key-setup.scss'],
    imports: [CoreSharedModule],
})
export default class CoreLoginSecretKeySetupPage implements OnInit {

    secretKey = '';
    loading = false;

    /**
     * @inheritdoc
     */
    ngOnInit(): void {
        console.log('[SecretKeySetupPage] Initializing...');
        // Check if already configured
        this.checkExistingConfig();
    }

    /**
     * Check if secret key is already configured and redirect if so.
     */
    protected async checkExistingConfig(): Promise<void> {
        console.log('[SecretKeySetupPage] Checking existing config...');
        const isConfigured = await CoreDynamicBrandConfig.isSecretKeyConfigured();

        console.log('[SecretKeySetupPage] Is configured:', isConfigured);

        if (isConfigured) {
            console.log('[SecretKeySetupPage] Already configured, redirecting to sites');
            // Already configured, redirect to login
            await CoreNavigator.navigateToSitePath('/login/sites');
        } else {
            console.log('[SecretKeySetupPage] Not configured, showing setup page');
        }
    }

    /**
     * Submit secret key for validation.
     */
    async submit(): Promise<void> {
        console.log('[SecretKeySetupPage] Submitting secret key...');

        if (!this.secretKey.trim()) {
            await CoreDomUtils.showErrorModal('Secret key is required');

            return;
        }

        this.loading = true;

        try {
            console.log('[SecretKeySetupPage] Validating secret key with API...');
            const response = await CoreDynamicBrandConfig.validateAndFetchBranding(this.secretKey.trim());

            console.log('[SecretKeySetupPage] API response:', response);

            if (response.success) {
                console.log('[SecretKeySetupPage] Branding configured successfully!');
                await CoreDomUtils.showToast('Branding configured successfully!');

                // Apply the branding immediately
                await this.applyBranding(response.data.brandConfig);

                // Navigate to sites page
                console.log('[SecretKeySetupPage] Navigating to sites page...');
                await CoreNavigator.navigateToSitePath('/login/sites');
            } else {
                console.error('[SecretKeySetupPage] Failed to configure branding');
                await CoreDomUtils.showErrorModal('Failed to configure branding');
            }
        } catch (error) {
            console.error('[SecretKeySetupPage] Error:', error);
            await CoreDomUtils.showErrorModal(error);
        } finally {
            this.loading = false;
        }
    }

    /**
     * Apply branding configuration.
     *
     * @param config Brand configuration.
     */
    protected async applyBranding(config: { primaryColor?: string; secondaryColor?: string; accentColor?: string }): Promise<void> {
        const root = document.documentElement;

        if (config.primaryColor) {
            root.style.setProperty('--primary', config.primaryColor);
            root.style.setProperty('--brand-color', config.primaryColor);
        }

        if (config.secondaryColor) {
            root.style.setProperty('--secondary', config.secondaryColor);
        }

        if (config.accentColor) {
            root.style.setProperty('--accent', config.accentColor);
        }
    }
}
