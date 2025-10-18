# Sprint 1: Preconfigured Site Login Implementation

## Sprint Goal
**Enable build-time configuration of a Moodle site URL so the app skips the "Enter your site" screen and navigates directly to the Login screen for that site.**

**Test Site**: `http://localhost:8082`

## Sprint Overview
- **Duration**: 2 weeks (10 working days)
- **Team**: Senior Mobile App Developer + Scrum Master
- **Sprint Goal**: Implement preconfigured site login functionality with config file support
- **Definition of Done**: App navigates directly to login screen when site URL is configured

## Current State Analysis

### Existing Login Flow
1. **App Start** → `hasSitesGuard` checks for stored sites
2. **No Sites** → `CoreLoginHelper.getAddSiteRouteInfo()` determines route
3. **Route Decision**:
   - Demo mode → `/login/credentials?siteUrl={demoUrl}`
   - Single fixed site → `/login/credentials?siteUrl={siteUrl}`
   - Multiple/no sites → `/login/site` (site entry screen)

### Key Files Identified
- `src/core/features/login/services/login-helper.ts` - Route determination logic
- `src/core/features/login/guards/has-sites.ts` - Site existence guard
- `src/core/services/config.ts` - Configuration management
- `moodle.config.json` - Current configuration file
- `src/core/features/login/pages/site/site.ts` - Site entry page
- `src/core/features/login/pages/credentials/credentials.ts` - Login credentials page

## Sprint Backlog

### Epic: Preconfigured Site Login
**Story Points**: 21 points total

---

### Story 1: Brand Configuration Foundation
**Story Points**: 8 points
**Priority**: High
**Sprint**: 1

#### User Story
As a developer, I want to create a brand configuration system so that I can configure a preconfigured site URL at build time.

#### Acceptance Criteria
- [ ] Create `BrandConfig` interface with `siteUrl` and `preconfiguredSite` properties
- [ ] Create `CoreBrandConfigService` to load and validate brand configuration
- [ ] Create default brand configuration file
- [ ] Service exposes `getSiteUrl()` and `isPreconfiguredSiteEnabled()` methods
- [ ] Graceful fallback when brand config is missing or invalid

#### Tasks
1. **Create Brand Config Types** (2 points)
   - File: `src/types/brand-config.d.ts`
   - Define `BrandConfig` interface
   - Define `FeatureToggles` interface

2. **Create Brand Config Service** (3 points)
   - File: `src/core/services/brand-config.ts`
   - Implement `CoreBrandConfigService`
   - Add config loading and validation
   - Add error handling and fallbacks

3. **Create Default Brand Config** (1 point)
   - File: `branding/default-brand.json`
   - Define default configuration structure
   - Include test site URL: `http://localhost:8082`

4. **Unit Tests** (2 points)
   - File: `src/core/services/__tests__/brand-config.spec.ts`
   - Test config loading and validation
   - Test fallback behavior
   - Achieve >90% coverage

#### Definition of Done
- [ ] Brand config service loads configuration successfully
- [ ] Service validates configuration and provides fallbacks
- [ ] Unit tests pass with >90% coverage
- [ ] Code review completed
- [ ] Documentation updated

---

### Story 2: Build-Time Configuration Loading
**Story Points**: 5 points
**Priority**: High
**Sprint**: 1

#### User Story
As a developer, I want to load brand configuration at build time so that the app can access preconfigured site settings.

#### Acceptance Criteria
- [ ] Create Gulp task to copy brand config based on `BRAND_ID` environment variable
- [ ] Brand config copied to `src/assets/brand-config.json` during build
- [ ] Fallback to default config when brand config is missing
- [ ] Integration with existing build pipeline

#### Tasks
1. **Create Brand Config Build Task** (2 points)
   - File: `gulp/task-build-brand-config.js`
   - Implement Gulp task for brand config copying
   - Add environment variable support

2. **Integrate with Build Pipeline** (1 point)
   - File: `gulpfile.js`
   - Add brand config task to build pipeline
   - Ensure proper task ordering

3. **Add Build Scripts** (1 point)
   - File: `package.json`
   - Add `build:brand-config` script
   - Add `BRAND_ID` environment variable support

4. **Integration Tests** (1 point)
   - Test build process with different brand configs
   - Verify config copying works correctly

#### Definition of Done
- [ ] Brand config copied to assets during build
- [ ] Build process works with `BRAND_ID` environment variable
- [ ] Fallback behavior works when brand config is missing
- [ ] Integration tests pass
- [ ] Build documentation updated

---

### Story 3: Preconfigured Site Navigation Guard
**Story Points**: 5 points
**Priority**: High
**Sprint**: 1

#### User Story
As a user, I want the app to skip the site entry screen when a site is preconfigured so that I can login directly.

#### Acceptance Criteria
- [ ] Create `PreconfiguredSiteGuard` that checks brand configuration
- [ ] Guard redirects to credentials page with siteUrl when preconfigured site is enabled
- [ ] Guard falls back to site entry when preconfigured site is disabled
- [ ] Guard integrates with existing login flow

#### Tasks
1. **Create Preconfigured Site Guard** (2 points)
   - File: `src/core/features/login/guards/preconfigured-site.ts`
   - Implement guard logic
   - Add route redirection logic

2. **Integrate Guard with Login Module** (1 point)
   - File: `src/core/features/login/login.module.ts`
   - Add guard to login module
   - Ensure proper guard ordering

3. **Update Login Helper** (1 point)
   - File: `src/core/features/login/services/login-helper.ts`
   - Modify `getAddSiteRouteInfo()` to check preconfigured site
   - Maintain backward compatibility

4. **Unit Tests** (1 point)
   - File: `src/core/features/login/guards/__tests__/preconfigured-site.spec.ts`
   - Test guard logic with various configurations
   - Test fallback behavior

#### Definition of Done
- [ ] Guard correctly routes based on preconfigured site configuration
- [ ] Guard integrates with existing login flow
- [ ] Unit tests pass with >90% coverage
- [ ] Code review completed
- [ ] Integration tests pass

---

### Story 4: E2E Testing and Validation
**Story Points**: 3 points
**Priority**: Medium
**Sprint**: 1

#### User Story
As a developer, I want comprehensive E2E tests so that I can verify the preconfigured site functionality works correctly.

#### Acceptance Criteria
- [ ] E2E tests for preconfigured site enabled scenario
- [ ] E2E tests for preconfigured site disabled scenario
- [ ] E2E tests for navigation to login credentials page
- [ ] Tests run on both Android and iOS

#### Tasks
1. **Create E2E Test Suite** (2 points)
   - File: `e2e/login/preconfigured-site.spec.ts`
   - Test cold start with preconfigured site enabled
   - Test cold start with preconfigured site disabled
   - Test navigation to login credentials page

2. **Test Configuration** (1 point)
   - Configure test environment
   - Set up test data for `http://localhost:8082`
   - Ensure tests run in CI/CD pipeline

#### Definition of Done
- [ ] E2E tests pass on Android and iOS
- [ ] Tests cover all critical user journeys
- [ ] Tests run in CI/CD pipeline
- [ ] Test documentation updated

## Technical Implementation Details

### Brand Configuration Schema
```json
{
  "brandId": "default",
  "displayName": "Moodle Mobile",
  "siteUrl": "http://localhost:8082",
  "featureToggles": {
    "preconfiguredSite": true
  }
}
```

### Navigation Flow
```
App Start → hasSitesGuard → PreconfiguredSiteGuard
├─ preconfiguredSite: true + siteUrl exists → /login/credentials?siteUrl={siteUrl}
└─ preconfiguredSite: false OR siteUrl missing → /login/site (current flow)
```

### Build Process
```bash
# Build with preconfigured site
BRAND_ID=default npm run build:android
BRAND_ID=default npm run build:ios

# Build with default behavior
npm run build:android
npm run build:ios
```

## Risk Assessment

### High Risk
- **Navigation Guard Conflicts**: Risk of guard ordering issues
  - **Mitigation**: Test guard order and priority
  - **Rollback**: Remove preconfigured site guard

### Medium Risk
- **Configuration Loading Failure**: Risk of config loading errors
  - **Mitigation**: Comprehensive error handling and fallbacks
  - **Rollback**: Disable preconfigured site flag

### Low Risk
- **Performance Impact**: Risk of startup time regression
  - **Mitigation**: Performance testing and monitoring
  - **Rollback**: Optimize config loading

## Testing Strategy

### Unit Tests
- Brand config service loading and validation
- Guard logic with various configurations
- Fallback behavior testing

### Integration Tests
- App startup with preconfigured site
- Navigation flow testing
- Configuration loading integration

### E2E Tests
- Cold start with preconfigured site enabled
- Cold start with preconfigured site disabled
- Login flow with preconfigured site

### Performance Tests
- App startup time monitoring
- Configuration loading performance
- Memory usage during config loading

## Sprint Planning

### Week 1
- **Day 1-2**: Story 1 (Brand Configuration Foundation)
- **Day 3-4**: Story 2 (Build-Time Configuration Loading)
- **Day 5**: Story 3 (Preconfigured Site Navigation Guard) - Start

### Week 2
- **Day 1-2**: Story 3 (Preconfigured Site Navigation Guard) - Complete
- **Day 3-4**: Story 4 (E2E Testing and Validation)
- **Day 5**: Sprint Review and Retrospective

## Definition of Done

### Code Quality
- [ ] All code follows project coding standards
- [ ] Unit tests pass with >90% coverage
- [ ] Integration tests pass
- [ ] E2E tests pass on Android and iOS
- [ ] Code review completed

### Functionality
- [ ] App navigates directly to login screen when site URL is configured
- [ ] App falls back to site entry screen when preconfigured site is disabled
- [ ] Configuration loading works correctly
- [ ] Error handling and fallbacks work properly

### Documentation
- [ ] Technical documentation updated
- [ ] User documentation updated
- [ ] API documentation updated
- [ ] Troubleshooting guide created

### Deployment
- [ ] Build process works with brand configuration
- [ ] CI/CD pipeline updated
- [ ] Performance benchmarks met
- [ ] Security review completed

## Success Metrics

### Functional Metrics
- [ ] Preconfigured site login works with `http://localhost:8082`
- [ ] Fallback to site entry works when preconfigured site is disabled
- [ ] No regression in existing login functionality

### Quality Metrics
- [ ] Unit test coverage >90%
- [ ] E2E test coverage for critical paths
- [ ] Performance regression <100ms
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

*This sprint plan provides a comprehensive roadmap for implementing preconfigured site login functionality while maintaining code quality and following agile best practices.*
