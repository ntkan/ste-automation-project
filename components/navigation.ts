import { Page } from "@playwright/test";
export class NavigationHandler {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async navigateToURL(url: string): Promise<void> {
        const maxRetries = 3;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🌐 Navigating to ${url} (Attempt ${attempt}/${maxRetries})`);

                await this.page.goto(url, {
                    timeout: 15000,
                    waitUntil: 'networkidle'
                });

                console.log(`✅ Navigation successful: ${url}`);
                return; // Success → exit function

            } catch (error) {
                console.error(`❌ Navigation failed (Attempt ${attempt}):`, error);

                if (attempt === maxRetries) {
                    console.error(`🚨 Failed after ${maxRetries} attempts.`);
                    throw error; // Give up after last retry
                }

                // Optional wait before retry
                await this.page.waitForTimeout(1000);
            }
        }
    }
}