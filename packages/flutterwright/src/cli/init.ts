#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

/**
 * CLI Scaffolding Tool for Flutterwright
 * Automatically configures E2E testing environments on target repositories.
 */
function initializeWorkspace() {
  const targetDir = process.cwd();
  console.log('Initializing Flutterwright automation footprint inside your workspace...');

  const testDir = path.join(targetDir, 'tests');
  const e2eDir = path.join(testDir, 'e2e');
  const configPath = path.join(targetDir, 'playwright.config.ts');
  const sampleTestPath = path.join(e2eDir, 'welcome.spec.ts');

  if (!fs.existsSync(e2eDir)) {
    fs.mkdirSync(e2eDir, { recursive: true });
    console.log('Created directory structure: ./tests/e2e');
  }

  const playwrightConfigTemplate = `import { defineConfig } from '@playwright/test';
import type { FlutterwrightOptions } from 'flutterwright';

/**
 * Official Playwright configuration mapping for Flutterwright execution engine.
 * See https://playwright.dev/docs/test-configuration for options.
 */
export default defineConfig<FlutterwrightOptions>({
  timeout: 60000,
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Relative path to your Flutter project root directory OR to a pre-compiled debug/profile .apk file
    flutterProjectPath: 'your-app.apk',
    flutterDeviceId: 'emulator-5554',
    
    // Automation visual capturing evidence configuration options
    screenshot: 'only-on-failure',
    video: 'on',
  },
});
`;

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, playwrightConfigTemplate, 'utf8');
    console.log('Generated baseline configuration: ./playwright.config.ts');
  } else {
    console.log('Skipping: playwright.config.ts already exists in this directory structure.');
  }

  // 4. Generate boilerplate sample test specs file
  const sampleTestTemplate = `import { test, expect } from 'flutterwright';

test.describe('Application Sanity E2E Suite', () => {

  test('should cross-verify home view rendering targets successfully', async ({ flutterApp }) => {
    // Replace selectors with keys corresponding to ValueKey definitions in your Flutter widgets
    const welcomeText = flutterApp.locator('welcome-txt');

    // Smart polling engine verifies structural layout stabilization natively
    expect(await welcomeText.innerText()).toBe('Preencha seu nome');
  });

});
`;

  if (!fs.existsSync(sampleTestPath)) {
    fs.writeFileSync(sampleTestPath, sampleTestTemplate, 'utf8');
    console.log('Generated boilerplate sample test specs: ./tests/e2e/welcome.spec.ts');
  }

  console.log('\\nFlutterwright initialization complete! Update your "flutterProjectPath" inside playwright.config.ts to begin orchestrating tests.\\n');
}

initializeWorkspace();