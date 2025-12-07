import { expect, Page } from "@playwright/test";
import { locators } from "./locators";

export class LoginActions {
    readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    async enterEmail(email: string) {
        await this.page.fill(locators.emailTextfield, email);
    }

    async enterPassword(password: string) {
        await this.page.fill(locators.passwordTextfield, password);
    }

    async clickLoginWithEmail() {
        await this.page.click(locators.loginWithEmail);
    }

    async clickSignInButton() {
        await this.page.getByRole('button', { name: locators.signInButton }).click();
    }

    async checkLoginFormVisible(): Promise<boolean> {
        return await this.page.locator(locators.emailTextfield).isVisible();
    }
}