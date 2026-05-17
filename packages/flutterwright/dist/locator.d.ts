import { Flutterwright } from './flutterwright';
export declare class Locator {
    private app;
    private selector;
    private parentSelector?;
    private index;
    constructor(app: Flutterwright, selector: string, parentSelector?: string | undefined);
    private retry;
    locator(childSelector: string): Locator;
    nth(index: number): Locator;
    count(): Promise<number>;
    click(): Promise<void>;
    fill(value: string): Promise<void>;
    innerText(): Promise<string>;
    longPress(options?: {
        durationMs?: number;
    }): Promise<void>;
    doubleClick(): Promise<void>;
    hover(): Promise<void>;
    swipe(direction: 'up' | 'down' | 'left' | 'right', options?: {
        distance?: number;
        steps?: number;
    }): Promise<void>;
    waitForText(expectedText: string, timeout?: number): Promise<void>;
}
