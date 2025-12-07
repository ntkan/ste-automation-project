import { Locator, Page } from "@playwright/test";
export class ElementHandler {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async waitForElementVisible(selector: string): Promise<void> {
        await this.page.waitForSelector(selector, { state: 'visible' });
    }

    async waitForVisible(locator: Locator, timeout: number = 30000): Promise<boolean> {
        const isVisible = await locator.isVisible({ timeout });
        if (isVisible) {
            return true;
        } else {
            throw new Error(`Element not visible: ${locator} after ${timeout} ms`);
        }
    }

    async waitUntilHasChildElements( parent: Locator, childSelector: string, timeout: number = 30000): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const count = await parent.locator(childSelector).count();
            if (count > 0) {
                return; 
            }
            await this.page.waitForTimeout(100);
        }

        throw new Error(`Timeout: No child elements found for selector ${childSelector} within ${timeout} ms`);
    }

}