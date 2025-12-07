import { expect, Page } from "@playwright/test";
import { JobAction } from "./actions";
import { ElementHandler } from "@/components/element";

const DATA_MAPPING = {
    "Mobile Phone Number": "0312345678",
    "Phone": "0312345678",
    "First Name": "John",
    "Last Name": "Doe",
};

type DataKey = keyof typeof DATA_MAPPING;


export class JobPage {
    readonly page: Page;
    readonly jobAction: JobAction;
    readonly elementHandler: ElementHandler;

    constructor(page: Page) {
        this.page = page;
        this.jobAction = new JobAction(page);
        this.elementHandler = new ElementHandler(page);
    };

    async userGoToJobsPage(): Promise<void> {
        await this.page.goto('/jobs');
    }

    async userSearchJob(title: string): Promise<void> {
        await this.jobAction.searchJob(title);
    }

    async selectEasyApplyJobFromSearchResults(): Promise<void> {
        await this.jobAction.findEasyApplyJob();
        await this.jobAction.clickApplyJobButton();
    }

    async verifyTheApplyToJobDialogVisible(): Promise<void> {
        const requiredFields = await this.jobAction.getRequiredFields();
        const fieldTypes = Object.keys(requiredFields);
        for (let fieldType of fieldTypes) {
            const field = requiredFields[fieldType];
            const keys = Object.keys(field);
            for (let k of keys) {
                await this.elementHandler.waitForVisible(field[k]);
            }
        }
    }

    async makeAllRequiredFieldsEmpty(): Promise<void> {
        const requiredFields = await this.jobAction.getRequiredFields();
        const fieldTypes = Object.keys(requiredFields);
        for (let fieldType of fieldTypes) {
            const field = requiredFields[fieldType];
            if (fieldType === "textfields") {
                const keys = Object.keys(field);
                for (let k of keys) {
                    await field[k].fill('');
                }
            } else if (fieldType === "selects") {
                const keys = Object.keys(field);
                for (let k of keys) {
                    await field[k].selectOption({ value: 'Select an option' });
                }
            }
        }
    }

    async userUploadResume(filePath: string): Promise<void> {
        await this.jobAction.uploadCvFile(filePath);
    }

    async userClickNextButton(): Promise<void> {
        await this.jobAction.clickNextButton();
    }

    async userClickEasyApplyButton(): Promise<void> {
        await this.jobAction.clickEasyApplyOption();
    }

    async fillInAllRequiredFieldsForApplyJobDialog(): Promise<void> {
        const requiredFields = await this.jobAction.getRequiredFields();
        const fieldTypes = Object.keys(requiredFields);
        for (let fieldType of fieldTypes) {
            const field = requiredFields[fieldType];
            if (fieldType === "textfields") {
                const keys = Object.keys(field);
                for (let k of keys) {
                    await field[k].fill(DATA_MAPPING[k as DataKey] || 'Sample Data');
                }
            }
        }
    }

    async verifyTheErrorMessagesForRequiredFields(): Promise<void> {
        await this.jobAction.clickButtonAtTheBottomForm();
        const requiredFields = await this.jobAction.getRequiredFields();
        for (const fieldType of Object.keys(requiredFields)) {
            const fields = requiredFields[fieldType];
            const keys = Object.keys(fields);

            if (fieldType === "textfields") {
                await this.jobAction.verifyErrorMessageOfTextFields(fields, keys);

            } else if (fieldType === "selects") {
                await this.jobAction.verifyErrorMessageOfSelects(fields, keys);
            }

        }
    }

    async verifyResumeUploadSuccess(uploadedFileName: string): Promise<void> {
        expect(await this.jobAction.getUploadedFileName()).toEqual(uploadedFileName);
    }

    async userClickReviewApplicationButton(): Promise<void> {
        await this.jobAction.reviewApplicationButtonShouldBeVisible();
        await this.jobAction.clickReviewApplicationButton();
    };

    async verifyJobApplicationSuccess(): Promise<void> {
        await this.jobAction.submitApplicationShouldBeVisible();
        await this.jobAction.reviewApplicationButtonShouldNotBeVisible();
    }

    async verifyRequireResumeMessage(): Promise<void> {
        await this.jobAction.requireresumeMessageShouldBeVisible();
    };

    async verifyMessageUploadResumeInvalid(message: string): Promise<void> {
        await this.jobAction.messageUploadResumeInvalidShouldBeVisible(message);
    };

    async verifyRemoveDocument(): Promise<void> {
        await this.jobAction.clearDocumentButtonShouldBeVisible();
    };


}