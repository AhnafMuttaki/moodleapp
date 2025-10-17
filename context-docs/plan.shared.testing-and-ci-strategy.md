# Shared Testing and CI Strategy

## 1. Overview

This document outlines the shared testing and CI/CD strategy for both Initiative 1 (Preconfigured Site Login) and Initiative 2 (Brand Colors & Logo). The strategy ensures comprehensive testing coverage, maintains code quality, and supports multi-brand builds.

## 2. Testing Framework

### Unit Testing
**Framework**: Jest with Angular Testing Utilities
**Location**: `src/**/__tests__/`
**Coverage Target**: >90%

#### Brand Configuration Tests
```typescript
// src/core/services/__tests__/brand-config.spec.ts
describe('CoreBrandConfigService', () => {
  it('should load brand config from assets', async () => {
    const service = TestBed.inject(CoreBrandConfigService);
    const config = await service.getBrandConfig();
    expect(config).toBeDefined();
  });

  it('should validate brand colors', async () => {
    const service = TestBed.inject(CoreBrandConfigService);
    const colors = await service.getColors();
    expect(colors?.primary).toMatch(/^#[0-9A-F]{6}$/i);
  });
});
```

#### Navigation Guard Tests
```typescript
// src/core/features/login/guards/__tests__/preconfigured-site.spec.ts
describe('PreconfiguredSiteGuard', () => {
  it('should redirect to credentials when preconfigured site enabled', async () => {
    const guard = TestBed.inject(PreconfiguredSiteGuard);
    const result = await guard.canActivate();
    expect(result).toEqual(jasmine.objectContaining({
      path: '/login/credentials',
      queryParams: { siteUrl: 'https://lms.acme.com' }
    }));
  });
});
```

#### Theme Service Tests
```typescript
// src/core/services/__tests__/brand-theme.spec.ts
describe('CoreBrandThemeService', () => {
  it('should apply brand colors to CSS custom properties', async () => {
    const service = TestBed.inject(CoreBrandThemeService);
    await service.applyBrandTheme();

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--primary')).toBe('#0F4C81');
  });
});
```

### Integration Testing
**Framework**: Angular Testing Utilities with HTTP Testing
**Location**: `src/**/__tests__/integration/`

#### Brand Config Integration
```typescript
// src/core/services/__tests__/integration/brand-config-integration.spec.ts
describe('Brand Config Integration', () => {
  it('should load brand config during app initialization', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.detectChanges();

    const brandService = TestBed.inject(CoreBrandConfigService);
    const config = await brandService.getBrandConfig();
    expect(config).toBeDefined();
  });
});
```

#### Navigation Integration
```typescript
// src/core/features/login/__tests__/integration/navigation-integration.spec.ts
describe('Navigation Integration', () => {
  it('should navigate to preconfigured site login', async () => {
    const router = TestBed.inject(Router);
    const brandService = TestBed.inject(CoreBrandConfigService);

    spyOn(brandService, 'isPreconfiguredSiteEnabled').and.returnValue(true);
    spyOn(brandService, 'getSiteUrl').and.returnValue('https://lms.acme.com');

    await router.navigate(['/']);
    expect(router.url).toBe('/login/credentials?siteUrl=https://lms.acme.com');
  });
});
```

### E2E Testing
**Framework**: Playwright for Web, Appium for Mobile
**Location**: `e2e/`

#### Preconfigured Site E2E
```typescript
// e2e/login/preconfigured-site.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Preconfigured Site Login', () => {
  test('should skip site entry with preconfigured site', async ({ page }) => {
    // Mock brand config with preconfigured site
    await page.route('**/assets/brand-config.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          siteUrl: 'https://lms.acme.com',
          featureToggles: { preconfiguredSite: true }
        })
      });
    });

    await page.goto('/');
    await expect(page).toHaveURL('/login/credentials?siteUrl=https://lms.acme.com');
  });

  test('should show site entry without preconfigured site', async ({ page }) => {
    // Mock brand config without preconfigured site
    await page.route('**/assets/brand-config.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          featureToggles: { preconfiguredSite: false }
        })
      });
    });

    await page.goto('/');
    await expect(page).toHaveURL('/login/site');
  });
});
```

#### Brand Theme E2E
```typescript
// e2e/branding/brand-colors-logo.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Brand Colors & Logo', () => {
  test('should apply brand colors to login page', async ({ page }) => {
    // Mock brand config with colors
    await page.route('**/assets/brand-config.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          colors: {
            primary: '#0F4C81',
            secondary: '#F4A300'
          },
          featureToggles: { enforceBrandTheme: true }
        })
      });
    });

    await page.goto('/login/credentials');

    // Check primary color is applied
    const primaryButton = page.locator('ion-button[color="primary"]');
    await expect(primaryButton).toHaveCSS('background-color', 'rgb(15, 76, 129)');
  });

  test('should display brand logo', async ({ page }) => {
    // Mock brand config with logo
    await page.route('**/assets/brand-config.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          assets: {
            logo: 'assets/brands/acme/logo.png'
          }
        })
      });
    });

    await page.goto('/login/credentials');

    // Check logo is displayed
    const logo = page.locator('core-site-logo img');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', 'assets/brands/acme/logo.png');
  });
});
```

### Visual Regression Testing
**Framework**: Playwright with screenshot comparison
**Location**: `e2e/visual/`

#### Brand Theme Visual Tests
```typescript
// e2e/visual/brand-theme.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Brand Theme Visual Regression', () => {
  test('login page with brand theme', async ({ page }) => {
    // Mock brand config
    await page.route('**/assets/brand-config.json', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          colors: {
            primary: '#0F4C81',
            secondary: '#F4A300'
          },
          featureToggles: { enforceBrandTheme: true }
        })
      });
    });

    await page.goto('/login/credentials');
    await expect(page).toHaveScreenshot('login-page-brand-theme.png');
  });

  test('home page with brand theme', async ({ page }) => {
    // Mock authenticated state and brand config
    await page.goto('/main/home');
    await expect(page).toHaveScreenshot('home-page-brand-theme.png');
  });
});
```

## 3. CI/CD Pipeline

### GitHub Actions Workflow
**File**: `.github/workflows/branding-ci.yml`

```yaml
name: Branding CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        brand: [default, acme, university-x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build brand config
        run: |
          BRAND_ID=${{ matrix.brand }} npm run build:brand-config
        env:
          BRAND_ID: ${{ matrix.brand }}

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: coverage/lcov.info
          flags: ${{ matrix.brand }}

  e2e:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        brand: [default, acme, university-x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build brand config
        run: |
          BRAND_ID=${{ matrix.brand }} npm run build:brand-config
        env:
          BRAND_ID: ${{ matrix.brand }}

      - name: Install Playwright
        run: npx playwright install

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BRAND_ID: ${{ matrix.brand }}

      - name: Upload E2E results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: e2e-results-${{ matrix.brand }}
          path: test-results/

  visual-regression:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        brand: [default, acme, university-x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build brand config
        run: |
          BRAND_ID=${{ matrix.brand }} npm run build:brand-config
        env:
          BRAND_ID: ${{ matrix.brand }}

      - name: Install Playwright
        run: npx playwright install

      - name: Run visual regression tests
        run: npm run test:visual
        env:
          BRAND_ID: ${{ matrix.brand }}

      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        with:
          name: screenshots-${{ matrix.brand }}
          path: screenshots/

  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        brand: [default, acme, university-x]
        platform: [android, ios]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build brand config
        run: |
          BRAND_ID=${{ matrix.brand }} npm run build:brand-config
        env:
          BRAND_ID: ${{ matrix.brand }}

      - name: Build Android
        if: matrix.platform == 'android'
        run: |
          BRAND_ID=${{ matrix.brand }} npm run build:android
        env:
          BRAND_ID: ${{ matrix.brand }}

      - name: Build iOS
        if: matrix.platform == 'ios'
        run: |
          BRAND_ID=${{ matrix.brand }} npm run build:ios
        env:
          BRAND_ID: ${{ matrix.brand }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-${{ matrix.brand }}-${{ matrix.platform }}
          path: dist/
```

### Build Scripts
**File**: `package.json` (scripts section)

```json
{
  "scripts": {
    "build:brand-config": "gulp brand-config",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:visual": "playwright test --grep @visual",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "build:android": "ionic cordova build android --prod",
    "build:ios": "ionic cordova build ios --prod",
    "validate:brand-assets": "node scripts/validate-brand-assets.js"
  }
}
```

## 4. Test Data Management

### Brand Configuration Test Data
**Location**: `test-data/brands/`

```json
// test-data/brands/acme/brand-config.json
{
  "brandId": "acme",
  "displayName": "Acme Learning",
  "siteUrl": "https://lms.acme.com",
  "colors": {
    "primary": "#0F4C81",
    "secondary": "#F4A300",
    "surface": "#FFFFFF",
    "onPrimary": "#FFFFFF"
  },
  "assets": {
    "logo": "assets/brands/acme/logo.png",
    "splash": "assets/brands/acme/splash.png"
  },
  "featureToggles": {
    "preconfiguredSite": true,
    "enforceBrandTheme": true
  }
}
```

### Mock Services
**Location**: `src/testing/mocks/`

```typescript
// src/testing/mocks/brand-config.mock.ts
export class MockBrandConfigService {
  private mockConfig: any = null;

  setMockConfig(config: any) {
    this.mockConfig = config;
  }

  async getBrandConfig() {
    return this.mockConfig;
  }

  async getSiteUrl() {
    return this.mockConfig?.siteUrl || null;
  }

  async getColors() {
    return this.mockConfig?.colors || null;
  }

  isPreconfiguredSiteEnabled() {
    return this.mockConfig?.featureToggles?.preconfiguredSite || false;
  }

  isBrandThemeEnforced() {
    return this.mockConfig?.featureToggles?.enforceBrandTheme || false;
  }
}
```

## 5. Quality Gates

### Code Coverage Requirements
- **Unit Tests**: >90% coverage
- **Integration Tests**: >80% coverage
- **E2E Tests**: Critical user journeys covered

### Performance Requirements
- **App Startup**: No regression >100ms
- **Theme Application**: No regression >50ms
- **Asset Loading**: No regression >200ms

### Accessibility Requirements
- **Color Contrast**: WCAG AA compliance
- **Screen Reader**: Compatible with major screen readers
- **Keyboard Navigation**: Full keyboard accessibility

### Visual Regression Requirements
- **Critical Screens**: Login, Home, Settings
- **Brand Variations**: All supported brands
- **Platform Variations**: Android, iOS, Web

## 6. Monitoring and Reporting

### Test Results Dashboard
**Tool**: GitHub Actions + Codecov
**Metrics**:
- Test coverage by brand
- Test execution time
- Visual regression detection
- Build success rate

### Performance Monitoring
**Tool**: Lighthouse CI
**Metrics**:
- App startup time
- Theme application time
- Asset loading time
- Memory usage

### Accessibility Monitoring
**Tool**: axe-core
**Metrics**:
- Color contrast violations
- Accessibility score
- Screen reader compatibility

## 7. Troubleshooting Guide

### Common Test Failures

#### Brand Config Loading Failures
```bash
# Check brand config file exists
ls -la branding/{brand-id}/brand-config.json

# Validate JSON syntax
cat branding/{brand-id}/brand-config.json | jq .

# Check build process
BRAND_ID={brand-id} npm run build:brand-config
```

#### Visual Regression Failures
```bash
# Update baseline images
npm run test:visual -- --update-snapshots

# Check screenshot differences
npm run test:visual -- --reporter=html
```

#### E2E Test Failures
```bash
# Run tests in headed mode
npm run test:e2e -- --headed

# Debug specific test
npm run test:e2e -- --grep "preconfigured site"
```

### Performance Issues

#### Slow Test Execution
- Parallelize test execution
- Use test data caching
- Optimize mock services

#### Memory Leaks
- Monitor test memory usage
- Clean up test data
- Use proper test isolation

## 8. Maintenance Strategy

### Regular Updates
- **Weekly**: Review test coverage and performance metrics
- **Monthly**: Update test data and mock services
- **Quarterly**: Review and update CI/CD pipeline

### Test Data Management
- **Version Control**: All test data in version control
- **Backup**: Regular backup of test data
- **Cleanup**: Remove obsolete test data

### CI/CD Pipeline Maintenance
- **Dependencies**: Regular dependency updates
- **Security**: Security scanning and updates
- **Performance**: Monitor and optimize pipeline performance

---

*This shared testing and CI strategy ensures comprehensive coverage for both branding initiatives while maintaining code quality and supporting multi-brand builds.*
