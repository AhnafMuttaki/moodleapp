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
import { CanActivate, Router } from '@angular/router';
import { CoreBrandThemeProvider } from '@services/brand-theme';
import { CoreBrandConfigProvider } from '@services/brand-config';
import { CoreLogger } from '@singletons/logger';

/**
 * Guard to enforce brand theme application on app startup.
 */
@Injectable({ providedIn: 'root' })
export class CoreBrandThemeGuard implements CanActivate {

    protected logger = CoreLogger.getInstance('CoreBrandThemeGuard');

    constructor(
        protected brandTheme: CoreBrandThemeProvider,
        protected brandConfig: CoreBrandConfigProvider,
        protected router: Router
    ) {}

    /**
     * @inheritdoc
     */
    async canActivate(): Promise<boolean> {
        try {
            this.logger.debug('Brand theme guard activated');

            // Initialize brand theme service
            await this.brandTheme.initialize();

            // Check if theme was applied successfully
            const themeStatus = await this.brandTheme.getThemeStatus();

            if (themeStatus.enforced && !themeStatus.applied) {
                this.logger.warn('Brand theme enforcement enabled but theme not applied');
            }

            this.logger.debug('Brand theme guard completed successfully');
            return true;

        } catch (error) {
            this.logger.error('Brand theme guard failed', error);
            // Don't block navigation on theme errors
            return true;
        }
    }

}
