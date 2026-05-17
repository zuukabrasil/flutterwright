import { Flutterwright } from './flutterwright';
export type FlutterwrightFixtures = {
    flutterApp: Flutterwright;
};
export type FlutterwrightOptions = {
    flutterProjectPath: string;
    flutterDeviceId?: string;
};
export declare const test: import("@playwright/test").TestType<import("@playwright/test").PlaywrightTestArgs & import("@playwright/test").PlaywrightTestOptions & FlutterwrightFixtures & FlutterwrightOptions, import("@playwright/test").PlaywrightWorkerArgs & import("@playwright/test").PlaywrightWorkerOptions>;
export { expect } from '@playwright/test';
