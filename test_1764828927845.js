
import { chromium } from "playwright";

async function runTest() {
    const TARGET_URL = "https://www.daraz.pk/";
    let browser;
    let testPassed = false;

    try {
        browser = await chromium.launch({ headless: false, slowMo: 1000 });
        const page = await browser.newPage();

        console.log(`Navigating to ${TARGET_URL}`);
        await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log("Navigation complete.");

        // TASK: Search for 'iPhone 15 covers' and press Enter.
        const searchInput = page.locator('input[placeholder="Search in Daraz"]');
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });
        await searchInput.fill('iPhone 15 covers');
        console.log("Typed 'iPhone 15 covers' into search bar.");
        await searchInput.press('Enter');
        console.log("Pressed Enter.");

        // TASK: Wait 5 seconds.
        await page.waitForTimeout(5000);
        console.log("Waited 5 seconds after search.");

        // TASK: Click on the first product image in the results.
        // CRITICAL: Use specified locator with fallback
        let productLinkLocator = page.locator('div[data-qa-locator="product-item"] a, .gridItem--Yd0g9 a, div.box--Mj3Q7 a').first();
        
        try {
            await productLinkLocator.waitFor({ state: 'visible', timeout: 10000 });
            await productLinkLocator.click();
            console.log("Clicked the first product using the primary locator.");
        } catch (error) {
            console.warn("Primary product locator failed, attempting fallback: 'a' tag containing 'iPhone'.");
            productLinkLocator = page.locator('a:has-text("iPhone")').first();
            await productLinkLocator.waitFor({ state: 'visible', timeout: 10000 });
            await productLinkLocator.click();
            console.log("Clicked the first product using the fallback locator.");
        }
        
        // TASK: Wait 5 seconds.
        await page.waitForTimeout(5000);
        console.log("Waited 5 seconds after clicking product.");

        // TASK: Click the button 'Add to Cart'.
        const addToCartButton = page.locator('button:has-text("Add to Cart")');
        await addToCartButton.waitFor({ state: 'visible', timeout: 10000 });
        await addToCartButton.click();
        console.log("Clicked 'Add to Cart' button.");

        // TASK: Wait 3 seconds.
        await page.waitForTimeout(3000);
        console.log("Waited 3 seconds after clicking 'Add to Cart'.");

        // TASK: Verify that the text 'Password' or 'LOGIN' is visible on the screen.
        const isPasswordTextVisible = await page.locator('text=Password').isVisible();
        const isLoginTextVisible = await page.locator('text=LOGIN').isVisible();

        if (isPasswordTextVisible || isLoginTextVisible) {
            console.log("Verification successful: 'Password' or 'LOGIN' text is visible.");
            testPassed = true;
        } else {
            console.error("Verification failed: Neither 'Password' nor 'LOGIN' text is visible on the screen.");
            testPassed = false;
        }

    } catch (error) {
        console.error("An error occurred during the test:", error);
        testPassed = false;
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

runTest();
