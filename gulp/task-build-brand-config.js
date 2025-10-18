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

const gulp = require('gulp');
const fs = require('fs');
const path = require('path');

/**
 * Build brand configuration task.
 * Copies brand-specific configuration to assets folder based on BRAND_ID environment variable.
 */
function buildBrandConfig() {
    return new Promise((resolve, reject) => {
        try {
            // Get brand ID from environment variable or use default
            const brandId = process.env.BRAND_ID || 'default';
            const brandConfigPath = path.join(__dirname, '..', 'branding', brandId, 'brand-config.json');
            const targetPath = path.join(__dirname, '..', 'src', 'assets', 'brand-config.json');

            console.log(`Building brand config for brand: ${brandId}`);
            console.log(`Source: ${brandConfigPath}`);
            console.log(`Target: ${targetPath}`);

            // Check if brand config file exists
            if (!fs.existsSync(brandConfigPath)) {
                console.warn(`Brand config not found: ${brandConfigPath}`);
                console.warn('Falling back to default brand configuration');

                // Use default brand config
                const defaultConfigPath = path.join(__dirname, '..', 'branding', 'default', 'brand-config.json');
                if (!fs.existsSync(defaultConfigPath)) {
                    throw new Error(`Default brand config not found: ${defaultConfigPath}`);
                }

                // Copy default config
                fs.copyFileSync(defaultConfigPath, targetPath);
                console.log('Default brand configuration copied successfully');
            } else {
                // Copy brand-specific config
                fs.copyFileSync(brandConfigPath, targetPath);
                console.log(`Brand configuration for '${brandId}' copied successfully`);
            }

            // Validate the copied configuration
            try {
                const configContent = fs.readFileSync(targetPath, 'utf8');
                const config = JSON.parse(configContent);

                // Basic validation
                if (!config.brandId) {
                    throw new Error('brandId is required');
                }
                if (!config.displayName) {
                    throw new Error('displayName is required');
                }

                console.log(`Brand configuration validated successfully for brand: ${config.brandId}`);
                resolve();
            } catch (validationError) {
                console.error('Brand configuration validation failed:', validationError.message);
                reject(validationError);
            }

        } catch (error) {
            console.error('Failed to build brand configuration:', error.message);
            reject(error);
        }
    });
}

/**
 * Clean brand configuration task.
 * Removes the brand-config.json file from assets.
 */
function cleanBrandConfig() {
    return new Promise((resolve) => {
        const targetPath = path.join(__dirname, '..', 'src', 'assets', 'brand-config.json');

        if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
            console.log('Brand configuration cleaned successfully');
        } else {
            console.log('No brand configuration to clean');
        }

        resolve();
    });
}

// Export tasks
module.exports = {
    buildBrandConfig,
    cleanBrandConfig
};
