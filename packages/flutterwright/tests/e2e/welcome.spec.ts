import { test, expect } from '../../src/index';

test.describe('Welcome Screen & Gestures E2E Suite', () => {

  test('should fill the user name and update the welcome header successfully', async ({ flutterApp }) => {
    const nameInput = flutterApp.locator('name-input');
    const confirmButton = flutterApp.locator('submit-btn');
    const welcomeText = flutterApp.locator('welcome-txt');

    expect(await welcomeText.innerText()).toBe('Preencha seu nome');

    await nameInput.fill('Lucas Rafael');
    await confirmButton.click();

    await welcomeText.waitForText('Olá, Lucas Rafael! (Standard Tap)');
  });

  test('should validate multi-element counting and index-based operations via list hierarchy', async ({ flutterApp }) => {
    const itemWrapper = flutterApp.locator('item-wrapper-0');
    const itemCard = itemWrapper.locator('item-index-0');
    const deleteButton = itemWrapper.locator('delete-btn');
    const welcomeText = flutterApp.locator('welcome-txt');

    const matchCount = await itemWrapper.count();
    expect(matchCount).toBeGreaterThanOrEqual(1);

    await itemCard.nth(0).swipe('left', { distance: 250, steps: 15 });

    await deleteButton.click();

    await welcomeText.waitForText('Record Deleted Successfully');
  });

  test('should execute advanced physical gestures like hover, double click, and long press', async ({ flutterApp }) => {
    const nameInput = flutterApp.locator('name-input');
    const welcomeText = flutterApp.locator('welcome-txt');
    const confirmButton = flutterApp.locator('submit-btn');

    await nameInput.hover();

    await welcomeText.doubleClick();
    await welcomeText.waitForText('⚡ Double Click Detected! ⚡');

    await nameInput.fill('Lucas Rafael');
    await confirmButton.longPress({ durationMs: 800 });
    await welcomeText.waitForText('Olá, Lucas Rafael! (Long Press)');
  });

});