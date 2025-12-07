import { expect, Locator, Page } from "@playwright/test";
import { locators } from "./locators";
import { SelectHandler } from "@/components/select";
import { ElementHandler } from "@/components/element";
import { th } from "@faker-js/faker/.";


const ERROR_MESSAGES: Record<string, string> = {
    'Mobile phone number': 'Enter a valid phone number',
    'Phone': 'Enter a valid phone number',
};

type ErrorKey = keyof typeof ERROR_MESSAGES;

export class JobAction {
    readonly page: Page;
    readonly selectHandler: SelectHandler;
    readonly elementHandler: ElementHandler;
    constructor(page: Page) {
        this.page = page;
        this.selectHandler = new SelectHandler(page);
        this.elementHandler = new ElementHandler(page);
    }

    async searchJob(title: string) {
        await this.page.fill(locators.searchJobInput, title);
        await this.page.keyboard.press('Enter');
    }

    async clickApplyJobButton(): Promise<void> {
        const selectedJobTopCard = this.page.locator(locators.jobDetailTopCard);
        await selectedJobTopCard.locator(locators.applyButton).click();
    }

    async isEasyApplyJob(): Promise<boolean> {
        const selectedJobTopCard = this.page.locator(locators.jobDetailTopCard);
        const buttonType = await selectedJobTopCard.locator(locators.applyButton).innerText();
        if (buttonType === 'Apply') {
            return false
        } else if (buttonType === 'Easy Apply') {
            return true
        }
        throw new Error(`Cannot determine job type from button text: ${buttonType}`);
    }

    async findEasyApplyJob(): Promise<void> {
        
        const jobCards = this.page.locator(locators.searchResultJobCards);

        await expect(jobCards).toBeVisible({ timeout: 60000});
        await expect(jobCards).toBeAttached();

        if (await this.isEasyApplyJob()) {
            return;
        }

        const liLocator = jobCards.locator('li');
        const total = await liLocator.count();
        for (let i = 0; i < await liLocator.count(); i++) {
            const jobCard = liLocator.nth(i);
            await jobCard.click();
            if (await this.isEasyApplyJob()) {
                return;
            }
        }
        throw new Error(`There are no Easy Apply job found in search results.`);
    }


    async verifyApplyToJobDialogVisible(): Promise<void> {
        const emailDropdown = this.page.locator(locators.emailLabel);
        await expect(emailDropdown).toBeVisible();

        const phoneCountryDropdown = this.page.locator(locators.phoneCountryCodeLabel).locator("xpath=ancestor::div").first();
        await expect(phoneCountryDropdown).toBeVisible();

        const phoneDropdown = this.page.locator(locators.phoneLabel).locator("xpath=ancestor::div").first();
        await expect(phoneDropdown).toBeVisible();
    }

    async getRequiredFields(): Promise<Record<string, Record<string, Locator>>> {
        const applyDialog = this.page.locator(locators.applyJobDialog);
        await this.elementHandler.waitUntilHasChildElements(applyDialog, "//input");
        await this.elementHandler.waitUntilHasChildElements(applyDialog, "//select");
        const requiredTextfields: Locator[] = await this.page.locator(locators.applyJobDialog).locator("//input").all();
        const requiredSelects: Locator[] = await this.page.locator(locators.applyJobDialog).locator("//select").all();
        const requiredFields: Record<string, Record<string, Locator>> = {};
        const requiredTFs: Record<string, Locator> = {};
        const requiredSLs: Record<string, Locator> = {};
        for (let textfield of requiredTextfields) {
            const label = await textfield.locator("xpath=preceding-sibling::label").innerText();
            const isRequired = await textfield.getAttribute("required");
            if (isRequired !== null) {
                requiredTFs[label] = textfield;
            }
        }
        requiredFields["textfields"] = requiredTFs;

        for (let select of requiredSelects) {
            const label = await select.locator("xpath=preceding-sibling::label").locator('span').first().innerText();
            const isRequired = await select.getAttribute("required");
            if (isRequired !== null) {
                requiredSLs[label] = select;
            }
        }
        requiredFields["selects"] = requiredSLs;
        return requiredFields;
    }

    async clickButtonAtTheBottomForm(): Promise<void> {
        await this.page.locator(locators.endLineButton).click();
    }

    async verifyErrorMessageOfTextFields(
        fields: Record<string, any>,
        keys: string[]
    ): Promise<void> {
        if (keys.length === 0) {
            throw new Error("No required text fields found to verify error messages.");
        }
        for (const key of keys) {
            const expectedMessage =
                ERROR_MESSAGES[key] || "";

            const errorText = await fields[key]
                .locator("xpath=/../../following-sibling::div")
                .innerText();

            if (!errorText.includes(expectedMessage)) {
                throw new Error(
                    `Expected error "${expectedMessage}" for field "${key}", but got "${errorText}".`
                );
            }
        }
    }

    async verifyErrorMessageOfSelects(
        fields: Record<string, any>,
        keys: string[]
    ): Promise<void> {
        if (keys.length === 0) {
            throw new Error("No required text fields found to verify error messages.");
        }
        for (const key of keys) {
            const errorText = await fields[key]
                .locator("xpath=following-sibling::div")
                .first()
                .innerText();

            const expectedMessage = "Please enter a valid answer";

            if (!errorText.includes(expectedMessage)) {
                throw new Error(
                    `Expected error "${expectedMessage}" for select "${key}", but got "${errorText}".`
                );
            }
        }
    }

    async clickReviewApplicationButton(): Promise<void> {
        const reviewButton = this.page.locator(locators.reviewApplicationButton);
        await reviewButton.click();
    }

    async uploadCvFile(filePath: string): Promise<void> {
        const uploadInput = this.page.locator(locators.uploadResumeInput);
        await uploadInput.setInputFiles(filePath);
    }

    async messageUploadResumeInvalidShouldBeVisible(message: string): Promise<void> {
        const invalidResumeMessage = this.page.locator(locators.invalidResumeMessage);
        await expect(invalidResumeMessage).toBeVisible();
        expect(await invalidResumeMessage.innerText()).toEqual(message);
    }

    async requireresumeMessageShouldBeVisible(): Promise<void> {
        const requireresumeMessage = this.page.locator(locators.requireresumeMessage);
        await expect(requireresumeMessage).toBeVisible();
    }

    async reviewApplicationButtonShouldBeVisible(): Promise<void> {
        const reviewButton = this.page.locator(locators.reviewApplicationButton);
        await expect(reviewButton).toBeVisible();
    }

    async reviewApplicationButtonShouldNotBeVisible(): Promise<void> {
        const reviewButton = this.page.locator(locators.reviewApplicationButton);
        await expect(reviewButton).not.toBeVisible();
    }

    async uploadResunmeButtonShouldNotBeVisible(): Promise<void> {
        const uploadButton = this.page.locator(locators.resumeUploadButton);
        await expect(uploadButton).not.toBeVisible();   
    }

    async getUploadedFileName(): Promise<string> {
        const fileNameElement = this.page.locator(locators.uploadedFileName);
        return await fileNameElement.innerText();
    }

    async submitApplicationShouldBeVisible(): Promise<void> {
        const submitButton = this.page.locator(locators.submitApplication);
        await expect(submitButton).toBeVisible();
    }

    async clickNextButton(): Promise<void> {
        await this.page.getByRole('button', { name: locators.nextButton }).click();
    }

    async clickEasyApplyOption(): Promise<void> {
        const easyApplybuton = this.page.locator(locators.easyApplyFilter);
        await easyApplybuton.click();
    }

    async clearDocumentButtonShouldBeVisible(): Promise<void> {
        const removeDocumentbutton = this.page.getByRole('button', {name: locators.removeDocument});
        await expect(removeDocumentbutton).toBeVisible();
    }

}