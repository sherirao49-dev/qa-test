
import { chromium } from "playwright";

(async () => {
    let browser;
    try {
        browser = await chromium.launch({ headless: false, slowMo: 1000 });
        const page = await browser.newPage();

        console.log("Navigating to Daraz.pk...");
        await page.goto("https://www.daraz.pk/");
        await page.waitForTimeout(5000); // CRITICAL RULE 4

        console.log("Searching for 'iPhone 15 covers'...");
        // Locate the search input field and fill it
        // Common selectors for search input on Daraz: input[placeholder="Search in Daraz"], input#q
        const searchInput = page.locator('input[placeholder="Search in Daraz"]');
        await searchInput.fill("iPhone 15 covers");
        await page.keyboard.press("Enter");
        await page.waitForTimeout(5000); // CRITICAL RULE 4

        console.log("Clicking on the first product image...");
        // CRITICAL RULE 5: Click on the first product using the provided selector
        // If the primary locator fails, a fallback would involve inspecting the page
        // and finding a more generic way to target the first product link/image.
        // For example, if it's consistently within a specific container, or any 'a' tag within a search result item.
        // The current instruction is to use the specific locator, or fall back to 'a' tag containing "iPhone"
        // Let's stick to the primary locator first as requested.
        try {
            await page.locator('div[data-qa-locator="product-item"] a, .gridItem--Yd0g9 a, div.box--Mj3Q7 a').first().click();
        } catch (error) {
            console.warn("Primary product locator failed, attempting fallback to first 'a' tag containing 'iPhone'.", error);
            await page.locator('a:has-text("iPhone")').first().click();
        }
        
        await page.waitForTimeout(5000); // CRITICAL RULE 4

        console.log("Clicking 'Add to Cart' button...");
        // Locate the 'Add to Cart' button. Common selectors: button:has-text("Add to Cart"), [data-qa-locator="add-to-cart"]
        const addToCartButton = page.locator('button:has-text("Add to Cart")');
        if (await addToCartButton.isVisible()) {
            await addToCartButton.click();
            await page.waitForTimeout(3000); // CRITICAL RULE 4
        } else {
            console.error("Add to Cart button not found or not visible.");
            console.log("TEST_RESULT: FAIL - Add to Cart button not found.");
            await browser.close();
            return;
        }

        console.log("Verifying Login Popup appeared...");
        // Check if "Password" or "LOGIN" text is visible on the screen
        const passwordText = page.locator('text=Password').first();
        const loginText = page.locator('text=LOGIN').first();
        
        const isPasswordVisible = await passwordText.isVisible();
        const isLoginVisible = await loginText.isVisible();

        if (isPasswordVisible || isLoginVisible) {
            console.log("Login popup detected (text 'Password' or 'LOGIN' is visible).");
            console.log("TEST_RESULT: PASS");
        } else {
            console.error("Login popup NOT detected (text 'Password' or 'LOGIN' is not visible).");
            console.log("TEST_RESULT: FAIL - Login popup did not appear.");
        }

    } catch (error) {
        console.error("An error occurred during the test:", error);
        console.log("TEST_RESULT: FAIL - An unhandled error occurred.");
    } finally {
        if (browser) {
            await browser.close();
            console.log("Browser closed.");
        }
    }
})();
