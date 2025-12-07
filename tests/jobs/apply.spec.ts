import {test, TestInfo} from "@playwright/test";
import { JobPage } from "../../pages/jobs/pages";
import dotenv from 'dotenv';
import path from 'path';
import { LoginPage } from "@/pages/authentication/login/page";
dotenv.config();

// Test data configuration
const TEST_DATA = {
    searchTerm: 'Quality Analyst (Manual/Automation Tester - QA QC)',
    resumeFiles: {
        valid: 'sample-resume.pdf',
        oversized: 'sample-resume-2mb.pdf'
    },
    errorMessages: {
        oversizedFile: "Please upload a smaller file (2 MB or less). Change file"
    }
};

test.describe('Job Tests', {tag: ['@jobs', '@apply']},  () => {

    let jobPage: JobPage;
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        jobPage = new JobPage(page);
        loginPage = new LoginPage(page);
        await jobPage.userGoToJobsPage();
        await loginPage.userLoginByEmail(process.env.UI_LOGIN_USERNAME as string, process.env.UI_LOGIN_PASSWORD as string);
    })

    const performJobSearch = async () => {
        await jobPage.userSearchJob(TEST_DATA.searchTerm);
        await jobPage.userSelectEasyApplyFilter();
        await jobPage.userClickEasyApplyButton();
        await jobPage.verifyTheApplyToJobDialogVisible();
    };

    test('Verify that user cannot apply job if missing required fields', {tag: ["@apply_1_001"]}, async () => {
        await performJobSearch();
        await jobPage.makeAllRequiredFieldsEmpty();
        await jobPage.verifyTheErrorMessagesForRequiredFields();
    })

    test('Verify that user can apply job successfully', {tag: ["@apply_1_002"]}, async ({ page }) => {
        await performJobSearch();
        await jobPage.fillInAllRequiredFieldsForApplyJobDialog();
        await jobPage.userClickNextButton();
        const filePath = path.resolve(process.cwd(), 'resources', 'sample-files', TEST_DATA.resumeFiles.valid);
        await jobPage.userUploadResume(filePath);
        await jobPage.verifyResumeUploadSuccess(TEST_DATA.resumeFiles.valid);
        await jobPage.userClickReviewApplicationButton();
        await jobPage.verifyJobApplicationSuccess();
    })

    test('Verify the error should appear if submit apply that resume is empty', {tag: ["@apply_1_003"]}, async ({ page }) => {
        await performJobSearch();
        await jobPage.fillInAllRequiredFieldsForApplyJobDialog();
        await jobPage.userClickNextButton();
        await jobPage.userClickReviewApplicationButton();
        await jobPage.verifyRequireResumeMessage();
    })

    test('Verify the error should appear if update resume more than 2MB', {tag: ["@apply_1_004"]}, async ({ page }) => {
        await performJobSearch();
        await jobPage.fillInAllRequiredFieldsForApplyJobDialog();
        await jobPage.userClickNextButton();
        const filePath = path.resolve(process.cwd(), 'resources', 'sample-files', 'sample-resume-2mb.pdf');
        await jobPage.userUploadResume(filePath);
        await jobPage.verifyResumeUploadSuccess('sample-resume-2mb.pdf');
        await jobPage.verifyMessageUploadResumeInvalid("Please upload a smaller file (2 MB or less). Change file");
        await jobPage.verifyRemoveDocument();
    })
});