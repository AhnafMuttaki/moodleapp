# Brand Configuration Schema

## 1. Overview

This document defines the complete JSON schema for brand configuration files used in both Initiative 1 (Preconfigured Site Login) and Initiative 2 (Brand Colors & Logo). The schema provides type safety, validation rules, and default values.

## 2. Complete Schema Definition

### Root Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Brand Configuration",
  "description": "Configuration schema for Moodle Mobile app branding",
  "type": "object",
  "required": ["brandId", "displayName"],
  "properties": {
    "brandId": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "minLength": 2,
      "maxLength": 50,
      "description": "Unique identifier for the brand (lowercase, alphanumeric, hyphens only)"
    },
    "displayName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "Human-readable brand name"
    },
    "description": {
      "type": "string",
      "maxLength": 500,
      "description": "Optional description of the brand"
    },
    "siteUrl": {
      "type": "string",
      "format": "uri",
      "pattern": "^https://",
      "description": "Preconfigured Moodle site URL (must use HTTPS)"
    },
    "colors": {
      "type": "object",
      "description": "Brand color palette",
      "properties": {
        "primary": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Primary brand color (hex format)"
        },
        "secondary": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Secondary brand color (hex format)"
        },
        "surface": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Surface color for cards and backgrounds"
        },
        "onPrimary": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Text color on primary background"
        },
        "onSecondary": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Text color on secondary background"
        },
        "onSurface": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Text color on surface background"
        },
        "error": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Error state color"
        },
        "warning": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Warning state color"
        },
        "success": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Success state color"
        },
        "info": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "description": "Info state color"
        }
      },
      "required": ["primary"],
      "additionalProperties": false
    },
    "typography": {
      "type": "object",
      "description": "Brand typography settings",
      "properties": {
        "fontFamily": {
          "type": "string",
          "maxLength": 200,
          "description": "Primary font family"
        },
        "fontWeight": {
          "type": "object",
          "properties": {
            "normal": {
              "type": "integer",
              "minimum": 100,
              "maximum": 900,
              "description": "Normal font weight"
            },
            "medium": {
              "type": "integer",
              "minimum": 100,
              "maximum": 900,
              "description": "Medium font weight"
            },
            "bold": {
              "type": "integer",
              "minimum": 100,
              "maximum": 900,
              "description": "Bold font weight"
            }
          },
          "additionalProperties": false
        },
        "fontSize": {
          "type": "object",
          "properties": {
            "small": {
              "type": "number",
              "minimum": 10,
              "maximum": 20,
              "description": "Small font size in pixels"
            },
            "medium": {
              "type": "number",
              "minimum": 12,
              "maximum": 24,
              "description": "Medium font size in pixels"
            },
            "large": {
              "type": "number",
              "minimum": 16,
              "maximum": 32,
              "description": "Large font size in pixels"
            }
          },
          "additionalProperties": false
        }
      },
      "additionalProperties": false
    },
    "assets": {
      "type": "object",
      "description": "Brand asset paths",
      "properties": {
        "logo": {
          "type": "string",
          "pattern": "^assets/",
          "description": "Path to brand logo (relative to src/)"
        },
        "splash": {
          "type": "string",
          "pattern": "^assets/",
          "description": "Path to splash screen image"
        },
        "appIcon": {
          "type": "string",
          "pattern": "^assets/",
          "description": "Path to app icon"
        },
        "favicon": {
          "type": "string",
          "pattern": "^assets/",
          "description": "Path to favicon"
        }
      },
      "additionalProperties": false
    },
    "app": {
      "type": "object",
      "description": "App-specific configuration",
      "properties": {
        "android": {
          "type": "object",
          "properties": {
            "packageName": {
              "type": "string",
              "pattern": "^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$",
              "description": "Android package name"
            },
            "appId": {
              "type": "string",
              "pattern": "^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$",
              "description": "Android app ID"
            }
          },
          "required": ["packageName"],
          "additionalProperties": false
        },
        "ios": {
          "type": "object",
          "properties": {
            "bundleId": {
              "type": "string",
              "pattern": "^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$",
              "description": "iOS bundle identifier"
            },
            "appId": {
              "type": "string",
              "pattern": "^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$",
              "description": "iOS app ID"
            }
          },
          "required": ["bundleId"],
          "additionalProperties": false
        },
        "versionCode": {
          "type": "integer",
          "minimum": 1,
          "description": "App version code"
        },
        "versionName": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$",
          "description": "App version name (semantic versioning)"
        }
      },
      "additionalProperties": false
    },
    "endpoints": {
      "type": "object",
      "description": "API endpoints configuration",
      "properties": {
        "moodle": {
          "type": "string",
          "format": "uri",
          "pattern": "^https://",
          "description": "Moodle LMS endpoint"
        },
        "api": {
          "type": "string",
          "format": "uri",
          "pattern": "^https://",
          "description": "Custom API endpoint"
        },
        "push": {
          "type": "string",
          "format": "uri",
          "pattern": "^https://",
          "description": "Push notification endpoint"
        }
      },
      "additionalProperties": false
    },
    "deepLinks": {
      "type": "object",
      "description": "Deep link configuration",
      "properties": {
        "scheme": {
          "type": "string",
          "pattern": "^[a-z][a-z0-9-]*$",
          "minLength": 2,
          "maxLength": 20,
          "description": "Custom URL scheme"
        },
        "host": {
          "type": "string",
          "pattern": "^[a-z0-9.-]+$",
          "description": "Deep link host"
        }
      },
      "additionalProperties": false
    },
    "featureToggles": {
      "type": "object",
      "description": "Feature toggle configuration",
      "properties": {
        "preconfiguredSite": {
          "type": "boolean",
          "description": "Enable preconfigured site login"
        },
        "enforceBrandTheme": {
          "type": "boolean",
          "description": "Enforce brand theme application"
        },
        "enableAnalytics": {
          "type": "boolean",
          "description": "Enable analytics tracking"
        },
        "enableOnboarding": {
          "type": "boolean",
          "description": "Enable user onboarding"
        },
        "darkMode": {
          "type": "boolean",
          "description": "Enable dark mode support"
        }
      },
      "additionalProperties": false
    },
    "accessibility": {
      "type": "object",
      "description": "Accessibility configuration",
      "properties": {
        "minContrastRatio": {
          "type": "number",
          "minimum": 3,
          "maximum": 7,
          "description": "Minimum color contrast ratio (WCAG compliance)"
        },
        "fontSizeScale": {
          "type": "number",
          "minimum": 0.8,
          "maximum": 1.5,
          "description": "Font size scaling factor"
        },
        "highContrast": {
          "type": "boolean",
          "description": "Enable high contrast mode"
        }
      },
      "additionalProperties": false
    },
    "localization": {
      "type": "object",
      "description": "Localization configuration",
      "properties": {
        "defaultLanguage": {
          "type": "string",
          "pattern": "^[a-z]{2}(-[A-Z]{2})?$",
          "description": "Default language code (ISO 639-1)"
        },
        "supportedLanguages": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[a-z]{2}(-[A-Z]{2})?$"
          },
          "description": "List of supported language codes"
        },
        "rtlSupport": {
          "type": "boolean",
          "description": "Enable right-to-left language support"
        }
      },
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

## 3. TypeScript Interface

### Core Interfaces
```typescript
// src/types/brand-config.d.ts

export interface BrandConfig {
  brandId: string;
  displayName: string;
  description?: string;
  siteUrl?: string;
  colors?: BrandColors;
  typography?: BrandTypography;
  assets?: BrandAssets;
  app?: AppConfig;
  endpoints?: EndpointConfig;
  deepLinks?: DeepLinkConfig;
  featureToggles?: FeatureToggles;
  accessibility?: AccessibilityConfig;
  localization?: LocalizationConfig;
}

export interface BrandColors {
  primary: string;
  secondary?: string;
  surface?: string;
  onPrimary?: string;
  onSecondary?: string;
  onSurface?: string;
  error?: string;
  warning?: string;
  success?: string;
  info?: string;
}

export interface BrandTypography {
  fontFamily?: string;
  fontWeight?: {
    normal?: number;
    medium?: number;
    bold?: number;
  };
  fontSize?: {
    small?: number;
    medium?: number;
    large?: number;
  };
}

export interface BrandAssets {
  logo?: string;
  splash?: string;
  appIcon?: string;
  favicon?: string;
}

export interface AppConfig {
  android?: {
    packageName: string;
    appId?: string;
  };
  ios?: {
    bundleId: string;
    appId?: string;
  };
  versionCode?: number;
  versionName?: string;
}

export interface EndpointConfig {
  moodle?: string;
  api?: string;
  push?: string;
}

export interface DeepLinkConfig {
  scheme?: string;
  host?: string;
}

export interface FeatureToggles {
  preconfiguredSite?: boolean;
  enforceBrandTheme?: boolean;
  enableAnalytics?: boolean;
  enableOnboarding?: boolean;
  darkMode?: boolean;
}

export interface AccessibilityConfig {
  minContrastRatio?: number;
  fontSizeScale?: number;
  highContrast?: boolean;
}

export interface LocalizationConfig {
  defaultLanguage?: string;
  supportedLanguages?: string[];
  rtlSupport?: boolean;
}
```

## 4. Default Values

### Default Brand Configuration
```json
// branding/default-brand.json
{
  "brandId": "moodle",
  "displayName": "Moodle Mobile",
  "description": "Official Moodle Mobile app",
  "colors": {
    "primary": "#f98012",
    "secondary": "#dee2e6",
    "surface": "#ffffff",
    "onPrimary": "#ffffff",
    "onSecondary": "#000000",
    "onSurface": "#282828",
    "error": "#ca3120",
    "warning": "#f0ad4e",
    "success": "#357a32",
    "info": "#0f6cbf"
  },
  "typography": {
    "fontFamily": "system-ui, -apple-system, sans-serif",
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "bold": 700
    },
    "fontSize": {
      "small": 12,
      "medium": 14,
      "large": 16
    }
  },
  "assets": {
    "logo": "assets/img/login_logo.png",
    "splash": "assets/img/splash.png",
    "appIcon": "assets/img/icon.png",
    "favicon": "assets/img/favicon.ico"
  },
  "app": {
    "android": {
      "packageName": "com.moodle.moodlemobile",
      "appId": "com.moodle.moodlemobile"
    },
    "ios": {
      "bundleId": "com.moodle.moodlemobile",
      "appId": "com.moodle.moodlemobile"
    },
    "versionCode": 51000,
    "versionName": "5.1.0"
  },
  "featureToggles": {
    "preconfiguredSite": false,
    "enforceBrandTheme": false,
    "enableAnalytics": false,
    "enableOnboarding": true,
    "darkMode": true
  },
  "accessibility": {
    "minContrastRatio": 4.5,
    "fontSizeScale": 1.0,
    "highContrast": false
  },
  "localization": {
    "defaultLanguage": "en",
    "supportedLanguages": ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"],
    "rtlSupport": true
  }
}
```

## 5. Validation Rules

### Color Validation
```typescript
// src/core/utils/color-validation.ts
export class ColorValidator {
  static validateHexColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }

  static validateContrastRatio(foreground: string, background: string, minRatio: number = 4.5): boolean {
    const fgLuminance = this.getLuminance(foreground);
    const bgLuminance = this.getLuminance(background);
    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);
    return ratio >= minRatio;
  }

  private static getLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private static hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }
}
```

### URL Validation
```typescript
// src/core/utils/url-validation.ts
export class UrlValidator {
  static validateMoodleUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && urlObj.hostname.length > 0;
    } catch {
      return false;
    }
  }

  static validateAssetPath(path: string): boolean {
    return path.startsWith('assets/') && path.length > 7;
  }
}
```

### Package Name Validation
```typescript
// src/core/utils/package-validation.ts
export class PackageValidator {
  static validateAndroidPackageName(packageName: string): boolean {
    const pattern = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;
    return pattern.test(packageName);
  }

  static validateIOSBundleId(bundleId: string): boolean {
    const pattern = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;
    return pattern.test(bundleId);
  }
}
```

## 6. Example Configurations

### University Brand
```json
{
  "brandId": "university-x",
  "displayName": "University X Mobile",
  "description": "Official mobile app for University X",
  "siteUrl": "https://lms.universityx.edu",
  "colors": {
    "primary": "#1e3a8a",
    "secondary": "#3b82f6",
    "surface": "#ffffff",
    "onPrimary": "#ffffff",
    "onSecondary": "#000000",
    "onSurface": "#1f2937"
  },
  "assets": {
    "logo": "assets/brands/university-x/logo.png",
    "splash": "assets/brands/university-x/splash.png",
    "appIcon": "assets/brands/university-x/icon.png"
  },
  "app": {
    "android": {
      "packageName": "com.universityx.mobile"
    },
    "ios": {
      "bundleId": "com.universityx.mobile"
    }
  },
  "featureToggles": {
    "preconfiguredSite": true,
    "enforceBrandTheme": true
  }
}
```

### School Brand
```json
{
  "brandId": "school-y",
  "displayName": "School Y Learning",
  "description": "Mobile learning platform for School Y",
  "siteUrl": "https://learn.schooly.edu",
  "colors": {
    "primary": "#059669",
    "secondary": "#10b981",
    "surface": "#f9fafb",
    "onPrimary": "#ffffff",
    "onSecondary": "#ffffff",
    "onSurface": "#111827"
  },
  "assets": {
    "logo": "assets/brands/school-y/logo.png",
    "splash": "assets/brands/school-y/splash.png"
  },
  "app": {
    "android": {
      "packageName": "com.schooly.learning"
    },
    "ios": {
      "bundleId": "com.schooly.learning"
    }
  },
  "featureToggles": {
    "preconfiguredSite": true,
    "enforceBrandTheme": true,
    "enableOnboarding": false
  }
}
```

## 7. Migration Guide

### From moodle.config.json
```typescript
// Migration utility
export class ConfigMigrator {
  static migrateFromMoodleConfig(moodleConfig: any): BrandConfig {
    return {
      brandId: 'moodle',
      displayName: moodleConfig.appname || 'Moodle Mobile',
      siteUrl: moodleConfig.sites?.[0]?.url,
      colors: {
        primary: moodleConfig.notificoncolor || '#f98012'
      },
      featureToggles: {
        preconfiguredSite: !!moodleConfig.sites?.[0]?.url,
        enforceBrandTheme: false
      }
    };
  }
}
```

### Version Compatibility
```typescript
// Version compatibility checker
export class ConfigVersionChecker {
  static checkCompatibility(config: any, targetVersion: string): boolean {
    // Check if config is compatible with target version
    return true; // Implementation depends on versioning strategy
  }

  static migrateToVersion(config: any, fromVersion: string, toVersion: string): BrandConfig {
    // Migrate config from one version to another
    return config; // Implementation depends on migration rules
  }
}
```

## 8. Best Practices

### Configuration Management
1. **Version Control**: Keep all brand configs in version control
2. **Validation**: Always validate configs before deployment
3. **Testing**: Test each brand configuration thoroughly
4. **Documentation**: Document any custom configurations

### Security Considerations
1. **Sensitive Data**: Never include sensitive data in config files
2. **URL Validation**: Always validate URLs before use
3. **Asset Security**: Ensure asset paths are secure
4. **Access Control**: Control access to brand configuration files

### Performance Considerations
1. **Config Size**: Keep config files small (<10KB)
2. **Lazy Loading**: Load configs only when needed
3. **Caching**: Cache validated configs
4. **Compression**: Compress config files in production

---

*This schema provides a comprehensive foundation for brand configuration while maintaining type safety and validation.*
