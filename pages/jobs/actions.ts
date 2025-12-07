import { expect, Locator, Page } from "@playwright/test";
import { locators } from "./locators";
import { SelectHandler } from "@/components/select";
import { ElementHandler } from "@/components/element";
import { ActionLogger, SafeActions } from "@/utils/actionWrapper";


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
        ActionLogger.info('Starting job search', { title });
        
        await SafeActions.fill(
            this.page.locator(locators.searchJobInput), 
            title, 
            'fill search input'
        );
        
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
            ActionLogger.warn('Page did not reach networkidle state');
        });
        
        ActionLogger.info('Job search completed', { title });
    }

    async clickApplyJobButton(): Promise<void> {
        try {
            const selectedJobTopCard = this.page.locator(locators.jobDetailTopCard);
            const applyButton = selectedJobTopCard.locator(locators.applyButton);
            await SafeActions.click(applyButton, 'click apply button');
        } catch (error) {
            ActionLogger.error(`Failed to click apply job button`, { error });
        }
    }

    async verifyApplyToJobDialogVisible(): Promise<void> {
        ActionLogger.info('Verifying apply dialog visibility');
        
        const emailDropdown = this.page.locator(locators.emailLabel);
        await SafeActions.waitForVisible(emailDropdown, 'email dropdown');

        const phoneCountryDropdown = this.page.locator(locators.phoneCountryCodeLabel).locator("xpath=ancestor::div").first();
        await SafeActions.waitForVisible(phoneCountryDropdown, 'phone country dropdown');

        const phoneDropdown = this.page.locator(locators.phoneLabel).locator("xpath=ancestor::div").first();
        await SafeActions.waitForVisible(phoneDropdown, 'phone dropdown');
        
        ActionLogger.info('Apply dialog verification completed');
    }
    async getRequiredFields(): Promise<Record<string, Record<string, Locator>>> {
        ActionLogger.info('Extracting required fields');
        
        const applyDialog = this.page.locator(locators.applyJobDialog);
        await this.elementHandler.waitUntilHasChildElements(applyDialog, "//input");
        await this.elementHandler.waitUntilHasChildElements(applyDialog, "//select");
        
        const requiredTextfields: Locator[] = await this.page.locator(locators.applyJobDialog).locator("//input").all();
        const requiredSelects: Locator[] = await this.page.locator(locators.applyJobDialog).locator("//select").all();
        const requiredFields: Record<string, Record<string, Locator>> = {};
        const requiredTFs: Record<string, Locator> = {};
        const requiredSLs: Record<string, Locator> = {};
        
        // Process text fields with error handling
        for (let i = 0; i < requiredTextfields.length; i++) {
            try {
                const textfield = requiredTextfields[i];
                const label = await textfield.locator("xpath=preceding-sibling::label").innerText();
                const isRequired = await textfield.getAttribute("required");
                if (isRequired !== null) {
                    requiredTFs[label] = textfield;
                    ActionLogger.info('Found required text field', { label });
                }
            } catch (error) {
                ActionLogger.warn(`Failed to process text field ${i}`, { error });
            }
        }
        requiredFields["textfields"] = requiredTFs;
 
        // Process select fields with error handling
        for (let i = 0; i < requiredSelects.length; i++) {
            try {
                const select = requiredSelects[i];
                const label = await select.locator("xpath=preceding-sibling::label").locator('span').first().innerText();
                const isRequired = await select.getAttribute("required");
                if (isRequired !== null) {
                    requiredSLs[label] = select;
                    ActionLogger.info('Found required select field', { label });
                }
            } catch (error) {
                ActionLogger.warn(`Failed to process select field ${i}`, { error });
            }
        }
        requiredFields["selects"] = requiredSLs;
        
        ActionLogger.info('Required fields extraction completed', {
            textFields: Object.keys(requiredTFs).length,
            selectFields: Object.keys(requiredSLs).length
        });
        
        return requiredFields;
    }

    async clickButtonAtTheBottomForm(): Promise<void> {
        await SafeActions.click(this.page.locator(locators.endLineButton), 'click bottom form button');
    }

    async verifyErrorMessageOfTextFields(
        fields: Record<string, any>,
        keys: string[]
    ): Promise<void> {
        ActionLogger.info('Verifying text field error messages', { fieldCount: keys.length });
       
        if (keys.length === 0) {
            ActionLogger.error('No required text fields found to verify');
            throw new Error("No required text fields found to verify error messages.");
        }
       
        for (const key of keys) {
            try {
                const expectedMessage = ERROR_MESSAGES[key] || "";
                const errorElement = fields[key].locator("xpath=/../../following-sibling::div");
               
                await SafeActions.waitForVisible(errorElement, `error message for ${key}`, 30000);
                const errorText = await errorElement.innerText();
 
                if (!errorText.includes(expectedMessage)) {
                    ActionLogger.error('Error message mismatch', {
                        field: key,
                        expected: expectedMessage,
                        actual: errorText
                    });
                    throw new Error(
                        `Expected error "${expectedMessage}" for field "${key}", but got "${errorText}".`
                    );
                }
               
                ActionLogger.info('Error message verified', { field: key, message: expectedMessage });
            } catch (error) {
                ActionLogger.error(`Failed to verify error for field ${key}`, { error });
                throw error;
            }
        }
    }

    async verifyErrorMessageOfSelects(
        fields: Record<string, any>,
        keys: string[]
    ): Promise<void> {
        ActionLogger.info('Verifying select field error messages', { fieldCount: keys.length });
       
        if (keys.length === 0) {
            ActionLogger.error('No required select fields found to verify');
            throw new Error("No required text fields found to verify error messages.");
        }
       
        for (const key of keys) {
            try {
                const errorElement = fields[key].locator("xpath=following-sibling::div").first();
                const expectedMessage = "Please enter a valid answer";
               
                await SafeActions.waitForVisible(errorElement, `error message for select ${key}`, 3);
                const errorText = await errorElement.innerText();
 
                if (!errorText.includes(expectedMessage)) {
                    ActionLogger.error('Select error message mismatch', {
                        field: key,
                        expected: expectedMessage,
                        actual: errorText
                    });
                    throw new Error(
                        `Expected error "${expectedMessage}" for select "${key}", but got "${errorText}".`
                    );
                }
               
                ActionLogger.info('Select error message verified', { field: key });
            } catch (error) {
                ActionLogger.error(`Failed to verify select error for field ${key}`, { error });
                throw error;
            }
        }
    }

    async clickReviewApplicationButton(): Promise<void> {
        await SafeActions.click(this.page.locator(locators.reviewApplicationButton), 'click review application button');
    }

    async uploadCvFile(filePath: string): Promise<void> {
        ActionLogger.info('Starting CV upload', { filePath });
        await SafeActions.setFiles(this.page.locator(locators.uploadResumeInput), filePath, 'upload CV file');
    }

    async messageUploadResumeInvalidShouldBeVisible(message: string): Promise<void> {
        const invalidResumeMessage = this.page.locator(locators.invalidResumeMessage);
        await SafeActions.waitForVisible(invalidResumeMessage, 'invalid resume message');
        
        const actualMessage = await invalidResumeMessage.innerText();
        if (actualMessage !== message) {
            ActionLogger.error('Invalid resume message mismatch', { expected: message, actual: actualMessage });
            throw new Error(`Expected message "${message}", but got "${actualMessage}"`);
        }
        
        ActionLogger.info('Invalid resume message verified', { message });
    }

    async requireresumeMessageShouldBeVisible(): Promise<void> {
        await SafeActions.waitForVisible(this.page.locator(locators.requireresumeMessage), 'require resume message');
    }

    async reviewApplicationButtonShouldBeVisible(): Promise<void> {
        await SafeActions.waitForVisible(this.page.locator(locators.reviewApplicationButton), 'review application button');
    }

    async reviewApplicationButtonShouldNotBeVisible(): Promise<void> {
        try {
            ActionLogger.info('Verifying review button is not visible');
            const reviewButton = this.page.locator(locators.reviewApplicationButton);
            await expect(reviewButton).not.toBeVisible({ timeout: 30000 });
            ActionLogger.info('Review button is correctly not visible');
        } catch (error) {
            ActionLogger.error('Review button visibility check failed', { error });
            throw error;
        }
    }

    async getUploadedFileName(): Promise<string> {
        return await SafeActions.getText(this.page.locator(locators.uploadedFileName), 'get uploaded file name');
    }

    async submitApplicationShouldBeVisible(): Promise<void> {
        await SafeActions.waitForVisible(this.page.locator(locators.submitApplication), 'submit application button');
    }

    async clickNextButton(): Promise<void> {
        await SafeActions.click(this.page.getByRole('button', { name: locators.nextButton }), 'click next button');
    }

    async clickEasyApplyOption(): Promise<void> {
        await SafeActions.click(this.page.locator(locators.easyApplyFilter), 'click easy apply filter');
    }

    async clearDocumentButtonShouldBeVisible(): Promise<void> {
        await SafeActions.waitForVisible(this.page.getByRole('button', {name: locators.removeDocument}), 'clear document button');
    }
}