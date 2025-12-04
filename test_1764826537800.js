
import { chromium } from "playwright";

async function runDarazTest() {
    let browser;
    try {
        // CRITICAL RULE 2: Launch browser with { headless: false, slowMo: 1000 }
        browser = await chromium.launch({ headless: false, slowMo: 1000 });
        const page = await browser.newPage();
        const url = 'https://www.daraz.pk/';

        console.log(`Navigating to ${url}`);
        // CRITICAL RULE 3: Use specific page.goto options
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // TASK: Search for 'iPhone 15 covers' and press Enter.
        console.log("Searching for 'iPhone 15 covers'...");
        // Locate the search input field using its placeholder
        const searchInput = page.locator('input[placeholder="Search in Daraz"]');
        await searchInput.fill('iPhone 15 covers');
        await page.keyboard.press('Enter');
        console.log("Search initiated.");

        // TASK: Wait 5 seconds.
        // CRITICAL RULE 4: Use await page.waitForTimeout() instead of waitForNavigation
        await page.waitForTimeout(5000);

        // TASK: Click on the first product image in the results.
        console.log("Clicking on the first product image...");
        // Locator for the first product image. Daraz product cards typically use a class like 'box--ujm9f'.
        // We look for an image within such a product card and select the first one.
        const firstProductImage = page.locator('div.box--ujm9f img').first();
        // It's good practice to wait for the element to be visible before interacting.
        await firstProductImage.waitFor({ state: 'visible', timeout: 10000 });
        // CRITICAL RULE 5: Use .click({ force: true })
        await firstProductImage.click({ force: true });
        console.log("Clicked the first product image.");

        // TASK: Wait 5 seconds.
        // CRITICAL RULE 4: Use await page.waitForTimeout() instead of waitForNavigation
        await page.waitForTimeout(5000);

        // TASK: Click the button 'Add to Cart'.
        console.log("Clicking 'Add to Cart' button...");
        // Locator for the 'Add to Cart' button on the product detail page.
        const addToCartButton = page.locator('button:has-text("Add to Cart")');
        await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
        // CRITICAL RULE 5: Use .click({ force: true })
        await addToCartButton.click({ force: true });
        console.log("Clicked 'Add to Cart' button.");

        // TASK: Wait 3 seconds.
        // CRITICAL RULE 4: Use await page.waitForTimeout() instead of waitForNavigation
        await page.waitForTimeout(3000);

        // TASK: Verify that the text 'Password' or 'LOGIN' is visible on the screen.
        console.log("Verifying 'Password' or 'LOGIN' text visibility...");
        const isPasswordVisible = await page.locator('text=Password').isVisible();
        const isLoginVisible = await page.locator('text=LOGIN').isVisible();

        // CRITICAL RULE 6: To verify success, use simple 'if' statements.
        if (isPasswordVisible || isLoginVisible) {
            console.log("Verification successful: 'Password' or 'LOGIN' text is visible.");
            // CRITICAL RULE 7: Log "TEST_RESULT: PASS" or "TEST_RESULT: FAIL"
            console.log("TEST_RESULT: PASS");
        } else {
            console.log("Verification failed: 'Password' or 'LOGIN' text is not visible.");
            // CRITICAL RULE 7: Log "TEST_RESULT: PASS" or "TEST_RESULT: FAIL"
            console.log("TEST_RESULT: FAIL");
        }

    } catch (error) {
        console.error("An error occurred during the test:", error);
        // CRITICAL RULE 7: Log "TEST_RESULT: PASS" or "TEST_RESULT: FAIL"
        console.log("TEST_RESULT: FAIL");
    } finally {
        if (browser) {
            await browser.close();
            console.log("Browser closed.");
        }
    }
}

runDarazTest();
