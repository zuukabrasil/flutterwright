# Flutterwright

A next-generation automation testing tool for Flutter applications, heavily inspired by the **Playwright** ecosystem and API. 

**Flutterwright** allows you to control native Flutter applications (Linux, Android, iOS, macOS, Windows) from a Node.js environment using JavaScript or TypeScript. Unlike traditional tools such as Appium, Flutterwright connects directly to the **Dart VM Service** via WebSockets and injects physical events directly into the Flutter graphic engine, ensuring ultra-fast, reliable, and flaky-free test execution.

---

## System Architecture

The framework is divided into two main components that work in perfect synchronicity:

1. **`flutterwright` (Node.js / NPM)**: The TypeScript SDK that the QA Engineer uses to write the test scripts. It manages the lifecycle of the Flutter process, dynamically captures the Dart VM debugging URL, and sends remote commands via WebSocket using JSON-RPC.
2. **`flutterwright_driver` (Dart / Pub.dev)**: The internal agent embedded in the Flutter application (as a development dependency only). It listens to the Dart VM service extensions and translates commands from Node.js into real physical interactions within the Flutter widget tree.

---

## Key Features

* **Smart Auto-launch**: Automated initialization of the `flutter run` process, dynamically capturing the service URL and security token via Regular Expressions (Regex).
* **Simulated Human Typing (`fill`)**: Character-by-character text insertion with configurable delays and synchronous frame rendering, ensuring the correct triggering of masks, validators, and text change listeners.
* **Real Physical Touches (`click`)**: Dispatches `PointerDownEvent` and `PointerUpEvent` directly to the 2D center point of the target widget, accurately simulating a human finger interacting with the device screen.
* **Dynamic Text Extraction (`innerText`)**: Scans the Flutter structural tree (`RenderBox`) in milliseconds to capture static text or values inside editable fields for test assertions.
* **Graceful Termination**: Sends an interactive close command (`q`) to the Flutter CLI terminal, preventing zombie processes or blocked network ports in your operating system.

---

## Monorepo Structure

The project is organized as a monorepo to streamline simultaneous development across both platforms:

```text
flutterwright/
├── packages/
│   ├── flutterwright/            # Node.js Package (TypeScript) -> Published to NPM
│   │   ├── src/                  # Source code (.ts)
│   │   ├── dist/                 # Production compiled code (.js, .d.ts)
│   │   └── package.json          
│   │
│   └── flutterwright_driver/     # Dart/Flutter Package -> Published to Pub.dev
│       ├── lib/                  # Remote agent code (.dart)
│       └── pubspec.yaml          
│
└── example_app/                  # Example Flutter app for local validation
```

## Setup and Usage

1. Configuration in the Flutter Project (example_app)
Add the remote driver to your development dependencies in the pubspec.yaml file:

```
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutterwright_driver:
    path: ../packages/flutterwright_driver # Or the version published to pub.dev

```

In your application's entry point (lib/main.dart), initialize the Flutterwright agent before calling runApp:

```
import 'package:flutter/material.dart';
import 'package:flutterwright_driver/flutterwright_driver.dart';

void main() {
  // Ensures proper initialization of Flutter bindings
  WidgetsFlutterBinding.ensureInitialized();
  
  // Activates the automation agent inside the Dart VM
  FlutterwrightDriver.enable();
  
  runApp(const MyApp());
}

```

Make sure that the critical elements you want to automate have an identifying key (ValueKey), as shown below:

```
TextField(
  key: const ValueKey('name-input'),
  controller: _controller,
),
ElevatedButton(
  key: const ValueKey('submit-btn'),
  onPressed: () => print('Clicked!'),
  child: const Text('Confirm'),
)

```

2. Configuration in the Node.js / Automation Project
Install the Flutterwright library into your test repository:

```
npm install flutterwright
```

3. Writing the Automation Script (sandbox.ts)
Create your end-to-end test flow utilizing the framework's fluent API. The example below demonstrates launching the app, performing human-like typing, triggering a physical click, and validating the assertion:

```
import { Flutterwright } from 'flutterwright';
import path from 'path';

async function runAutomation() {
  const app = new Flutterwright();
  
  // Resolve the local path to the Flutter application folder
  const exampleAppPath = path.resolve(__dirname, '../../example_app');

  try {
    // 1. Launches Flutter, captures the VM URL, and connects the WebSocket automatically
    await app.launch(exampleAppPath, 'linux');

    // 2. Map elements using locators (ValueKey or Text)
    const nameInput = app.locator('name-input');
    const confirmButton = app.locator('submit-btn');
    const welcomeText = app.locator('welcome-txt');

    // 3. Read the initial UI state
    const initialText = await welcomeText.innerText();
    console.log(`Initial text: "${initialText}"`);

    // 4. Execute character-by-character typing (Human simulation)
    console.log('Typing the username...');
    await nameInput.fill('Lorem Ipsum');

    // 5. Click the confirmation button
    console.log('Triggering physical click on the button...');
    await confirmButton.click();

    // Small pause to allow Flutter's graphic pipeline to process the setState
    await new Promise(r => setTimeout(r, 300));

    // 6. Capture the newly rendered text and validate the assertion
    const finalText = await welcomeText.innerText();
    console.log(`Final text: "${finalText}"`);

    if (finalText === 'Hello, Lucas!') {
      console.log('SUCCESS: The test passed perfectly!');
    } else {
      console.error('ERROR: The obtained value does not match the expected one.');
    }

  } catch (error) {
    console.error('Failure during execution:', error);
  } finally {
    // 7. Disconnects sockets and terminates the Flutter process gracefully
    console.log('Cleaning up resources and closing the application...');
    await app.disconnect();
  }
}

runAutomation();

```

## Development Commands (Core Compilation)
If you are making modifications to the TypeScript core package and want to generate the final distribution files in the dist/ directory, execute the following steps inside packages/flutterwright:

``` 
# Clean up previous compilations
rm -rf dist

# Run the TypeScript compiler (tsc) for production build
npm run build

``` 

This will read the files inside src/ and output the stable JavaScript equivalents along with the type definitions (.d.ts) directly into the root of the dist/ directory, completely excluding unit tests or local sandboxes.

## License
This project is licensed under the MIT License - see the LICENSE file for details.