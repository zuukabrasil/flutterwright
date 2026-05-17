import { defineConfig } from '@playwright/test';
import type { FlutterwrightOptions } from './src/test';

export default defineConfig<FlutterwrightOptions>({
  timeout: 60000,
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    flutterProjectPath: '../../example_app',
    flutterDeviceId: 'linux',
    
    screenshot: 'only-on-failure',
    video: 'on',
  },
});