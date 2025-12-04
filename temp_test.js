
import { chromium } from "playwright";

async function runTest() {
    let browser;
    try {
        // CRITICAL RULE 2: Launch browser with { headless: false, slowMo: 1000 }
        browser = await chromium.launch({ headless: false, slowMo: 1000 });
        const page = await browser.newPage();

        // TASK: Navigate to TARGET URL
        await page.goto("https://www.daraz.pk/");
        // CRITICAL RULE 4: Use waitForTimeout after every click or navigation
        await page.waitForTimeout(5000);

        // TASK: Search for 'iPhone 15 covers' and press Enter
        // Assuming the search input has an id 'q' on Daraz.pk
        await page.fill("#q", "iPhone 15 covers");
        await page.press("#q", "Enter");
        // CRITICAL RULE 4: Use waitForTimeout after every click or navigation
        await page.waitForTimeout(5000); // Wait for search results to load

        // TASK: Click on the first product image in the results
        // CRITICAL RULE 5: Use the specified locator
        await page.locator('div[data-qa-locator="product-item"] a, .gridItem--Yd0g9 a, div.box--Mj3Q7 a').first().click();
        // CRITICAL RULE 4: Use waitForTimeout after every click or navigation
        await page.waitForTimeout(5000); // Wait for the product detail page to load

        // TASK: Click the button 'Add to Cart'
        // Assuming the 'Add to Cart' button has the text "Add to Cart"
        await page.click('button:has-text("Add to Cart")');
        // CRITICAL RULE 4: Use waitForTimeout after every click or navigation (3 seconds as specified)
        await page.waitForTimeout(3000); // Wait for the login popup to appear

        // TASK: Verify that the text 'Password' or 'LOGIN' is visible on the screen
        // CRITICAL RULE 6: Use simple 'if' statements for verification
        const isPasswordVisible = await page.locator('text=Password').isVisible();
        const isLoginVisible = await page.locator('text=LOGIN').isVisible();

        if (isPasswordVisible || isLoginVisible) {
            // CRITICAL RULE 7: Log "TEST_RESULT: PASS"
            console.log("TEST_RESULT: PASS - Login/Password popup appeared.");
        } else {
            // CRITICAL RULE 7: Log "TEST_RESULT: FAIL"
            console.log("TEST_RESULT: FAIL - Login/Password popup did not appear.");
        }

    } catch (error) {
        // Log any unexpected errors
        // CRITICAL RULE 7: Log "TEST_RESULT: FAIL"
        console.log(`TEST_RESULT: FAIL - An error occurred: ${error.message}`);
    } finally {
        // Ensure the browser is closed even if an error occurs
        if (browser) {
            await browser.close();
        }
    }
}

// Execute the test function
runTest();
