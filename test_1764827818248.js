
import { chromium } from "playwright";

async function testScript() {
    const url = "https://www.daraz.pk/";
    let browser;
    let testPassed = false;

    try {
        console.log("Launching browser...");
        browser = await chromium.launch({ headless: false, slowMo: 1000 });
        const page = await browser.newPage();

        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log("Navigation successful.");

        // TASK: Search for 'iPhone 15 covers' and press Enter.
        console.log("Searching for 'iPhone 15 covers'...");
        // Assuming the search input has a placeholder "Search in Daraz"
        const searchInput = page.locator('input[placeholder="Search in Daraz"]');
        await searchInput.fill('iPhone 15 covers');
        await searchInput.press('Enter');
        
        // Wait 5 seconds.
        console.log("Search initiated. Waiting 5 seconds for results to load...");
        await page.waitForTimeout(5000);

        // TASK: Click on the first product image in the results.
        console.log("Attempting to click the first product image...");
        try {
            // CRITICAL: Use the primary selector as specified
            await page.locator('div[data-qa-locator="product-item"] a, .gridItem--Yd0g9 a, div.box--Mj3Q7 a').first().click();
            console.log("Clicked product using primary selector.");
        } catch (error) {
            console.warn("Primary product selector failed, attempting fallback selector 'a:has-text(\"iPhone\")'. Error:", error.message);
            // Fallback: click the first 'a' tag containing "iPhone"
            await page.locator('a:has-text("iPhone")').first().click();
            console.log("Clicked product using fallback selector.");
        }

        // Wait 5 seconds.
        console.log("Waiting 5 seconds after clicking the product...");
        await page.waitForTimeout(5000);

        // TASK: Click the button 'Add to Cart'.
        console.log("Attempting to click 'Add to Cart' button...");
        const addToCartButton = page.locator('button:has-text("Add to Cart")');
        
        // Check if the button is visible before attempting to click
        if (await addToCartButton.isVisible()) {
            await addToCartButton.click();
            console.log("Clicked 'Add to Cart'.");

            // Wait 3 seconds.
            console.log("Waiting 3 seconds after adding to cart...");
            await page.waitForTimeout(3000);

            // TASK: Verify that the text 'Password' or 'LOGIN' is visible on the screen.
            console.log("Verifying if 'Password' or 'LOGIN' text is visible for login prompt...");
            const isPasswordTextVisible = await page.locator('text="Password"').isVisible();
            const isLoginTextVisible = await page.locator('text="LOGIN"').isVisible();

            if (isPasswordTextVisible || isLoginTextVisible) {
                console.log("Verification successful: 'Password' or 'LOGIN' text is visible.");
                testPassed = true;
            } else {
                console.error("Verification failed: Neither 'Password' nor 'LOGIN' text is visible.");
            }
        } else {
            console.error("Verification failed: 'Add to Cart' button not found or not visible.");
        }

    } catch (error) {
        console.error("An unexpected error occurred during the test execution:", error);
    } finally {
        if (browser) {
            await browser.close();
            console.log("Browser closed.");
        }
        if (testPassed) {
            console.log("TEST_RESULT: PASS");
        } else {
            console.log("TEST_RESULT: FAIL");
        }
    }
}

// Execute the test script
testScript();
