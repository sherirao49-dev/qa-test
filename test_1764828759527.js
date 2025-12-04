
import { chromium } from "playwright";

async function runTest() {
    let browser;
    let testResult = "FAIL"; // Default test result to FAIL

    try {
        // Rule 2: Launch browser with { headless: false, slowMo: 1000 }
        browser = await chromium.launch({
            headless: false,
            slowMo: 1000
        });
        const page = await browser.newPage();

        const targetUrl = 'https://www.daraz.pk/';

        // Rule 3: Use await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log(`Navigating to ${targetUrl}...`);
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log("Navigation successful.");

        // TASK: Search for 'iPhone 15 covers' and press Enter.
        console.log("Searching for 'iPhone 15 covers'...");
        // Identify the search input field. Daraz typically uses an input with placeholder "Search in Daraz" or an ID like "q".
        const searchInputSelector = 'input[placeholder*="Search in Daraz"], input[id="q"]';
        
        // Wait for the search input to be visible before interacting
        await page.waitForSelector(searchInputSelector, { timeout: 15000 });
        await page.fill(searchInputSelector, 'iPhone 15 covers');
        await page.press(searchInputSelector, 'Enter');
        console.log("Search initiated for 'iPhone 15 covers'.");

        // TASK: Wait 5 seconds.
        // Rule 4: Do NOT use waitForNavigation. Use await page.waitForTimeout(5000); instead.
        await page.waitForTimeout(5000);
        console.log("Waited 5 seconds after search.");

        // TASK: Click on the first product image in the results.
        console.log("Attempting to click the first product image...");
        // Rule 5: CRITICAL locator provided by the user. Includes fallback if initial selector fails.
        const productLocator = 'div[data-qa-locator="product-item"] a, .gridItem--Yd0g9 a, div.box--Mj3Q7 a';
        
        try {
            // Wait for at least one product to appear before attempting to click
            await page.waitForSelector(productLocator, { timeout: 15000 });
            await page.locator(productLocator).first().click();
            console.log("First product clicked using specified locator.");
        } catch (error) {
            console.warn(`Could not find product using critical locators. Error: ${error.message}`);
            console.log("Trying fallback: click first 'a' tag containing 'iPhone'...");
            // Fallback: click first 'a' tag containing "iPhone" (case-insensitive for robustness)
            await page.waitForSelector('a:has-text("iPhone")', { timeout: 15000 });
            await page.locator('a:has-text("iPhone")').first().click();
            console.log("First product clicked using fallback locator.");
        }

        // TASK: Wait 5 seconds.
        // Rule 4: Do NOT use waitForNavigation. Use await page.waitForTimeout(5000); instead.
        await page.waitForTimeout(5000);
        console.log("Waited 5 seconds after clicking product.");

        // TASK: Click the button 'Add to Cart'.
        console.log("Attempting to click 'Add to Cart' button...");
        // Common 'Add to Cart' button locators on e-commerce sites.
        // Using :has-text() for a robust text match on the button.
        const addToCartButtonSelector = 'button:has-text("Add to Cart")';
        
        // Wait for the 'Add to Cart' button to be visible and enabled
        await page.waitForSelector(addToCartButtonSelector, { state: 'visible', timeout: 15000 });
        await page.click(addToCartButtonSelector);
        console.log("'Add to Cart' button clicked.");

        // TASK: Wait 3 seconds.
        await page.waitForTimeout(3000);
        console.log("Waited 3 seconds after clicking 'Add to Cart'.");

        // TASK: Verify that the text 'Password' or 'LOGIN' is visible on the screen.
        console.log("Verifying visibility of 'Password' or 'LOGIN' text...");
        const isPasswordVisible = await page.locator('text=/Password/i').isVisible();
        const isLoginVisible = await page.locator('text=/LOGIN/i').isVisible(); // Case-insensitive check

        // Rule 6: To verify success, use simple 'if' statements.
        if (isPasswordVisible || isLoginVisible) {
            console.log("Verification successful: 'Password' or 'LOGIN' text is visible.");
            testResult = "PASS";
        } else {
            console.error("Verification failed: Neither 'Password' nor 'LOGIN' text was visible.");
            testResult = "FAIL";
        }

    } catch (error) {
        console.error(`An unexpected error occurred during the test: ${error.message}`);
        testResult = "FAIL"; // Mark test as FAIL if any unhandled exception occurs
    } finally {
        // Rule 7: Log "TEST_RESULT: PASS" or "TEST_RESULT: FAIL".
        console.log(`TEST_RESULT: ${testResult}`);
        if (browser) {
            await browser.close();
            console.log("Browser closed.");
        }
    }
}

// Execute the test function
runTest();
