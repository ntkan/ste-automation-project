import {test} from "@playwright/test";
import { JobPage } from "../../pages/jobs/page";
import dotenv from 'dotenv';
import path from 'path';
import { LoginPage } from "@/pages/authentication/login/page";
dotenv.config();

test.describe('Job Tests', {tag: ['@jobs', '@apply']},  () => {
    test.beforeAll(async () => {
    });

    let jobPage: JobPage;
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        await page.goto('/jobs');
        jobPage = new JobPage(page);
        loginPage = new LoginPage(page);
        await loginPage.userLoginByEmail(process.env.UI_LOGIN_USERNAME as string, process.env.UI_LOGIN_PASSWORD as string);
    })

    test('Verify that user cannot apply job if missing required fields', {tag: ["@apply_1_001"]}, async () => {
        await jobPage.userSearchJob('Mitek');
        await jobPage.userClickEasyApplyButton();
        await jobPage.selectEasyApplyJobFromSearchResults();
        await jobPage.verifyTheApplyToJobDialogVisible();
        await jobPage.makeAllRequiredFieldsEmpty();
        await jobPage.verifyTheErrorMessagesForRequiredFields();
    })

    test('Verify that user can apply job successfully', {tag: ["@apply_1_002"]}, async ({ page }) => {
        await jobPage.userSearchJob('Mitek');
        await jobPage.userClickEasyApplyButton();
        await jobPage.selectEasyApplyJobFromSearchResults();
        await jobPage.verifyTheApplyToJobDialogVisible();
        await jobPage.fillInAllRequiredFieldsForApplyJobDialog();
        await jobPage.userClickNextButton();
        const filePath = path.resolve(process.cwd(), 'resources', 'sample-files', 'sample-resume.pdf');
        await jobPage.userUploadResume(filePath);
        await jobPage.verifyResumeUploadSuccess('sample-resume.pdf');
        await jobPage.userClickReviewApplicationButton();
        await jobPage.verifyJobApplicationSuccess();
    })

    test('Verify the error should appear if submit apply that resume is empty', {tag: ["@apply_1_003"]}, async ({ page }) => {
        await jobPage.userSearchJob('Mitek');
        await jobPage.userClickEasyApplyButton();
        await jobPage.selectEasyApplyJobFromSearchResults();
        await jobPage.verifyTheApplyToJobDialogVisible();
        await jobPage.fillInAllRequiredFieldsForApplyJobDialog();
        await jobPage.userClickNextButton();
        await jobPage.userClickReviewApplicationButton();
        await jobPage.verifyRequireResumeMessage();
    })

    test('Verify the error should appear if update resume more than 2MB', {tag: ["@apply_1_004"]}, async ({ page }) => {
        await jobPage.userSearchJob('Mitek');
        await jobPage.userClickEasyApplyButton();
        await jobPage.selectEasyApplyJobFromSearchResults();
        await jobPage.verifyTheApplyToJobDialogVisible();
        await jobPage.fillInAllRequiredFieldsForApplyJobDialog();
        await jobPage.userClickNextButton();
        const filePath = path.resolve(process.cwd(), 'resources', 'sample-files', 'sample-resume-2mb.pdf');
        await jobPage.userUploadResume(filePath);
        await jobPage.verifyResumeUploadSuccess('sample-resume-2mb.pdf');
        await jobPage.verifyMessageUploadResumeInvalid("Please upload a smaller file (2 MB or less). Change file");
        await jobPage.verifyRemoveDocument();
    })
});