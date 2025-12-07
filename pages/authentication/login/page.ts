import { Page } from "@playwright/test";
import { LoginActions } from "./actions";

export class LoginPage{
    readonly page: Page;
    readonly loginActions: LoginActions;
    constructor(page: Page){
        this.page = page;
        this.loginActions = new LoginActions(page);
    }

    async userSelectLoginWithEmailOption(){
        await this.loginActions.clickLoginWithEmail();
    }

    async userLoginByEmail(email: string, password: string): Promise<void> {
        const isLoginFormVisible =  await this.loginActions.checkLoginFormVisible();
        if(isLoginFormVisible){
            await this.userEnterCredentials(email, password);
            await this.userSubmitLogin();
        }
    }

    async userSubmitLogin(){
        await this.loginActions.clickSignInButton();
    }

    async userEnterCredentials(email: string, password: string): Promise<void> {
        await this.loginActions.enterEmail(email);
        await this.loginActions.enterPassword(password);
    }
}