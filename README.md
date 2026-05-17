# Flutterwright

A next-generation E2E automation testing tool for Flutter applications, heavily inspired by the **Playwright** ecosystem, conventions, and API.

**Flutterwright** allows you to orchestrate and test native Flutter applications (Linux, Android, iOS, macOS, Windows) from a Node.js environment using JavaScript or TypeScript. Unlike traditional tools such as Appium, Flutterwright connects directly to the **Dart VM Service** via WebSockets and injects physical event streams directly into the Flutter graphic layout engine, ensuring ultra-fast, reliable, and flake-free test execution.

---

## System Architecture

The framework is divided into three main components working in perfect synchronicity:

1. **`flutterwright` CLI & Core (Node.js / NPM)**: The TypeScript SDK used to write and run test suites. It manages the lifecycle of the application process, handles automated project environment scaffolding, dynamically captures the Dart VM debugging parameters, and transmits JSON-RPC commands over WebSockets.
2. **`flutterwright_driver` (Dart / Pub.dev)**: The internal agent embedded inside your Flutter application as a development dependency. It hooks directly into the Dart VM service extensions to find widgets and execute real hardware-level interactions within the Flutter widget tree.

---

## Key Features

* **📦 Pre-compiled Binary Loading**: Pass a source code folder trajectory or link a pre-compiled debug/profile `.apk` file directly. When an APK is linked, the engine skips compilation, flashing the binary straight to target emulators in under 3 seconds.
* **🪄 Zero-Config Scaffolding**: Spin up enterprise test repositories instantly using the built-in CLI workspace generator tool.
* **⏱️ Integrated Smart Auto-Waiting**: Features an internal retry polling loop for all locators and element interactions. Tests seamlessly wait for elements to render, stabilize, or text states to update without requiring a single line of manual `sleep` or `setTimeout`.
* **📈 Multi-Element & Scoped Locators**: Find lists or repetitive card components with `.count()`, slice target nodes via `.nth(index)`, and cleanly cascade child elements from master layout boundaries.
* **🖐️ Advanced Gesture Interpolation**: Full support for real physical interactions including standard `click()`, variable-speed `swipe()`, sustained `longPress()`, rapid `doubleClick()`, and cursor alignment `hover()` tracks.
* **⌨️ Simulated Human Typing (`fill`)**: Streamlined character-by-character text injection with synchronous frame rendering updates to guarantee the flawless firing of input masks, form validation constraints, and listeners.
* **🎥 Automated Visual Evidence**: Native layout screenshot captures (`screenshot()`) alongside progressive frame-by-frame background session video recording capturing failures in real-time.
* **🏁 Graceful Teardown Handling**: Automatically transmits interactive termination sequences to the underlying engine runtime, preventing zombie isolate processes or port allocation blocks on host machines.

---

## Monorepo Structure

```text
flutterwright/
├── packages/
│   ├── flutterwright/            # Node.js Core Package & CLI (TypeScript) -> Published to NPM
│   │   ├── src/                  # Core source code engine (.ts)
│   │   ├── dist/                 # Production compiled distribution (.js, .d.ts)
│   │   └── package.json          
│   │
│   └── flutterwright_driver/     # Dart Native Instrumentation Agent -> Published to Pub.dev
│       ├── lib/                  # Service extension tracking controllers (.dart)
│       └── pubspec.yaml          
│
└── example_app/                  # Application for test validation
```

## Setup and Usage

#### 1. Configure the Flutter Target Application
Add the remote automation agent to your development dependencies block in your pubspec.yaml file:

```
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutterwright_driver:
    path: ../packages/flutterwright_driver # Or the version published to pub.dev

```

Inside your application entry execution layer (lib/main.dart), initialize the Flutterwright driver prior to launching the master widget layout tree application structure:

```
import 'package:flutter/material.dart';
import 'package:flutterwright_driver/flutterwright_driver.dart';

void main() {
  // Ensures proper prior initialization of internal element bindings
  WidgetsFlutterBinding.ensureInitialized();
  
  // Activates the custom automation extension channels inside the Dart VM
  FlutterwrightDriver.enable();
  
  runApp(const MyApp());
}

```

Ensure targeted interactive elements are tagged with an explicit identifier key (ValueKey):

```
TextField(
  key: const ValueKey('name-input'),
  controller: _controller,
),
ElevatedButton(
  key: const ValueKey('submit-btn'),
  onPressed: () => print('Submitted!'),
  child: const Text('Confirmar'),
)

```

#### 2. Scaffold Your Test Workspace Automatically
In your testing repository or project root directory, run our zero-config CLI initializer to set up the Playwright testing harness ecosystem instantly:

```
# Inits layout files, standard configurations, and a sample test spec file
npx flutterwright
```
The tool will provision a standard ./tests/e2e/ folder framework structure and deliver a pre-configured playwright.config.ts blueprint config file to your root directory.

#### 3. Understanding the Configuration Layout (playwright.config.ts)
The generated configuration maps your specific engine setups alongside native Playwright options:

```
import { defineConfig } from '@playwright/test';
import type { FlutterwrightOptions } from 'flutterwright';

export default defineConfig<FlutterwrightOptions>({
  timeout: 60000,
  testDir: './tests/e2e',
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Relative path to your Flutter project root directory OR to a pre-compiled debug/profile .apk file
    flutterProjectPath: '../example_app',
    
    // Target device tracking criteria handle destination
    flutterDeviceId: 'linux', // Use 'emulator-5554' or device IDs for mobile execution
    
    // Automated visual capturing evidence settings
    screenshot: 'only-on-failure',
    video: 'on',
  },
});
```

#### 4. Writing E2E Tests (tests/e2e/welcome.spec.ts)
You can now compose clean, declarative E2E automation scripts using standard Playwright runner extensions and our fully custom fluent locator APIs:

```
import { test, expect } from 'flutterwright';

test.describe('Welcome Screen & Gestures E2E Suite', () => {

  test('should fill the user name and update the welcome header successfully', async ({ flutterApp }) => {
    const nameInput = flutterApp.locator('name-input');
    const confirmButton = flutterApp.locator('submit-btn');
    const welcomeText = flutterApp.locator('welcome-txt');

    // 1. Validate initial UI text state
    expect(await welcomeText.innerText()).toBe('Preencha seu nome');

    // 2. Perform human-like text typing and click interactions
    await nameInput.fill('Lucas Rafael');
    await confirmButton.click();

    // 3. Smart polling assertion automatically waits for the frame pipeline to update
    await welcomeText.waitForText('Olá, Lucas Rafael! (Standard Tap)');
  });

  test('should validate multi-element counting and index-based operations via list hierarchy', async ({ flutterApp }) => {
    const itemWrapper = flutterApp.locator('item-wrapper-0');
    const itemCard = itemWrapper.locator('item-index-0');
    const deleteButton = itemWrapper.locator('delete-btn');
    const welcomeText = flutterApp.locator('welcome-txt');

    // 1. Query the rendering branch to evaluate array count matching length
    const matchCount = await itemWrapper.count();
    expect(matchCount).toBeGreaterThanOrEqual(1);

    // 2. Isolate element specifically at index 0 via .nth() and fire a swipe gesture
    await itemCard.nth(0).swipe('left', { distance: 250, steps: 15 });

    // 3. Coordinate action on child elements revealed by the swipe gesture
    await deleteButton.click();

    // 4. Assert the final structural layout state transition
    await welcomeText.waitForText('Record Deleted Successfully');
  });

  test('should execute advanced physical gestures seamlessly', async ({ flutterApp }) => {
    const nameInput = flutterApp.locator('name-input');
    const welcomeText = flutterApp.locator('welcome-txt');
    const confirmButton = flutterApp.locator('submit-btn');

    // 1. Track virtual pointers directly above targeted fields via hover
    await nameInput.hover();

    // 2. Fire high-fidelity rapid double clicks 
    await welcomeText.doubleClick();
    await welcomeText.waitForText('⚡ Double Click Detected! ⚡');

    // 3. Dispatch sustained physical touch long presses holding down contact coordinates
    await nameInput.fill('Lucas Rafael');
    await confirmButton.longPress({ durationMs: 800 });
    await welcomeText.waitForText('Olá, Lucas Rafael! (Long Press)');
  });

});

```

## Core Development & Compilation Commands
If you are expanding the TypeScript engine codebase or adding new locators to the repository, manage local distribution bundles using these utility commands within packages/flutterwright:

``` 
# Clean up previous distribution compiled maps
rm -rf dist

# Build production compiled JavaScript outputs along with type definitions (.d.ts)
npm run build

# Flag executable binary files permissions for local UNIX environments
chmod +x dist/cli/init.js

# Register a local symlink to test the global CLI implementation locally
npm link

``` 

## License
This project is licensed under the MIT License - see the LICENSE file for details.