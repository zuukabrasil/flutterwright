import { test as base } from '@playwright/test';
import { Flutterwright } from './flutterwright';
import * as path from 'path';
import * as fs from 'fs';

export type FlutterwrightFixtures = {
  flutterApp: Flutterwright;
};


export type FlutterwrightOptions = {
  flutterProjectPath: string;
  flutterDeviceId?: string;
};

export const test = base.extend<FlutterwrightFixtures & FlutterwrightOptions>({
  flutterProjectPath: ['', { option: true }],
  flutterDeviceId: ['linux', { option: true }],

  flutterApp: async ({ flutterProjectPath, flutterDeviceId, screenshot, video }, use, testInfo) => {
    const app = new Flutterwright();
    
    if (flutterProjectPath) {
      await app.launch(flutterProjectPath, flutterDeviceId || 'linux');
    }

    const safeTestName = testInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
    const outputDir = path.join(process.cwd(), 'test-results', safeTestName);

    if (video && video !== 'off') {
      const videoDir = path.join(outputDir, 'video');
      await (app as any).startVideoRecording(videoDir, safeTestName);
    }

    await use(app);

    if (video && video !== 'off') {
      await (app as any).stopVideoRecording();
    }

    if (testInfo.status !== testInfo.expectedStatus) {
      if (screenshot && screenshot !== 'off') {
        const screenshotPath = path.join(outputDir, 'screenshots', 'failure_viewport.png');
        try {
          await app.screenshot({ path: screenshotPath });
          testInfo.attachments.push({
            name: 'screenshot',
            path: screenshotPath,
            contentType: 'image/png'
          });
        } catch (e) {
          console.error(`Failed to record failure artifact: ${e}`);
        }
      }
    }

    await app.disconnect();
  },
});

export { expect } from '@playwright/test';