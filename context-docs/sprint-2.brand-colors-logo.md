# Sprint 2: Brand Colors & Logo Implementation

## Sprint Goal
**Enable build-time configuration of brand colors and logo so the app adopts the configured brand tokens instead of Moodle's default orange branding.**

**Current State**: App launches with preconfigured site but still shows Moodle's orange branding and logo
**Target State**: App displays custom brand colors and logo based on configuration file

## Sprint Overview
- **Duration**: 2 weeks (10 working days)
- **Team**: Senior Mobile App Developer + Scrum Master
- **Sprint Goal**: Implement brand colors and logo configuration with config file support
- **Definition of Done**: App displays custom brand colors and logo when configured

## Current State Analysis

### Existing Theming System
1. **SCSS Variables**: `src/theme/globals.variables.scss` defines `$brand-color: #f98012`
2. **CSS Custom Properties**: `src/theme/theme.light.scss` uses `--primary`, `--primary-contrast`
3. **Logo Components**: `src/core/components/site-logo/site-logo.ts` shows fallback logos
4. **Brand Config**: Already implemented in Sprint 1 with `CoreBrandConfigService`

### Key Files Identified
- `src/theme/globals.variables.scss` - SCSS variables including `$brand-color`
- `src/theme/theme.light.scss` - CSS custom properties for theming
- `src/core/components/site-logo/site-logo.ts` - Logo component
- `src/core/services/brand-config.ts` - Brand configuration service (Sprint 1)
- `src/types/brand-config.d.ts` - Brand config types (Sprint 1)
- `gulp/task-build-brand-config.js` - Build task for brand config (Sprint 1)

## Sprint Backlog

### Epic: Brand Colors & Logo
**Story Points**: 24 points total

---

### Story 1: Extend Brand Configuration for Colors & Assets
**Story Points**: 6 points
**Priority**: High
**Sprint**: 2

#### User Story
As a developer, I want to extend the brand configuration system to support colors and logo assets so that I can configure brand theming at build time.

#### Acceptance Criteria
- [ ] Extend `BrandConfig` interface with `colors` and `assets` properties
- [ ] Add `BrandColors` and `BrandAssets` interfaces
- [ ] Extend `CoreBrandConfigService` with color and asset methods
- [ ] Add color validation and contrast checking
- [ ] Service exposes `getColors()`, `getLogoAsset()`, `isBrandThemeEnforced()` methods

#### Tasks
1. **Extend Brand Config Types** (2 points)
   - File: `src/types/brand-config.d.ts`
   - Add `BrandColors` interface with primary, secondary, surface colors
   - Add `BrandAssets` interface with logo, splash, appIcon paths
   - Add `enforceBrandTheme` feature toggle

2. **Extend Brand Config Service** (2 points)
   - File: `src/core/services/brand-config.ts`
   - Add `getColors()` method
   - Add `getLogoAsset(type: 'login' | 'top')` method
   - Add `isBrandThemeEnforced()` method
   - Add color validation utilities

3. **Add Color Validation** (1 point)
   - File: `src/core/utils/color-validation.ts`
   - Implement hex color validation
   - Implement color contrast validation (WCAG AA)
   - Add color utility functions

4. **Unit Tests** (1 point)
   - File: `src/core/services/__tests__/brand-config.spec.ts`
   - Test color and asset methods
   - Test color validation
   - Test fallback behavior

#### Definition of Done
- [ ] Brand config service exposes color and asset methods
- [ ] Color validation works correctly
- [ ] Unit tests pass with >90% coverage
- [ ] Code review completed
- [ ] Documentation updated

---

### Story 2: Create Brand Theme Build System
**Story Points**: 5 points
**Priority**: High
**Sprint**: 2

#### User Story
As a developer, I want to generate brand-specific SCSS variables and copy brand assets at build time so that the app can use custom branding.

#### Acceptance Criteria
- [ ] Create Gulp task to generate brand-specific SCSS variables
- [ ] Inject brand colors into SCSS variables
- [ ] Copy brand assets to appropriate locations
- [ ] Generate CSS custom properties from brand colors
- [ ] Fallback to default theme when brand config is missing

#### Tasks
1. **Create Brand Theme Build Task** (2 points)
   - File: `gulp/task-build-brand-theme.js`
   - Implement SCSS variable generation
   - Implement asset copying logic
   - Add environment variable support

2. **Integrate with Build Pipeline** (1 point)
   - File: `gulpfile.js`
   - Add brand theme task to build pipeline
   - Ensure proper task ordering with brand config

3. **Create SCSS Generation Logic** (1 point)
   - Generate `$brand-color` from brand config
   - Generate CSS custom properties
   - Handle color variations (shade, tint, contrast)

4. **Integration Tests** (1 point)
   - Test SCSS generation with different brand configs
   - Test asset copying works correctly
   - Verify fallback behavior

#### Definition of Done
- [ ] Brand SCSS variables generated correctly
- [ ] Brand assets copied to appropriate locations
- [ ] Build process works with brand theming
- [ ] Integration tests pass
- [ ] Build documentation updated

---

### Story 3: Create Brand Theme Service
**Story Points**: 4 points
**Priority**: High
**Sprint**: 2

#### User Story
As a developer, I want a brand theme service to manage theme application so that the app can dynamically apply brand colors.

#### Acceptance Criteria
- [ ] Create `CoreBrandThemeService` to manage theme application
- [ ] Handle CSS custom property injection
- [ ] Provide theme validation and fallback
- [ ] Apply brand colors to root CSS variables
- [ ] Handle theme switching and updates

#### Tasks
1. **Create Brand Theme Service** (2 points)
   - File: `src/core/services/brand-theme.ts`
   - Implement theme application logic
   - Add CSS custom property injection
   - Add theme validation

2. **Create Brand Theme Guard** (1 point)
   - File: `src/core/guards/brand-theme.ts`
   - Create guard to enforce brand theme on app startup
   - Apply brand colors to CSS custom properties
   - Handle theme fallback scenarios

3. **Unit Tests** (1 point)
   - File: `src/core/services/__tests__/brand-theme.spec.ts`
   - Test theme application logic
   - Test CSS custom property injection
   - Test fallback behavior

#### Definition of Done
- [ ] Brand theme service applies colors correctly
- [ ] CSS custom properties injected properly
- [ ] Theme guard works on app startup
- [ ] Unit tests pass with >90% coverage
- [ ] Code review completed

---

### Story 4: Update Logo Component for Brand Assets
**Story Points**: 4 points
**Priority**: High
**Sprint**: 2

#### User Story
As a user, I want to see the configured brand logo instead of Moodle's default logo so that the app reflects my organization's branding.

#### Acceptance Criteria
- [ ] Update `CoreSiteLogoComponent` to use brand logo when available
- [ ] Add fallback logic for missing brand assets
- [ ] Maintain existing site logo functionality
- [ ] Support different logo types (login, top, splash)
- [ ] Handle logo loading errors gracefully

#### Tasks
1. **Update Logo Component** (2 points)
   - File: `src/core/components/site-logo/site-logo.ts`
   - Add brand logo support
   - Implement fallback logic
   - Add logo type handling

2. **Update Logo Template** (1 point)
   - File: `src/core/components/site-logo/site-logo.html`
   - Update template to show brand logo
   - Add error handling for missing logos

3. **Unit Tests** (1 point)
   - File: `src/core/components/site-logo/__tests__/site-logo.spec.ts`
   - Test brand logo display
   - Test fallback behavior
   - Test error handling

#### Definition of Done
- [ ] Logo component shows brand logo when configured
- [ ] Fallback to default logo works correctly
- [ ] Error handling works for missing logos
- [ ] Unit tests pass with >90% coverage
- [ ] Code review completed

---

### Story 5: Apply Brand Colors to Components
**Story Points**: 3 points
**Priority**: Medium
**Sprint**: 2

#### User Story
As a user, I want to see the configured brand colors throughout the app so that the interface reflects my organization's branding.

#### Acceptance Criteria
- [ ] Update component styles to use brand color variables
- [ ] Ensure proper color contrast and accessibility
- [ ] Apply brand colors to critical components (buttons, headers, tabs)
- [ ] Maintain existing component functionality
- [ ] Support both light and dark themes

#### Tasks
1. **Update Component Styles** (2 points)
   - File: `src/theme/components/ionic.scss`
   - Update Ionic component colors
   - Ensure proper color contrast
   - Add brand color variables

2. **Update Critical Components** (1 point)
   - Update login page components
   - Update header and navigation components
   - Update button and form components

#### Definition of Done
- [ ] Components use brand colors when theme is enforced
- [ ] Color contrast meets accessibility standards
- [ ] Critical components styled with brand colors
- [ ] Visual regression tests pass
- [ ] Code review completed

---

### Story 6: Visual Regression Testing
**Story Points**: 2 points
**Priority**: Medium
**Sprint**: 2

#### User Story
As a developer, I want visual regression tests to ensure brand theming doesn't break the UI so that I can maintain visual consistency.

#### Acceptance Criteria
- [ ] Create screenshot tests for brand theme
- [ ] Test critical screens with brand colors
- [ ] Compare against baseline images
- [ ] Test both enabled and disabled brand theme scenarios

#### Tasks
1. **Create Visual Regression Tests** (2 points)
   - File: `e2e/visual/brand-theme.spec.ts`
   - Test login page with brand theme
   - Test home page with brand theme
   - Test settings page with brand theme
   - Create baseline images

#### Definition of Done
- [ ] Visual regression tests pass
- [ ] Screenshots match baseline images
- [ ] Tests cover critical screens
- [ ] Test documentation updated

## Technical Implementation Details

### Extended Brand Configuration Schema
```json
{
  "brandId": "my-brand",
  "displayName": "My Organization Mobile",
  "siteUrl": "http://localhost:8081",
  "colors": {
    "primary": "#1e3a8a",
    "secondary": "#3b82f6",
    "surface": "#ffffff",
    "onPrimary": "#ffffff",
    "onSecondary": "#000000",
    "onSurface": "#282828"
  },
  "assets": {
    "logo": "assets/brands/my-brand/logo.png",
    "splash": "assets/brands/my-brand/splash.png",
    "appIcon": "assets/brands/my-brand/icon.png"
  },
  "featureToggles": {
    "preconfiguredSite": true,
    "enforceBrandTheme": true
  }
}
```

### SCSS Variable Mapping
```scss
// Generated from brand config
$brand-color: #1e3a8a !default;
$primary: $brand-color !default;
$secondary: #3b82f6 !default;
$surface: #ffffff !default;
```

### CSS Custom Property Injection
```scss
:root {
  --primary: #1e3a8a;
  --primary-contrast: #ffffff;
  --primary-shade: #1a3a7a;
  --primary-tint: #2a4a9a;
  --secondary: #3b82f6;
  --surface: #ffffff;
}
```

### Theme Application Flow
```
Brand Config Load → Check enforceBrandTheme flag
├─ true + colors exist → Generate SCSS → Apply to components → Show brand logo
└─ false OR colors missing → Use default Moodle theme → Show default logo
```

## Risk Assessment

### High Risk
- **Color Contrast Issues**: Risk of accessibility violations with custom colors
  - **Mitigation**: Automated color contrast validation + WCAG compliance checking
  - **Rollback**: Revert to default colors

- **Visual Regressions**: Risk of UI breaking with brand theming
  - **Mitigation**: Comprehensive visual regression testing
  - **Rollback**: Disable brand theme enforcement

### Medium Risk
- **Logo Asset Issues**: Risk of logo loading failures
  - **Mitigation**: Asset validation script + size requirements
  - **Rollback**: Use default logo assets

- **Performance Impact**: Risk of theme application slowing down app
  - **Mitigation**: Performance testing and monitoring
  - **Rollback**: Optimize theme application or disable feature

### Low Risk
- **Brand Theme Conflicts**: Risk of theme conflicts with existing styles
  - **Mitigation**: Feature flag system + graceful fallback
  - **Rollback**: Disable brand theme enforcement

## Testing Strategy

### Unit Tests
- Brand config service color and asset methods
- Brand theme service theme application
- Logo component with brand assets
- Color validation and contrast checking

### Integration Tests
- Brand theme loading on app startup
- Component color application
- Asset loading and fallback behavior

### Visual Regression Tests
- Screenshot tests for brand theme
- Critical screens (login, home, settings)
- Color accuracy verification

### E2E Tests
- Brand colors on key screens
- Logo display on various screens
- Fallback behavior when brand theme disabled

### Accessibility Tests
- Color contrast ratios
- Screen reader compatibility
- High contrast mode support

## Sprint Planning

### Week 1
- **Day 1-2**: Story 1 (Extend Brand Configuration for Colors & Assets)
- **Day 3-4**: Story 2 (Create Brand Theme Build System)
- **Day 5**: Story 3 (Create Brand Theme Service) - Start

### Week 2
- **Day 1-2**: Story 3 (Create Brand Theme Service) - Complete
- **Day 3**: Story 4 (Update Logo Component for Brand Assets)
- **Day 4**: Story 5 (Apply Brand Colors to Components)
- **Day 5**: Story 6 (Visual Regression Testing) + Sprint Review

## Definition of Done

### Code Quality
- [ ] All code follows project coding standards
- [ ] Unit tests pass with >90% coverage
- [ ] Integration tests pass
- [ ] Visual regression tests pass
- [ ] Code review completed

### Functionality
- [ ] App displays custom brand colors when configured
- [ ] App shows custom brand logo when configured
- [ ] Brand theme applies consistently across components
- [ ] Fallback to default theme works when brand config is missing
- [ ] Color contrast meets accessibility standards

### Documentation
- [ ] Technical documentation updated
- [ ] User documentation updated
- [ ] Brand configuration guide updated
- [ ] Troubleshooting guide updated

### Deployment
- [ ] Build process works with brand theming
- [ ] CI/CD pipeline updated
- [ ] Performance benchmarks met
- [ ] Accessibility review completed

## Success Metrics

### Functional Metrics
- [ ] Brand colors display correctly on all major screens
- [ ] Brand logo displays correctly on login and header screens
- [ ] Brand theme applies consistently across components
- [ ] Fallback behavior works when brand theme is disabled

### Quality Metrics
- [ ] Unit test coverage >90%
- [ ] Visual regression test coverage for critical screens
- [ ] Performance regression <50ms for theme application
- [ ] Color contrast meets WCAG AA standards
- [ ] Zero critical bugs

### Process Metrics
- [ ] All stories completed within sprint
- [ ] All acceptance criteria met
- [ ] Code review completed for all changes
- [ ] Documentation updated

## Sprint Retrospective Questions

### What went well?
- Which stories were completed successfully?
- What technical decisions worked well?
- What processes helped the team?

### What could be improved?
- Which stories had challenges?
- What technical issues were encountered?
- What processes could be improved?

### Action Items
- What changes will be made for the next sprint?
- What technical debt needs to be addressed?
- What process improvements will be implemented?

---

*This sprint plan provides a comprehensive roadmap for implementing brand colors and logo functionality while maintaining visual consistency and accessibility standards.*
