import { Page } from "@playwright/test";

export class SelectHandler {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async selectOptionByValue(selectLocator: string, value: string | null) {
        if (!value) {
            value = 'Select an option';
        }
        const selectElement = this.page.locator(selectLocator);
        await selectElement.selectOption({ value });
    }

    async selectOptionByLabel(selectLocator: string, label: string) {
        const selectElement = this.page.locator(selectLocator);
        await selectElement.selectOption({ label });
    }

    async selectOptionByIndex(selectLocator: string, index: number) {
        const selectElement = this.page.locator(selectLocator);
        const options = await selectElement.locator('option').all();
        if (index < 0 || index >= options.length) {
            throw new Error(`Index ${index} is out of bounds for select options.`);
        }
        const value = await options[index].getAttribute('value');
        if (value === null) {
            throw new Error(`Option at index ${index} does not have a value attribute.`);
        }
        await selectElement.selectOption({ value });
    }

    async getSelectedOptionText(selectLocator: string): Promise<string> {
        const selectElement = this.page.locator(selectLocator);
        const selectedOption = selectElement.locator('option:checked');
        return await selectedOption.innerText();
    }
}