
import { chromium } from "playwright";

(async () => {
    let browser;
    try {
        // Rule 2: Launch browser with { headless: false, slowMo: 1000 }
        browser = await chromium.launch({ headless: false, slowMo: 1000 });
        const page = await browser.newPage();

        const url = 'https://www.daraz.pk/';

        // Rule 3: Use await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log("Navigation complete.");

        // Task: Search for 'iPhone 15 covers' and press Enter.
        const searchInput = page.locator('#q'); // Locator for the search input field
        console.log("Typing 'iPhone 15 covers' into search bar and pressing Enter...");
        await searchInput.fill('iPhone 15 covers');
        await searchInput.press('Enter');
        console.log("Search initiated.");

        // Task: Wait 5 seconds. (Rule 4: Use await page.waitForTimeout(5000);)
        console.log("Waiting 5 seconds after search results load...");
        await page.waitForTimeout(5000);

        // Task: Click on the first product image in the results.
        // Assuming products are in a div with class 'box--ujm3r' and image is inside.
        // Rule 5: Use .click({ force: true })
        console.log("Attempting to click the first product image...");
        const firstProductImage = page.locator('div.box--ujm3r img').first();
        await firstProductImage.click({ force: true });
        console.log("First product image clicked.");

        // Task: Wait 5 seconds. (Rule 4: Use await page.waitForTimeout(5000);)
        console.log("Waiting 5 seconds on product detail page...");
        await page.waitForTimeout(5000);

        // Task: Click the button 'Add to Cart'.
        // Rule 5: Use .click({ force: true })
        console.log("Attempting to click 'Add to Cart' button...");
        const addToCartButton = page.locator('button:has-text("Add to Cart")');
        await addToCartButton.waitFor({ state: 'visible', timeout: 10000 }); // Wait for the button to be visible
        await addToCartButton.click({ force: true });
        console.log("'Add to Cart' button clicked.");

        // Task: Wait 3 seconds. (Rule 4: Use await page.waitForTimeout(3000);)
        console.log("Waiting 3 seconds after clicking 'Add to Cart'...");
        await page.waitForTimeout(3000);

        // Task: Verify that the text 'Password' or 'LOGIN' is visible on the screen.
        let isVerificationTextVisible = false;
        try {
            console.log("Verifying if 'Password' or 'LOGIN' text is visible...");
            const passwordElement = page.locator('text=Password');
            const loginElement = page.locator('text=LOGIN');
            
            // Check visibility after the specified 3-second wait
            const passwordTextVisible = await passwordElement.isVisible();
            const loginTextVisible = await loginElement.isVisible();

            if (passwordTextVisible || loginTextVisible) {
                isVerificationTextVisible = true;
                console.log("Verification successful: 'Password' or 'LOGIN' text is visible.");
            } else {
                console.log("Verification failed: Neither 'Password' nor 'LOGIN' text was visible.");
            }
        } catch (e) {
            console.error("Error during verification process:", e.message);
        }

        // Rule 6: Log "TEST_RESULT: PASS" or "TEST_RESULT: FAIL".
        if (isVerificationTextVisible) {
            console.log("TEST_RESULT: PASS");
        } else {
            console.log("TEST_RESULT: FAIL");
        }

    } catch (error) {
        console.error("An unhandled error occurred during the test execution:", error);
        // Rule 6: Log "TEST_RESULT: FAIL" in case of any unhandled error
        console.log("TEST_RESULT: FAIL");
    } finally {
        if (browser) {
            console.log("Closing browser.");
            await browser.close();
        }
    }
})();
