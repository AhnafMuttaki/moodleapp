# Brand Configuration Guide

## Overview

This guide explains how to configure the Moodle Mobile app with preconfigured site login functionality. The brand configuration system allows you to customize the app's behavior at build time, including setting a preconfigured Moodle site URL.

## Quick Start

To enable preconfigured site login with your Moodle site:

1. **Create a brand configuration file**:
   ```bash
   mkdir -p branding/my-brand
   ```

2. **Create `branding/my-brand/brand-config.json`**:
   ```json
   {
     "brandId": "my-brand",
     "displayName": "My Organization Mobile",
     "siteUrl": "https://lms.myorganization.com",
     "featureToggles": {
       "preconfiguredSite": true
     }
   }
   ```

3. **Build the app with your brand**:
   ```bash
   BRAND_ID=my-brand npm run build:android
   BRAND_ID=my-brand npm run build:ios
   ```

## Configuration Schema

### Required Fields

- **`brandId`**: Unique identifier for your brand (lowercase, alphanumeric, hyphens only)
- **`displayName`**: Human-readable brand name displayed in the app

### Optional Fields

- **`description`**: Optional description of your brand
- **`siteUrl`**: Preconfigured Moodle site URL (must use HTTPS)
- **`featureToggles`**: Feature configuration object

### Feature Toggles

The `featureToggles` object controls various app features:

```json
{
  "featureToggles": {
    "preconfiguredSite": true,        // Enable preconfigured site login
    "enforceBrandTheme": false,        // Enforce brand theme (future feature)
    "enableAnalytics": false,          // Enable analytics tracking
    "enableOnboarding": true,          // Enable user onboarding
    "darkMode": true                   // Enable dark mode support
  }
}
```

## Configuration Examples

### Basic Preconfigured Site

```json
{
  "brandId": "university-x",
  "displayName": "University X Mobile",
  "siteUrl": "https://lms.universityx.edu",
  "featureToggles": {
    "preconfiguredSite": true
  }
}
```

### Complete Configuration

```json
{
  "brandId": "school-y",
  "displayName": "School Y Learning",
  "description": "Official mobile app for School Y",
  "siteUrl": "https://learn.schooly.edu",
  "featureToggles": {
    "preconfiguredSite": true,
    "enforceBrandTheme": true,
    "enableAnalytics": false,
    "enableOnboarding": true,
    "darkMode": true
  }
}
```

### Disabled Preconfigured Site

```json
{
  "brandId": "default",
  "displayName": "Moodle Mobile",
  "featureToggles": {
    "preconfiguredSite": false
  }
}
```

## Build Process

### Environment Variables

- **`BRAND_ID`**: Specifies which brand configuration to use
- **Default**: If not set, uses `default` brand

### Build Commands

```bash
# Build with specific brand
BRAND_ID=my-brand npm run build:android
BRAND_ID=my-brand npm run build:ios

# Build with default brand
npm run build:android
npm run build:ios

# Build brand configuration only
npm run build:brand-config
```

### Build Pipeline

The build process:

1. **Brand Config Loading**: Loads `branding/{BRAND_ID}/brand-config.json`
2. **Validation**: Validates configuration schema and values
3. **Asset Copying**: Copies config to `src/assets/brand-config.json`
4. **App Build**: Builds the app with the brand configuration

## File Structure

```
moodleapp/
├── branding/
│   ├── default/
│   │   └── brand-config.json          # Default configuration
│   ├── my-brand/
│   │   └── brand-config.json          # Custom brand configuration
│   └── university-x/
│       └── brand-config.json          # Another brand configuration
├── src/
│   └── assets/
│       └── brand-config.json          # Generated during build
└── gulp/
    └── task-build-brand-config.js     # Build task
```

## Validation Rules

### Brand ID
- Must be lowercase
- Can contain letters, numbers, and hyphens
- Must be 2-50 characters long
- Pattern: `^[a-z0-9-]+$`

### Site URL
- Must be a valid URL
- Must use HTTP or HTTPS protocol
- Should use HTTPS in production

### Feature Toggles
- All values must be boolean (`true` or `false`)
- Unknown toggles generate warnings but don't fail validation

## Error Handling

### Configuration Loading Failures

If the brand configuration fails to load:

1. **Missing File**: Falls back to default configuration
2. **Invalid JSON**: Falls back to default configuration
3. **Validation Errors**: Falls back to default configuration
4. **Network Errors**: Falls back to default configuration

### Fallback Behavior

When configuration loading fails:

```json
{
  "brandId": "default",
  "displayName": "Moodle Mobile",
  "siteUrl": "http://localhost:8082",
  "featureToggles": {
    "preconfiguredSite": true,
    "enforceBrandTheme": false,
    "enableAnalytics": false,
    "enableOnboarding": true,
    "darkMode": true
  }
}
```

## Testing

### Local Development

For local development with `http://localhost:8082`:

```json
{
  "brandId": "dev",
  "displayName": "Development Mobile",
  "siteUrl": "http://localhost:8082",
  "featureToggles": {
    "preconfiguredSite": true
  }
}
```

### Unit Tests

Run unit tests for brand configuration:

```bash
npm test -- --testPathPattern=brand-config
```

### E2E Tests

Run E2E tests for preconfigured site functionality:

```bash
npm run test:e2e -- --grep "preconfigured site"
```

## Troubleshooting

### Common Issues

#### 1. Brand Config Not Found
**Error**: `Brand config not found: branding/my-brand/brand-config.json`

**Solution**:
- Check that the file exists at the correct path
- Verify the `BRAND_ID` environment variable is set correctly
- Ensure the file has proper JSON syntax

#### 2. Invalid Configuration
**Error**: `Validation failed: brandId is required and must be a string`

**Solution**:
- Check that all required fields are present
- Verify field types match the schema
- Use a JSON validator to check syntax

#### 3. Site URL Not Working
**Error**: App shows site entry screen instead of login

**Solution**:
- Verify `siteUrl` is a valid URL
- Check that `preconfiguredSite` is set to `true`
- Ensure the Moodle site is accessible
- Check browser console for errors

#### 4. Build Failures
**Error**: Build process fails during brand config step

**Solution**:
- Check that the brand config file exists
- Verify JSON syntax is valid
- Ensure all required fields are present
- Check file permissions

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// In browser console
localStorage.setItem('debug', 'CoreBrandConfigProvider');
```

### Validation Testing

Test your configuration before building:

```bash
# Validate brand config
node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('branding/my-brand/brand-config.json', 'utf8'));
console.log('Configuration is valid:', config);
"
```

## Best Practices

### Security
- Use HTTPS URLs in production
- Don't include sensitive data in configuration files
- Validate all URLs before use

### Performance
- Keep configuration files small (<10KB)
- Use efficient JSON structure
- Avoid unnecessary nested objects

### Maintenance
- Version control all brand configurations
- Document any custom configurations
- Test configurations thoroughly before deployment
- Keep backup copies of working configurations

### Organization
- Use descriptive brand IDs
- Group related configurations
- Maintain consistent naming conventions
- Document configuration changes

## Migration from moodle.config.json

If you're migrating from the existing `moodle.config.json`:

### Old Configuration
```json
{
  "appname": "My Organization Mobile",
  "sites": [
    {
      "url": "https://lms.myorganization.com"
    }
  ]
}
```

### New Configuration
```json
{
  "brandId": "my-organization",
  "displayName": "My Organization Mobile",
  "siteUrl": "https://lms.myorganization.com",
  "featureToggles": {
    "preconfiguredSite": true
  }
}
```

## Support

For additional support:

1. **Documentation**: Check the main project documentation
2. **Issues**: Report issues on the project repository
3. **Community**: Join the Moodle Mobile community forums
4. **Development**: Contribute to the project on GitHub

---

*This guide provides comprehensive information for configuring the Moodle Mobile app with preconfigured site login functionality.*
