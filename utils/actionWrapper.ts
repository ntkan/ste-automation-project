import { Page, Locator, expect } from '@playwright/test';
 
export class ActionLogger {
    private static log(level: string, message: string, context?: any): void {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
        console.log(`[${timestamp}] [${level}] ${message}${contextStr}`);
    }
 
    static info(message: string, context?: any): void {
        this.log('INFO', message, context);
    }
 
    static error(message: string, context?: any): void {
        this.log('ERROR', message, context);
    }
 
    static warn(message: string, context?: any): void {
        this.log('WARN', message, context);
    }
}
 
export class SafeActions {
    static async click(locator: Locator, description: string, retries = 3): Promise<void> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                ActionLogger.info(`Attempting to ${description}`, { attempt, retries });
                
                await locator.waitFor({ state: 'visible', timeout: 30000 });
                await locator.click();
                
                ActionLogger.info(`Successfully ${description}`);
                return;
                
            } catch (error) {
                ActionLogger.warn(`${description} failed on attempt ${attempt}`, { 
                    error: error instanceof Error ? error.message : String(error) 
                });
                
                if (attempt === retries) {
                    ActionLogger.error(`${description} failed after all attempts`, { error });
                    throw new Error(`Failed to ${description}: ${error}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
 
    static async fill(locator: Locator, value: string, description: string, retries = 3): Promise<void> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                ActionLogger.info(`Attempting to ${description}`, { attempt, retries, value });
                
                await locator.waitFor({ state: 'visible', timeout: 30000 });
                await locator.clear();
                await locator.fill(value);
                
                // Verify value was set correctly
                const actualValue = await locator.inputValue();
                if (actualValue !== value) {
                    throw new Error(`Value mismatch. Expected: "${value}", Got: "${actualValue}"`);
                }
                
                ActionLogger.info(`Successfully ${description}`, { value });
                return;
                
            } catch (error) {
                ActionLogger.warn(`${description} failed on attempt ${attempt}`, { 
                    error: error instanceof Error ? error.message : String(error),
                    value 
                });
                
                if (attempt === retries) {
                    ActionLogger.error(`${description} failed after all attempts`, { error, value });
                    throw new Error(`Failed to ${description}: ${error}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
 
    static async getText(locator: Locator, description: string, retries = 3): Promise<string> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                ActionLogger.info(`Attempting to ${description}`, { attempt, retries });
                
                await locator.waitFor({ state: 'visible', timeout: 30000 });
                const text = await locator.innerText();
                
                ActionLogger.info(`Successfully ${description}`, { text });
                return text;
                
            } catch (error) {
                ActionLogger.warn(`${description} failed on attempt ${attempt}`, { 
                    error: error instanceof Error ? error.message : String(error) 
                });
                
                if (attempt === retries) {
                    ActionLogger.error(`${description} failed after all attempts`, { error });
                    throw new Error(`Failed to ${description}: ${error}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
 
    static async waitForVisible(locator: Locator, description: string, timeout = 30000): Promise<void> {
        try {
            ActionLogger.info(`Waiting for ${description} to be visible`, { timeout });
            await expect(locator).toBeVisible({ timeout });
            ActionLogger.info(`${description} is now visible`);
        } catch (error) {
            ActionLogger.error(`${description} did not become visible`, { 
                error: error instanceof Error ? error.message : String(error),
                timeout 
            });
            throw error;
        }
    }
 
    static async setFiles(locator: Locator, filePath: string, description: string, retries = 3): Promise<void> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                ActionLogger.info(`Attempting to ${description}`, { attempt, retries, filePath });
                
                await locator.setInputFiles(filePath);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for file processing
                
                ActionLogger.info(`Successfully ${description}`, { filePath });
                return;
                
            } catch (error) {
                ActionLogger.warn(`${description} failed on attempt ${attempt}`, { 
                    error: error instanceof Error ? error.message : String(error),
                    filePath 
                });
                
                if (attempt === retries) {
                    ActionLogger.error(`${description} failed after all attempts`, { error, filePath });
                    throw new Error(`Failed to ${description}: ${error}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    static async navigateToURL(page: Page, url: string, description = "navigate to URL", retries = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            ActionLogger.info(`Attempting to ${description}`, { attempt, retries, url });

            await page.goto(url);

            // Optional settle time after navigation
            await new Promise(resolve => setTimeout(resolve, 2000));

            ActionLogger.info(`Successfully ${description}`, { url });
            return;

        } catch (error) {
            ActionLogger.warn(`${description} failed on attempt ${attempt}`, {
                error: error instanceof Error ? error.message : String(error),
                url
            });

            if (attempt === retries) {
                ActionLogger.error(`${description} failed after all attempts`, { error, url });
                throw new Error(`Failed to ${description}: ${error}`);
            }

            // Exponential backoff (same as your upload function)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}

}