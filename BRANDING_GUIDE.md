# Moodle Mobile App - Branding Guide

## Overview

This guide explains how to create custom branded versions of the Moodle Mobile App. The app supports white-labeling with custom logos, colors, and configurations.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Brand Configuration](#brand-configuration)
3. [Asset Requirements](#asset-requirements)
4. [Build Process](#build-process)
5. [Development Workflow](#development-workflow)
6. [Android Build](#android-build)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Android Studio (for Android builds)
- Android SDK (API 34+)
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/YourOrg/moodleapp.git
cd moodleapp

# Install dependencies
npm install

# Build cordova plugin
cd cordova-plugin-moodleapp
npm install
npm run prod
cd ..
```

---

## Brand Configuration

### Creating a New Brand

1. **Create Brand Directory**

```bash
mkdir branding/your-brand-name
cd branding/your-brand-name
```

2. **Create brand-config.json**

Create a `brand-config.json` file with the following structure:

```json
{
    "brandId": "your-brand-name",
    "displayName": "Your Organization Name",
    "siteUrl": "https://your-moodle-site.com",
    "colors": {
        "primary": "#4992C1",
        "secondary": "#111E40",
        "surface": "#ffffff",
        "onPrimary": "#ffffff",
        "onSecondary": "#ffffff",
        "onSurface": "#4992C1"
    },
    "assets": {
        "logo": "assets/brands/your-brand-name/logo.png",
        "splash": "assets/brands/your-brand-name/splash.png",
        "appIcon": "assets/brands/your-brand-name/icon.png"
    },
    "featureToggles": {
        "preconfiguredSite": true,
        "enforceBrandTheme": true
    }
}
```

### Configuration Options

#### Required Fields

- **brandId**: Unique identifier for your brand (lowercase, no spaces)
- **displayName**: Full name of your organization
- **siteUrl**: Default Moodle site URL (used when `preconfiguredSite: true`)

#### Color Scheme

Define your brand colors using hex codes:

- **primary**: Main brand color (buttons, headers)
- **secondary**: Secondary brand color (accents)
- **surface**: Background color
- **onPrimary**: Text color on primary background
- **onSecondary**: Text color on secondary background
- **onSurface**: Text color on surface background

#### Feature Toggles

- **preconfiguredSite**: If `true`, app will connect to `siteUrl` automatically
- **enforceBrandTheme**: If `true`, applies brand colors throughout the app

---

## Asset Requirements

### Required Images

Place these files in `branding/your-brand-name/`:

1. **logo.png** - Main logo (recommended: 512x512px, transparent background)
2. **splash.png** - Splash screen image (recommended: 1024x1024px)
3. **icon.png** - App icon (recommended: 1024x1024px)

### Image Specifications

| Asset | Size | Format | Background | Usage |
|-------|------|--------|------------|-------|
| logo.png | 512x512px | PNG | Transparent | Login screen, headers |
| splash.png | 1024x1024px | PNG | Solid/Transparent | Splash screen |
| icon.png | 1024x1024px | PNG | Solid | App launcher icon |

### Example: BS23 Brand

```
branding/bs23/
├── brand-config.json
├── logo.png          (512x512px)
├── splash.png        (1024x1024px)
└── icon.png          (512x512px)
```

---

## Build Process

### Build Workflow

The build process uses Gulp tasks to generate brand-specific files from your branding configuration.

```
branding/your-brand/          →  gulp  →  src/assets/
├── brand-config.json                    ├── brand-config.json
├── logo.png                             └── brands/your-brand/
├── splash.png                               ├── logo.png
└── icon.png                                 ├── splash.png
                                             └── icon.png
                              →  gulp  →  src/theme/
                                          ├── brand.variables.scss
                                          ├── brand.custom-properties.scss
                                          └── components/brand-theme.scss
```

### Environment Variable

Set the `BRAND_ID` environment variable to specify which brand to build:

```bash
export BRAND_ID=your-brand-name
```

Or use inline for single commands:

```bash
BRAND_ID=your-brand-name npm start
```

### Build Commands

#### Development Server

```bash
# Start development server with your brand
BRAND_ID=your-brand-name npm start

# The app will be available at https://localhost:8100
```

#### Production Web Build

```bash
# Build production web assets
BRAND_ID=your-brand-name npm run build:prod
```

#### Manual Brand Generation

```bash
# Generate brand files only (without full build)
BRAND_ID=your-brand-name npm run build:brand-config

# Watch for brand config changes
npm run watch
```

---

## Development Workflow

### Step-by-Step Development

1. **Clean Previous Builds** (if needed)

```bash
# Remove build artifacts
rm -rf .angular www node_modules package-lock.json

# Remove generated brand files
rm -f src/assets/brand-config.json
rm -f src/theme/brand.*.scss
rm -f src/theme/components/brand-theme.scss

# Reinstall dependencies
npm install

# Build cordova plugin
cd cordova-plugin-moodleapp && npm install && npm run prod && cd ..
```

2. **Create/Update Brand Configuration**

```bash
# Edit your brand config
nano branding/your-brand-name/brand-config.json

# Update assets in the same directory
cp your-logo.png branding/your-brand-name/logo.png
cp your-splash.png branding/your-brand-name/splash.png
cp your-icon.png branding/your-brand-name/icon.png
```

3. **Build and Test**

```bash
# Generate brand files and start dev server
BRAND_ID=your-brand-name npm start

# App runs at https://localhost:8100
# Changes to source files auto-reload
# Changes to branding require restart
```

4. **Verify Branding**

Check that the following are applied:
- ✅ Logo appears on login screen
- ✅ Brand colors are applied to UI elements
- ✅ App name shows your `displayName`
- ✅ Default site URL is set (if `preconfiguredSite: true`)

---

## Android Build

### Prerequisites

1. **Android Studio** installed
2. **Android SDK** with:
   - Build Tools 34.0.0
   - Android Platform 35 (API Level 35)
3. **Environment variables** set:
   ```bash
   export ANDROID_SDK_ROOT=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
   ```

### Build Steps

#### 1. Production Web Build

```bash
# Build web assets with your brand
BRAND_ID=your-brand-name npm run build:prod
```

#### 2. Build Cordova Plugin

```bash
cd cordova-plugin-moodleapp
npm run prod
cd ..
```

#### 3. Sync to Android Platform

```bash
# Copy web assets to Android project
npx cap sync android
```

#### 4. Fix QR Scanner Plugin (if needed)

```bash
# Fix AndroidX compatibility issue
sed -i 's/import android\.support\.v4\.app\.ActivityCompat;/import androidx.core.app.ActivityCompat;/g' \
    node_modules/@moodlehq/cordova-plugin-qrscanner/src/android/QRScanner.java

sed -i 's/import android\.support\.v4\.app\.ActivityCompat;/import androidx.core.app.ActivityCompat;/g' \
    plugins/@moodlehq/cordova-plugin-qrscanner/src/android/QRScanner.java

# Sync again to apply fix
npx cap sync android
```

#### 5. Build and Run on Emulator

```bash
# Build APK and deploy to running emulator
npx cap run android

# Or specify target emulator
npx cap run android --target="YourEmulatorName"

# List available emulators
emulator -list-avds
```

#### 6. Build Release APK

```bash
# Navigate to Android directory
cd android

# Build release APK
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Signing Release APK

1. **Create Keystore**

```bash
keytool -genkey -v -keystore your-brand-release-key.keystore \
    -alias your-brand-key -keyalg RSA -keysize 2048 -validity 10000
```

2. **Sign APK**

```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
    -keystore your-brand-release-key.keystore \
    app-release-unsigned.apk your-brand-key
```

3. **Align APK**

```bash
zipalign -v 4 app-release-unsigned.apk your-brand-app.apk
```

---

## Troubleshooting

### Common Issues

#### 1. Logo Not Showing

**Problem**: Old logo is cached

**Solution**:
```bash
# Clean all caches
rm -rf .angular www android/app/build
rm -f src/assets/brand-config.json
rm -rf src/assets/brands/your-brand-name/*

# Rebuild
BRAND_ID=your-brand-name npm run build:brand-config
BRAND_ID=your-brand-name npm start
```

#### 2. Android Build Fails - ActivityCompat Error

**Problem**: QR Scanner plugin uses old Android Support library

**Solution**:
```bash
# Fix import statements
sed -i 's/import android\.support\.v4\.app\.ActivityCompat;/import androidx.core.app.ActivityCompat;/g' \
    node_modules/@moodlehq/cordova-plugin-qrscanner/src/android/QRScanner.java

sed -i 's/import android\.support\.v4\.app\.ActivityCompat;/import androidx.core.app.ActivityCompat;/g' \
    plugins/@moodlehq/cordova-plugin-qrscanner/src/android/QRScanner.java

# Clean and rebuild
rm -rf android/capacitor-cordova-android-plugins/src
npx cap sync android
npx cap run android
```

#### 3. Colors Not Applied

**Problem**: Invalid hex color codes

**Solution**:
- Ensure all colors use valid hex format: `#RRGGBB`
- Check for typos in color names
- Restart dev server after changing colors

#### 4. Cordova Plugin Build Error

**Problem**: `cordova-plugin-moodleapp/www/index.js` not found

**Solution**:
```bash
cd cordova-plugin-moodleapp
npm install
npm run prod
cd ..
```

#### 5. Gradle Build Warnings

**Problem**: Multiple warnings about AndroidManifest.xml

**Solution**: These are warnings, not errors. The build will succeed. To fix properly, update `android/app/src/main/AndroidManifest.xml` with the suggested intent filters.

---



## Example: BS23 Brand

### Configuration

```json
{
    "brandId": "bs23",
    "displayName": "Brain Station 23",
    "siteUrl": "https://lms.elearning23.com",
    "colors": {
        "primary": "#4992C1",
        "secondary": "#111E40",
        "surface": "#ffffff",
        "onPrimary": "#ffffff",
        "onSecondary": "#ffffff",
        "onSurface": "#4992C1"
    },
    "assets": {
        "logo": "assets/brands/bs23/logo.png",
        "splash": "assets/brands/bs23/splash.png",
        "appIcon": "assets/brands/bs23/icon.png"
    },
    "featureToggles": {
        "preconfiguredSite": true,
        "enforceBrandTheme": true
    }
}
```

### Build Commands

```bash
# Development
BRAND_ID=bs23 npm start

# Production web build
BRAND_ID=bs23 npm run build:prod

# Android build
BRAND_ID=bs23 npm run build:prod
npx cap sync android
npx cap run android
```

---

## Additional Resources

- [Moodle Mobile Documentation](https://docs.moodle.org/en/Moodle_Mobile)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Angular Documentation](https://angular.io/docs)
- [Ionic Framework](https://ionicframework.com/docs)

---

## Support

For issues or questions:
1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review build logs for specific errors
3. Ensure all prerequisites are installed
4. Verify brand configuration JSON is valid

---

**Last Updated**: November 4, 2025
**Version**: 5.1.0
