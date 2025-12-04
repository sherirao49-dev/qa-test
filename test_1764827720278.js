
import { chromium } from "playwright";

async function runTest() {
    let browser;
    try {
        // CRITICAL RULE 2: Launch browser with headless: false and slowMo: 1000
        browser = await chromium.launch({ headless: false, slowMo: 1000 });
        const page = await browser.newPage();

        const targetUrl = 'https://www.daraz.pk/';
        // CRITICAL RULE 3: Use specific page.goto method
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Task: Search for 'iPhone 15 covers'
        // Find the search input field using its placeholder or a more specific selector if available.
        // On Daraz, the search input often has placeholder="Search in Daraz"
        const searchInput = page.locator('input[placeholder="Search in Daraz"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('iPhone 15 covers');
            await searchInput.press('Enter');
        } else {
            console.log("TEST_RESULT: FAIL - Search input not found or visible.");
            return;
        }

        // Task: Wait 5 seconds after search
        // CRITICAL RULE 4: Do NOT use waitForNavigation. Use await page.waitForTimeout(5000);
        await page.waitForTimeout(5000);

        // Task: Click on the first product image in the results
        // CRITICAL RULE 5: Use specific locator for clicking the product
        let productClicked = false;
        try {
            await page.locator('div[data-qa-locator="product-item"] a, .gridItem--Yd0g9 a, div.box--Mj3Q7 a').first().click();
            productClicked = true;
        } catch (error) {
            console.log("Specific product locator failed, attempting fallback...");
            // Fallback: click the first 'a' tag containing "iPhone"
            const fallbackLocator = page.locator('a:has-text("iPhone")').first();
            if (await fallbackLocator.isVisible()) {
                await fallbackLocator.click();
                productClicked = true;
            } else {
                console.log("Fallback product locator also failed.");
            }
        }

        if (!productClicked) {
            console.log("TEST_RESULT: FAIL - Could not click any product link.");
            return;
        }

        // Task: Wait 5 seconds after clicking product
        await page.waitForTimeout(5000);

        // Task: Click the button 'Add to Cart'
        // Find the 'Add to Cart' button. It's often a button with that text.
        const addToCartButton = page.locator('button:has-text("Add to Cart")');
        if (await addToCartButton.isVisible()) {
            await addToCartButton.click();
        } else {
            console.log("TEST_RESULT: FAIL - 'Add to Cart' button not found or visible.");
            return;
        }

        // Task: Wait 3 seconds
        await page.waitForTimeout(3000);

        // Task: Verify that the text 'Password' or 'LOGIN' is visible on the screen
        // CRITICAL RULE 6: Use simple 'if' statements for verification
        const passwordTextVisible = await page.locator('text=Password').isVisible();
        const loginTextVisible = await page.locator('text=LOGIN').isVisible();

        if (passwordTextVisible || loginTextVisible) {
            // CRITICAL RULE 7: Log TEST_RESULT
            console.log("TEST_RESULT: PASS");
        } else {
            console.log("TEST_RESULT: FAIL - Neither 'Password' nor 'LOGIN' text was visible on the screen.");
        }

    } catch (error) {
        console.error(`An unexpected error occurred: ${error.message}`);
        // CRITICAL RULE 7: Log TEST_RESULT
        console.log("TEST_RESULT: FAIL");
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

runTest();
