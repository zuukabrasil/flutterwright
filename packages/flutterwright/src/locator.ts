import { Flutterwright } from './flutterwright';

export class Locator {
  private index: number = 0;

  constructor(
    private app: Flutterwright,
    private selector: string,
    private parentSelector?: string
  ) {}

  private async retry<T>(fn: () => Promise<T> | T, timeout = 15000): Promise<T> {
    const startTime = Date.now();
    
    while (true) {
      try {
        return await fn();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }


  locator(childSelector: string): Locator {
    return new Locator(this.app, childSelector, this.selector);
  }


  nth(index: number): Locator {
    const clonedLocator = new Locator(this.app, this.selector, this.parentSelector);
    clonedLocator.index = index;
    return clonedLocator;
  }


  async count(): Promise<number> {
    return await this.retry(async () => {
      const result = await this.app.sendCommand('ext.flutterwright.count', {
        target: this.selector,
        parent: this.parentSelector,
      });
      if (result && result.status === 'error') {
        throw new Error(`Failed to calculate tree element inventory matching target "${this.selector}": ${result.message}`);
      }
      return result.count;
    });
  }

  async click(): Promise<void> {
    await this.retry(async () => {
      const result = await this.app.sendCommand('ext.flutterwright.tap', {
        target: this.selector,
        parent: this.parentSelector,
        index: this.index,
      });
      if (result && result.status === 'error') {
        throw new Error(`Element "${this.selector}" [nth: ${this.index}] is not ready for click interaction. Reason: ${result.message || ''}`);
      }
    });
  }

  async fill(value: string): Promise<void> {
    await this.retry(async () => {
      const result = await this.app.sendCommand('ext.flutterwright.fill', {
        target: this.selector,
        text: value,
        parent: this.parentSelector,
        index: this.index,
      });
      if (result && result.status === 'error') {
        throw new Error(`Element "${this.selector}" [nth: ${this.index}] is not ready for text injection. Reason: ${result.message || ''}`);
      }
    });
  }

  async innerText(): Promise<string> {
    return await this.retry(async () => {
      const result = await this.app.sendCommand('ext.flutterwright.getText', {
        target: this.selector,
        parent: this.parentSelector,
        index: this.index,
      });

      if (result && result.status === 'error') {
        throw new Error(`Failed to extract text layer from "${this.selector}" [nth: ${this.index}]: ${result.message}`);
      }

      if (!result || result.text === undefined || result.text === null) {
        throw new Error(`Text composition on target node "${this.selector}" [nth: ${this.index}] returned empty.`);
      }

      return result.text;
    });
  }

  async longPress(options?: { durationMs?: number }): Promise<void> {
    await this.retry(async () => {
      const result = await this.app.sendCommand('ext.flutterwright.longPress', {
        target: this.selector,
        parent: this.parentSelector,
        index: this.index,
        durationMs: options?.durationMs ?? 600,
      });
      if (result && result.status === 'error') {
        throw new Error(`Failed to execute long press pattern on target "${this.selector}" [nth: ${this.index}]: ${result.message || ''}`);
      }
    });
  }


  async doubleClick(): Promise<void> {
    await this.retry(async () => {
      const result = await this.app.sendCommand('ext.flutterwright.doubleClick', {
        target: this.selector,
        parent: this.parentSelector,
        index: this.index,
      });
      if (result && result.status === 'error') {
        throw new Error(`Failed to execute double click sequence on target "${this.selector}" [nth: ${this.index}]: ${result.message || ''}`);
      }
    });
  }


  async hover(): Promise<void> {
    await this.retry(async () => {
      const result = await this.app.sendCommand('ext.flutterwright.hover', {
        target: this.selector,
        parent: this.parentSelector,
        index: this.index,
      });
      if (result && result.status === 'error') {
        throw new Error(`Failed to map pointer hover coordinates on target "${this.selector}" [nth: ${this.index}]: ${result.message || ''}`);
      }
    });
  }

  async swipe(direction: 'up' | 'down' | 'left' | 'right', options?: { distance?: number; steps?: number }): Promise<void> {
    await this.retry(async () => {
      const result = await this.app.sendCommand('ext.flutterwright.swipe', {
        target: this.selector,
        parent: this.parentSelector,
        direction,
        distance: options?.distance ?? 200,
        steps: options?.steps ?? 10,
        index: this.index,
      });
      if (result && result.status === 'error') {
        throw new Error(`Failed to execute gesture layout on target "${this.selector}" [nth: ${this.index}]: ${result.message || ''}`);
      }
    });
  }

  async waitForText(expectedText: string, timeout = 15000): Promise<void> {
    await this.retry(async () => {
      const currentText = await this.innerText();
      if (currentText !== expectedText) {
        throw new Error(`Expected text pattern: "${expectedText}", but received: "${currentText}"`);
      }
    }, timeout);
  }
}