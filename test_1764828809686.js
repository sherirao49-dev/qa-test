
import { chromium } from "playwright";

async function runTest() {
    const url = "https://www.daraz.pk/";
    let browser;
    try {
        // Rule 2: Launch browser with { headless: false, slowMo: 1000 }
        browser = await chromium.launch({ headless: false, slowMo: 1000 });
        const page = await browser.newPage();

        // Rule 3: Use: await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log(`Navigated to ${url}`);

        // TASK: Search for 'iPhone 15 covers' and press Enter.
        // Locate the search input field.
        // Common selectors include input[placeholder*="Search"], input#q, or specific data attributes.
        const searchInputLocator = page.locator('input[placeholder*="Search in Daraz"], input#q');
        await searchInputLocator.fill('iPhone 15 covers');
        await searchInputLocator.press('Enter');
        console.log("Searched for 'iPhone 15 covers' and pressed Enter.");

        // Rule 4: Wait 5 seconds. Do NOT use waitForNavigation.
        await page.waitForTimeout(5000);
        console.log("Waited 5 seconds after search.");

        // TASK: Click on the first product image in the results.
        // Rule 5: CRITICAL: Use the specified locator, with fallback.
        try {
            await page.locator('div[data-qa-locator="product-item"] a, .gridItem--Yd0g9 a, div.box--Mj3Q7 a').first().click();
            console.log("Clicked on the first product using the primary locator.");
        } catch (error) {
            console.warn("Primary product locator failed, attempting fallback. Error:", error.message);
            // Fallback: click first 'a' tag containing "iPhone" in its text or href attribute
            await page.locator('a:has-text("iPhone"), a[href*="iphone"]').first().click();
            console.log("Clicked on the first product using fallback locator.");
        }
        
        // Rule 4: Wait 5 seconds. Do NOT use waitForNavigation.
        await page.waitForTimeout(5000);
        console.log("Waited 5 seconds after clicking product.");

        // TASK: Click the button 'Add to Cart'.
        const addToCartButtonLocator = page.locator('button:has-text("Add to Cart")');
        // Wait for the button to be visible and enabled before clicking.
        await addToCartButtonLocator.waitFor({ state: 'visible', timeout: 10000 });
        await addToCartButtonLocator.click();
        console.log("Clicked 'Add to Cart' button.");

        // Rule 4: Wait 3 seconds. Do NOT use waitForNavigation.
        await page.waitForTimeout(3000);
        console.log("Waited 3 seconds after clicking 'Add to Cart'.");

        // TASK: Verify that the text 'Password' or 'LOGIN' is visible on the screen.
        const isPasswordTextVisible = await page.locator('text="Password"').isVisible();
        const isLoginTextVisible = await page.locator('text="LOGIN"').isVisible();

        // Rule 6: To verify success, use simple 'if' statements.
        if (isPasswordTextVisible || isLoginTextVisible) {
            console.log("Verification successful: 'Password' or 'LOGIN' text is visible.");
            // Rule 7: Log "TEST_RESULT: PASS"
            console.log("TEST_RESULT: PASS");
        } else {
            console.error("Verification failed: Neither 'Password' nor 'LOGIN' text is visible.");
            // Rule 7: Log "TEST_RESULT: FAIL"
            console.log("TEST_RESULT: FAIL");
        }

    } catch (error) {
        console.error(`An unexpected error occurred during the test: ${error.message}`);
        // Rule 7: Log "TEST_RESULT: FAIL" in case of any unhandled error
        console.log("TEST_RESULT: FAIL");
    } finally {
        if (browser) {
            await browser.close();
            console.log("Browser closed.");
        }
    }
}

runTest();
