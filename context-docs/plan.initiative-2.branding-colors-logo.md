# Initiative 2: Brand Colors & Logo

## 1. Objective & Scope

### Goal
Enable build-time configuration of brand colors and logo so all screens adopt the configured brand tokens without visual regressions.

### In-Scope
- Brand color configuration system
- Logo asset management
- SCSS variable injection for brand colors
- Dynamic logo binding in components
- Feature flag system for enforcing brand theme
- Backward compatibility with Moodle default theme

### Out-of-Scope
- Runtime theme switching (build-time only)
- Complex brand customization beyond colors and logo
- Changes to existing component styling beyond brand tokens
- Dark mode brand variations (light theme only for initial implementation)

### Backward Compatibility
- If brand colors/logo missing or `enforceBrandTheme` flag is false, fallback to Moodle default theme
- Existing component styling and layout remain unchanged
- No impact on existing user preferences or theme settings

## 2. Current Behavior Map (as-is)

### Theming System
**File**: `src/theme/globals.variables.scss` (lines 1-56)
- **Brand Color**: `$brand-color: #f98012 !default` (line 27)
- **Primary Color**: `$primary: $brand-color !default` (line 44)
- **Color Palette**: Defined in `$colors` map (lines 55+)

**File**: `src/theme/theme.light.scss` (lines 1-244)
- **CSS Variables**: `--primary`, `--primary-contrast`, `--primary-shade`, `--primary-tint`
- **Design Tokens**: `--mdl-spacing-*`, `--mdl-typography-*`

### Logo Components
**File**: `src/core/components/site-logo/site-logo.ts` (lines 25-135)
- **Component**: `CoreSiteLogoComponent`
- **Fallback Logo**: `assets/img/login_logo.png` or `assets/img/top_logo.png`
- **Usage**: Login page, site headers

**File**: `src/core/components/site-logo/site-logo.html` (lines 1-30)
- **Template**: Shows site logo or fallback logo
- **Fallback**: Uses `fallbackLogo` property

### Color Application
**File**: `src/theme/theme.light.scss` (lines 69-244)
- **Ionic Colors**: Applied via CSS custom properties
- **Component Colors**: Header, buttons, tabs, progress bars
- **Design System**: Spacing, typography, accessibility colors

### Build System
**File**: `gulp/task-build-env.js` (lines 1-76)
- **Current**: Builds environment config from `moodle.config.json`
- **Output**: `src/assets/env.json`

## 3. Proposed Design (to-be)

### Config Source
**Location**: `branding/{brand-id}/brand-config.json`
**Selection**: Environment variable `BRAND_ID` or npm script parameter
**Injection**: Build-time SCSS variables and asset copying

### Runtime Access
**Service**: `CoreBrandConfigService` (extends Initiative 1)
**Methods**:
- `getColors(): BrandColors | null`
- `getLogoAsset(type: 'login' | 'top'): string`
- `isBrandThemeEnforced(): boolean`

### Feature Flag & Fallbacks
**Flag**: `enforceBrandTheme: boolean`
**Logic**:
1. If `enforceBrandTheme: true` AND brand colors present → apply brand theme
2. If `enforceBrandTheme: false` OR brand colors missing → fallback to Moodle default

### Theme Application
```
Brand Config Load → Check enforceBrandTheme flag
├─ true + colors exist → Inject brand SCSS variables → Apply to components
└─ false OR colors missing → Use default Moodle theme
```

## 4. Configuration Details

### Schema
```json
{
  "brandId": "acme",
  "displayName": "Acme Learning",
  "colors": {
    "primary": "#0F4C81",
    "secondary": "#F4A300",
    "surface": "#FFFFFF",
    "onPrimary": "#FFFFFF",
    "onSecondary": "#000000"
  },
  "assets": {
    "logo": "assets/brands/acme/logo.png",
    "splash": "assets/brands/acme/splash.png",
    "appIcon": "assets/brands/acme/icon.png"
  },
  "featureToggles": {
    "enforceBrandTheme": true
  }
}
```

### SCSS Variable Mapping
```scss
// Brand colors map to existing SCSS variables
$brand-color: #{brandConfig.colors.primary} !default;
$primary: $brand-color !default;
$secondary: #{brandConfig.colors.secondary} !default;
```

### Asset Mapping
- **Login Logo**: `branding/{brand-id}/logo.png` → `assets/img/login_logo.png`
- **Top Logo**: `branding/{brand-id}/logo.png` → `assets/img/top_logo.png`
- **App Icon**: `branding/{brand-id}/icon.png` → Platform-specific icon assets

## 5. Task Breakdown

### Task 1: Extend Brand Configuration System
**Files**:
- `src/core/services/brand-config.ts` (modify)
- `src/types/brand-config.d.ts` (modify)

**Changes**:
- Add `BrandColors` interface
- Add `getColors()`, `getLogoAsset()`, `isBrandThemeEnforced()` methods
- Add color validation and contrast checking

**Acceptance**: Service exposes brand colors and logo methods
**Risk**: Invalid color format → fallback to default colors

### Task 2: Create Brand SCSS Generation
**Files**:
- `gulp/task-build-brand-theme.js` (new)
- `gulpfile.js` (modify)

**Changes**:
- Create Gulp task to generate brand-specific SCSS variables
- Inject brand colors into `src/theme/globals.variables.scss`
- Copy brand assets to appropriate locations

**Acceptance**: Brand SCSS variables generated and assets copied
**Risk**: SCSS generation failure → fallback to default theme

### Task 3: Update Logo Component
**Files**:
- `src/core/components/site-logo/site-logo.ts` (modify)
- `src/core/components/site-logo/site-logo.html` (modify)

**Changes**:
- Update component to use brand logo when available
- Add fallback logic for missing brand assets
- Maintain existing site logo functionality

**Acceptance**: Logo component shows brand logo when configured
**Risk**: Logo loading failure → fallback to default logo

### Task 4: Create Brand Theme Service
**Files**:
- `src/core/services/brand-theme.ts` (new)

**Changes**:
- Create service to manage brand theme application
- Handle CSS custom property injection
- Provide theme validation and fallback

**Acceptance**: Brand theme service applies colors correctly
**Risk**: Theme application failure → fallback to default theme

### Task 5: Update Component Color Bindings
**Files**:
- `src/core/components/site-logo/site-logo.scss` (modify)
- `src/theme/components/ionic.scss` (modify)

**Changes**:
- Update component styles to use brand color variables
- Ensure proper color contrast and accessibility
- Maintain existing component functionality

**Acceptance**: Components use brand colors when theme is enforced
**Risk**: Color contrast issues → accessibility problems

### Task 6: Add Brand Theme Guard
**Files**:
- `src/core/guards/brand-theme.ts` (new)
- `src/core/core.module.ts` (modify)

**Changes**:
- Create guard to enforce brand theme on app startup
- Apply brand colors to CSS custom properties
- Handle theme fallback scenarios

**Acceptance**: Brand theme applied on app startup
**Risk**: Theme guard failure → fallback to default theme

### Task 7: Add Color Contrast Validation
**Files**:
- `src/core/utils/color-contrast.ts` (new)
- `src/core/services/brand-config.ts` (modify)

**Changes**:
- Create color contrast validation utility
- Validate brand colors against WCAG standards
- Provide warnings for accessibility issues

**Acceptance**: Brand colors meet accessibility standards
**Risk**: Poor color contrast → accessibility violations

### Task 8: Unit Tests
**Files**:
- `src/core/services/__tests__/brand-theme.spec.ts` (new)
- `src/core/utils/__tests__/color-contrast.spec.ts` (new)
- `src/core/components/site-logo/__tests__/site-logo.spec.ts` (modify)

**Changes**:
- Test brand theme application
- Test color contrast validation
- Test logo component with brand assets

**Acceptance**: All tests pass, coverage >90%
**Risk**: Test failures → fix implementation

### Task 9: Visual Regression Tests
**Files**:
- `e2e/visual/brand-theme.spec.ts` (new)

**Changes**:
- Create screenshot tests for brand theme
- Test critical screens with brand colors
- Compare against baseline images

**Acceptance**: Visual regression tests pass
**Risk**: Visual changes → update baseline images

### Task 10: E2E Tests
**Files**:
- `e2e/branding/brand-colors-logo.spec.ts` (new)

**Changes**:
- Test brand colors on login, home, and settings screens
- Test logo display on various screens
- Test fallback behavior

**Acceptance**: E2E tests pass on Android and iOS
**Risk**: E2E test failures → debug and fix

### Task 11: Documentation
**Files**:
- `docs/branding/brand-colors-logo.md` (new)
- `README.md` (modify)

**Changes**:
- Document brand color configuration
- Document logo asset requirements
- Document accessibility considerations

**Acceptance**: Clear documentation for brand theming
**Risk**: Missing documentation → user confusion

## 6. Impacted Areas & Compatibility

### Theming Pipeline
- **Impact**: Brand colors injected into SCSS variables
- **Compatibility**: Existing theme system remains unchanged

### Component Styling
- **Impact**: Components use brand color variables
- **Compatibility**: Existing component functionality preserved

### Asset Management
- **Impact**: Brand assets copied to standard locations
- **Compatibility**: Existing asset loading unchanged

### Accessibility
- **Impact**: Color contrast validation added
- **Compatibility**: Maintains or improves accessibility

### Performance
- **Impact**: Minimal impact on theme application
- **Compatibility**: No performance regression

## 7. Testing Plan

### Unit Tests
- **Color Validation**: Test brand color loading and validation
- **Theme Application**: Test brand theme service
- **Logo Component**: Test logo component with brand assets
- **Color Contrast**: Test color contrast validation

### Integration Tests
- **Theme Loading**: Test brand theme loading on app startup
- **Component Styling**: Test component color application
- **Asset Loading**: Test brand asset loading

### Visual Regression Tests
- **Screenshot Tests**: Compare brand theme against baseline
- **Critical Screens**: Test login, home, settings screens
- **Color Accuracy**: Verify brand colors are applied correctly

### E2E Tests
- **Brand Colors**: Test brand colors on key screens
- **Logo Display**: Test logo display on various screens
- **Fallback Behavior**: Test fallback when brand theme disabled

### Accessibility Tests
- **Color Contrast**: Test color contrast ratios
- **Screen Reader**: Test with screen readers
- **High Contrast**: Test with high contrast mode

## 8. CI/CD & Build Variants

### Build Scripts
```bash
# Build with brand theme
BRAND_ID=acme npm run build:android
BRAND_ID=acme npm run build:ios

# Build with default theme
npm run build:android
npm run build:ios
```

### Visual Regression Testing
```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests
on: [pull_request]
jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run visual regression tests
        run: npm run test:visual
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: screenshots/
```

### Asset Validation
```bash
# Pre-build asset validation
npm run validate:brand-assets -- --brand=acme
```

## 9. Risks, Mitigations, Rollback

### Risk: Poor color contrast accessibility issues
**Mitigation**: Automated color contrast validation + WCAG compliance checking
**Rollback**: Revert to default colors

### Risk: Logo asset sizing issues
**Mitigation**: Asset validation script + size requirements
**Rollback**: Use default logo assets

### Risk: Visual regressions
**Mitigation**: Comprehensive visual regression testing
**Rollback**: Revert theme changes

### Risk: Performance impact
**Mitigation**: Performance testing and monitoring
**Rollback**: Optimize theme application or disable feature

### Risk: Brand theme conflicts
**Mitigation**: Feature flag system + graceful fallback
**Rollback**: Disable brand theme enforcement

## 10. Acceptance Criteria

### Primary Criteria
- ✅ All major screens adopt primary/secondary brand colors when configured
- ✅ Logo displays correctly on login and header screens
- ✅ Brand colors meet WCAG AA contrast requirements
- ✅ Fallback to Moodle default theme when brand config missing
- ✅ No visual regressions compared to baseline

### Secondary Criteria
- ✅ Brand theme applied consistently across all components
- ✅ Logo assets load correctly and handle errors gracefully
- ✅ Color contrast validation prevents accessibility issues
- ✅ Performance impact <50ms for theme application
- ✅ Comprehensive test coverage >90%

## 11. Change Log & PR Plan

### PR 1: Brand Configuration Extension
**Files**: `src/core/services/brand-config.ts`, `src/types/brand-config.d.ts`
**Tests**: Unit tests for brand color and logo methods
**Docs**: Brand configuration schema documentation

### PR 2: Brand Theme Build System
**Files**: `gulp/task-build-brand-theme.js`, `gulpfile.js`
**Tests**: Build process tests
**Docs**: Build configuration documentation

### PR 3: Brand Theme Service
**Files**: `src/core/services/brand-theme.ts`, `src/core/guards/brand-theme.ts`
**Tests**: Theme service unit tests
**Docs**: Theme service documentation

### PR 4: Logo Component Updates
**Files**: `src/core/components/site-logo/site-logo.ts`, `src/core/components/site-logo/site-logo.html`
**Tests**: Logo component tests
**Docs**: Logo component documentation

### PR 5: Color Contrast Validation
**Files**: `src/core/utils/color-contrast.ts`
**Tests**: Color contrast validation tests
**Docs**: Accessibility documentation

### PR 6: Visual Regression Tests
**Files**: `e2e/visual/brand-theme.spec.ts`
**Tests**: Visual regression test suite
**Docs**: Visual testing documentation

### PR 7: E2E Tests & Documentation
**Files**: `e2e/branding/brand-colors-logo.spec.ts`, `docs/branding/brand-colors-logo.md`
**Tests**: E2E test suite
**Docs**: Complete user documentation

---

*This plan provides a comprehensive roadmap for implementing brand colors and logo functionality while maintaining visual consistency and accessibility standards.*
