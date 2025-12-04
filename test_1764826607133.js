
import { chromium } from "playwright";

async function runTest() {
    let browser;
    try {
        // CRITICAL RULE 2: Launch browser with specified options
        browser = await chromium.launch({
            headless: false, // Ensures the browser UI is visible
            slowMo: 1000     // Slows down Playwright operations by 1 second for better observation
        });
        const page = await browser.newPage();
        const url = "https://www.daraz.pk/";

        // CRITICAL RULE 3: Visit the URL with specific options
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log("Navigation complete.");

        // TASK: Search for 'iPhone 15 covers' and press Enter.
        // The search input field on Daraz typically has a placeholder like "Search in Daraz"
        const searchInputSelector = 'input[placeholder="Search in Daraz"]';
        console.log("Waiting for search input field to be visible...");
        await page.waitForSelector(searchInputSelector);
        console.log("Typing 'iPhone 15 covers' into search bar.");
        await page.fill(searchInputSelector, 'iPhone 15 covers');
        await page.press(searchInputSelector, 'Enter');
        console.log("Search initiated.");

        // TASK: Wait 5 seconds.
        // CRITICAL RULE 4: Do NOT use waitForNavigation. Use await page.waitForTimeout(5000);
        console.log("Waiting 5 seconds after search results load.");
        await page.waitForTimeout(5000);

        // TASK: Click on the first product image in the results.
        // Daraz search results often have product items in a structure like 'div.gridItem--YJ5x'
        // and the main clickable link is often an 'a' tag within it.
        const firstProductLinkSelector = 'div.gridItem--YJ5x:first-child a';
        console.log("Waiting for the first product link to be visible...");
        await page.waitForSelector(firstProductLinkSelector, { timeout: 10000 }); // Added a timeout for the selector itself
        console.log("Clicking on the first product link in the search results.");
        // CRITICAL RULE 5: When clicking elements, use .click({ force: true }).
        await page.click(firstProductLinkSelector, { force: true });
        console.log("Clicked the first product.");

        // TASK: Wait 5 seconds.
        // CRITICAL RULE 4: Do NOT use waitForNavigation. Use await page.waitForTimeout(5000);
        console.log("Waiting 5 seconds for the product detail page to load.");
        await page.waitForTimeout(5000);

        // TASK: Click the button 'Add to Cart'.
        // The 'Add to Cart' button is commonly identified by its text content.
        const addToCartButtonSelector = 'button:has-text("Add to Cart")';
        console.log("Waiting for 'Add to Cart' button to be visible...");
        await page.waitForSelector(addToCartButtonSelector, { timeout: 10000 }); // Added a timeout for the selector itself
        console.log("Clicking 'Add to Cart' button.");
        // CRITICAL RULE 5: When clicking elements, use .click({ force: true }).
        await page.click(addToCartButtonSelector, { force: true });
        console.log("'Add to Cart' button clicked.");

        // TASK: Wait 3 seconds.
        // CRITICAL RULE 4: Do NOT use waitForNavigation. Use await page.waitForTimeout(3000);
        console.log("Waiting 3 seconds after clicking 'Add to Cart'.");
        await page.waitForTimeout(3000);

        // TASK: Verify that the text 'Password' or 'LOGIN' is visible on the screen.
        // After adding to cart, if not logged in, Daraz typically prompts for login.
        // We check for the presence of common login-related texts.
        // CRITICAL RULE 6: To verify success, use simple 'if' statements.
        const isPasswordTextVisible = await page.isVisible('text=Password', { timeout: 2000 }); // Check for 'Password' text
        const isLoginTextVisible = await page.isVisible('text=LOGIN', { timeout: 2000 });     // Check for 'LOGIN' text

        if (isPasswordTextVisible || isLoginTextVisible) {
            console.log("Verification successful: 'Password' or 'LOGIN' text is visible, indicating a login prompt.");
            // CRITICAL RULE 7: Log "TEST_RESULT: PASS"
            console.log("TEST_RESULT: PASS");
        } else {
            console.log("Verification failed: Neither 'Password' nor 'LOGIN' text is visible after Add to Cart.");
            // CRITICAL RULE 7: Log "TEST_RESULT: FAIL"
            console.log("TEST_RESULT: FAIL");
        }

    } catch (error) {
        console.error("An error occurred during the test:", error);
        // CRITICAL RULE 7: Log "TEST_RESULT: FAIL" if any error occurs
        console.log("TEST_RESULT: FAIL");
    } finally {
        if (browser) {
            await browser.close();
            console.log("Browser closed.");
        }
    }
}

runTest();
