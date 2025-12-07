import {  Page } from "@playwright/test";
export class NavigationHandler {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async navigateToURL(url: string): Promise<void> {
        await this.page.goto(url);
    }
}