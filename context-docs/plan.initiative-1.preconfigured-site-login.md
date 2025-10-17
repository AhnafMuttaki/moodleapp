# Initiative 1: Preconfigured Site → Direct Login

## 1. Objective & Scope

### Goal
Enable build-time configuration of a Moodle site URL so the app skips the "Enter your site" screen and navigates directly to the Login screen for that site.

### In-Scope
- Build-time brand configuration system
- Site URL preconfiguration
- Navigation guard to bypass site entry screen
- Direct navigation to login credentials page
- Feature flag system for enabling/disabling preconfigured site
- Backward compatibility with existing site entry flow

### Out-of-Scope
- Runtime site URL changes (build-time only)
- Multiple preconfigured sites (single site per build)
- Site URL validation beyond existing Moodle URL validation
- Changes to existing login authentication flow

### Backward Compatibility
- If `siteUrl` is missing or `preconfiguredSite` flag is false, fallback to current site entry flow
- Existing site management and multi-site functionality remains unchanged
- No impact on existing user sessions or stored sites

## 2. Current Behavior Map (as-is)

### Site Entry Flow
**File**: `src/core/features/login/pages/site/site.ts` (lines 59-658)
- **Component**: `CoreLoginSitePage`
- **Route**: `/login/site` (determined by `CoreLoginHelper.getAddSiteRouteInfo()`)
- **Behavior**: Shows site URL input form, QR scanner, site selector if available sites exist

### Site Guard Logic
**File**: `src/core/features/login/guards/has-sites.ts` (lines 1-39)
- **Guard**: `hasSitesGuard`
- **Logic**: Checks if user has stored sites, redirects to site entry if none

### Login Navigation
**File**: `src/core/features/login/pages/credentials/credentials.ts` (lines 53-387)
- **Component**: `CoreLoginCredentialsPage`
- **Route**: `/login/credentials`
- **Behavior**: Shows login form for specified site URL

### Configuration System
**File**: `src/core/services/config.ts` (lines 1-260)
- **Service**: `CoreConfigProvider`
- **Current**: Loads from `moodle.config.json` and environment-specific overrides
- **Build Process**: `gulp/task-build-env.js` generates `src/assets/env.json`

### Navigation Service
**File**: `src/core/services/navigator.ts` (lines 88-916)
- **Service**: `CoreNavigatorService`
- **Key Method**: `navigateToSitePath()` handles site-specific navigation

## 3. Proposed Design (to-be)

### Config Source
**Location**: `branding/{brand-id}/brand-config.json`
**Selection**: Environment variable `BRAND_ID` or npm script parameter
**Injection**: Build-time JSON asset copied to `src/assets/brand-config.json`

### Runtime Access
**Service**: `CoreBrandConfigService`
**Methods**:
- `getSiteUrl(): string | null`
- `isPreconfiguredSiteEnabled(): boolean`
- `getBrandConfig(): BrandConfig | null`

### Feature Flag & Fallbacks
**Flag**: `preconfiguredSite: boolean`
**Logic**:
1. If `preconfiguredSite: true` AND `siteUrl` present → bypass site entry → navigate to `/login/credentials?siteUrl={siteUrl}`
2. If `preconfiguredSite: false` OR `siteUrl` missing → fallback to current flow

### Navigation Flow
```
App Start → Brand Config Load → Check preconfiguredSite flag
├─ true + siteUrl exists → Navigate to /login/credentials?siteUrl={siteUrl}
└─ false OR siteUrl missing → Navigate to /login/site (current flow)
```

## 4. Configuration Details

### Schema
```json
{
  "brandId": "acme",
  "displayName": "Acme Learning",
  "siteUrl": "https://lms.acme.com",
  "featureToggles": {
    "preconfiguredSite": true
  }
}
```

### Build Integration
**Android**: Gradle flavor `brand-{brandId}` with `BRAND_ID` environment variable
**iOS**: Xcode scheme `{brandId}` with build configuration
**Asset Copy**: `branding/{brand-id}/brand-config.json` → `src/assets/brand-config.json`

## 5. Task Breakdown

### Task 1: Create Brand Configuration System
**Files**:
- `src/core/services/brand-config.ts` (new)
- `src/types/brand-config.d.ts` (new)
- `branding/default-brand.json` (new)

**Changes**:
- Create `BrandConfig` interface
- Create `CoreBrandConfigService` with config loading and validation
- Add default brand configuration

**Acceptance**: Service loads and validates brand config, exposes typed methods
**Risk**: Config loading failure → fallback to default behavior

### Task 2: Create Brand Config Asset Loading
**Files**:
- `gulp/task-build-brand-config.js` (new)
- `gulpfile.js` (modify)

**Changes**:
- Add Gulp task to copy brand config based on `BRAND_ID` environment variable
- Integrate with existing build pipeline

**Acceptance**: Brand config copied to `src/assets/brand-config.json` during build
**Risk**: Missing brand config → fallback to default

### Task 3: Create Preconfigured Site Guard
**Files**:
- `src/core/features/login/guards/preconfigured-site.ts` (new)
- `src/core/features/login/login.module.ts` (modify)

**Changes**:
- Create guard that checks preconfigured site flag
- Redirect to credentials page with siteUrl if enabled
- Fallback to site entry if disabled

**Acceptance**: Guard correctly routes based on preconfigured site configuration
**Risk**: Guard failure → fallback to site entry

### Task 4: Modify Initial Navigation Logic
**Files**:
- `src/core/features/login/services/login-helper.ts` (modify)
- `src/core/services/navigator.ts` (modify)

**Changes**:
- Update `getAddSiteRouteInfo()` to check preconfigured site
- Modify initial navigation to use preconfigured site URL

**Acceptance**: App navigates directly to login when preconfigured site is enabled
**Risk**: Navigation failure → fallback to site entry

### Task 5: Update Site URL Handling
**Files**:
- `src/core/features/login/pages/credentials/credentials.ts` (modify)
- `src/core/services/sites.ts` (modify)

**Changes**:
- Ensure credentials page accepts preconfigured site URL
- Update site creation to use preconfigured URL

**Acceptance**: Login works with preconfigured site URL
**Risk**: Site URL validation failure → show error message

### Task 6: Add Feature Toggle Support
**Files**:
- `src/core/services/brand-config.ts` (modify)
- `src/core/features/login/guards/preconfigured-site.ts` (modify)

**Changes**:
- Add feature toggle validation
- Ensure graceful fallback when toggle is disabled

**Acceptance**: Feature toggle controls preconfigured site behavior
**Risk**: Toggle misconfiguration → fallback to site entry

### Task 7: Unit Tests
**Files**:
- `src/core/services/__tests__/brand-config.spec.ts` (new)
- `src/core/features/login/guards/__tests__/preconfigured-site.spec.ts` (new)

**Changes**:
- Test brand config loading and validation
- Test guard logic with various configurations
- Test fallback behavior

**Acceptance**: All tests pass, coverage >90%
**Risk**: Test failures → fix implementation

### Task 8: E2E Tests
**Files**:
- `e2e/login/preconfigured-site.spec.ts` (new)

**Changes**:
- Test cold start with preconfigured site enabled
- Test cold start with preconfigured site disabled
- Test navigation to login credentials page

**Acceptance**: E2E tests pass on Android and iOS
**Risk**: E2E test failures → debug and fix

### Task 9: Documentation
**Files**:
- `README.md` (modify)
- `docs/branding/preconfigured-site.md` (new)

**Changes**:
- Document how to configure preconfigured site
- Document build process and environment variables
- Document troubleshooting

**Acceptance**: Clear documentation for brand configuration
**Risk**: Missing documentation → user confusion

## 6. Impacted Areas & Compatibility

### Routing/Guards
- **Impact**: New guard added to login flow
- **Compatibility**: Existing guards remain unchanged

### Auth/Session Services
- **Impact**: Site creation uses preconfigured URL
- **Compatibility**: Existing site management unchanged

### HTTP Base URL
- **Impact**: Preconfigured site becomes base URL
- **Compatibility**: Existing API calls work with new base URL

### Offline & Caching
- **Impact**: Site URL changes don't break caches
- **Compatibility**: Cache keys remain site-specific

### Localization
- **Impact**: No impact on i18n
- **Compatibility**: Existing translations work

## 7. Testing Plan

### Unit Tests
- **Config Validation**: Test brand config loading and validation
- **Guard Logic**: Test preconfigured site guard with various configurations
- **Fallback Behavior**: Test fallback when config is missing or invalid

### Integration Tests
- **Startup Flow**: Test app startup with/without preconfigured site
- **Navigation Flow**: Test navigation from app start to login
- **Site Creation**: Test site creation with preconfigured URL

### E2E Tests
- **Cold Start**: Test app cold start with preconfigured site enabled
- **Cold Start Fallback**: Test app cold start with preconfigured site disabled
- **Login Flow**: Test login flow with preconfigured site

### Performance Tests
- **Startup Time**: Ensure no regression >100ms due to config loading
- **Memory Usage**: Monitor memory usage during config loading

## 8. CI/CD & Build Variants

### Build Scripts
```bash
# Build with specific brand
BRAND_ID=acme npm run build:android
BRAND_ID=acme npm run build:ios

# Build with default brand (current behavior)
npm run build:android
npm run build:ios
```

### Android Flavors
```gradle
// app/build.gradle
android {
    flavorDimensions "brand"
    productFlavors {
        default {
            dimension "brand"
            // Current behavior
        }
        acme {
            dimension "brand"
            buildConfigField "String", "BRAND_ID", '"acme"'
        }
    }
}
```

### iOS Schemes
- **Default Scheme**: Current behavior
- **Brand Schemes**: `{brandId}` scheme with `BRAND_ID` build setting

### Artifact Naming
- **Android**: `moodle-mobile-{brandId}-{version}.apk`
- **iOS**: `moodle-mobile-{brandId}-{version}.ipa`

## 9. Risks, Mitigations, Rollback

### Risk: Misconfigured siteUrl blocks login
**Mitigation**: Add URL validation + clear error UI + fallback switch
**Rollback**: Disable preconfigured site flag

### Risk: Navigation guard conflicts
**Mitigation**: Test guard order and priority
**Rollback**: Remove preconfigured site guard

### Risk: Build process complexity
**Mitigation**: Comprehensive build testing
**Rollback**: Revert to single build configuration

### Risk: Performance regression
**Mitigation**: Performance testing and monitoring
**Rollback**: Optimize config loading or disable feature

## 10. Acceptance Criteria

### Primary Criteria
- ✅ With `siteUrl` set and `preconfiguredSite: true`, app never shows "Enter your site" screen
- ✅ App navigates directly to Login screen for preconfigured site
- ✅ With `preconfiguredSite: false` or missing config, app shows current site entry flow
- ✅ Existing site management and multi-site functionality unchanged
- ✅ No performance regression >100ms on app startup

### Secondary Criteria
- ✅ Clear error messages for invalid site URLs
- ✅ Graceful fallback when brand config is missing
- ✅ Comprehensive test coverage >90%
- ✅ Documentation for brand configuration process

## 11. Change Log & PR Plan

### PR 1: Brand Configuration Foundation
**Files**: `src/core/services/brand-config.ts`, `src/types/brand-config.d.ts`, `branding/default-brand.json`
**Tests**: Unit tests for brand config service
**Docs**: Brand configuration schema documentation

### PR 2: Build Integration
**Files**: `gulp/task-build-brand-config.js`, `gulpfile.js`
**Tests**: Build process tests
**Docs**: Build configuration documentation

### PR 3: Navigation Guard
**Files**: `src/core/features/login/guards/preconfigured-site.ts`, `src/core/features/login/login.module.ts`
**Tests**: Guard unit tests
**Docs**: Guard behavior documentation

### PR 4: Navigation Logic Updates
**Files**: `src/core/features/login/services/login-helper.ts`, `src/core/services/navigator.ts`
**Tests**: Navigation integration tests
**Docs**: Navigation flow documentation

### PR 5: E2E Tests & Documentation
**Files**: `e2e/login/preconfigured-site.spec.ts`, `docs/branding/preconfigured-site.md`
**Tests**: E2E test suite
**Docs**: Complete user documentation

---

*This plan provides a comprehensive roadmap for implementing preconfigured site functionality while maintaining backward compatibility and following the existing codebase patterns.*
