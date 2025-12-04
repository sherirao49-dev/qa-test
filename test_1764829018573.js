
import { chromium } from "playwright";

async function runTest() {
    let browser;
    try {
        // Rule 2: Launch browser with specific options
        browser = await chromium.launch({ headless: false, slowMo: 1000 });
        const page = await browser.newPage();

        const targetUrl = "https://www.daraz.pk/";

        // Rule 3: Navigate to the target URL with specific options
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log(`Navigated to: ${targetUrl}`);

        // Search for 'iPhone 15 covers'
        // Using common selectors for Daraz search bar
        const searchInputSelector = 'input[type="search"], #q, .search-box__input';
        const searchInput = page.locator(searchInputSelector).first();
        await searchInput.waitFor({ state: 'visible', timeout: 10000 }); // Wait for the search input to be visible
        await searchInput.fill('iPhone 15 covers');
        await searchInput.press('Enter');
        console.log("Searched for 'iPhone 15 covers' and pressed Enter.");

        // Rule 4: Wait 5 seconds
        await page.waitForTimeout(5000);
        console.log("Waited 5 seconds after search.");

        // Click on the first product image in the results
        // Rule 5: Use the specified locator, with a fallback
        const productLocator = 'div[data-qa-locator="product-item"] a, .gridItem--Yd0g9 a, div.box--Mj3Q7 a';
        try {
            await page.locator(productLocator).first().click();
            console.log("Clicked on the first product using the primary locator.");
        } catch (error) {
            console.warn("Primary product locator failed, trying fallback: 'a' tag containing 'iPhone'.");
            await page.locator('a:has-text("iPhone")').first().click(); // Fallback
            console.log("Clicked on the first product using the fallback locator.");
        }

        // Rule 4: Wait 5 seconds
        await page.waitForTimeout(5000);
        console.log("Waited 5 seconds after clicking product.");

        // Click the button 'Add to Cart'
        // Using common selectors for 'Add to Cart' button
        const addToCartButtonSelector = 'button:has-text("Add to Cart"), #add-to-cart, .add-to-cart-btn, [data-spm-anchor-id*="add-to-cart"]';
        const addToCartButton = page.locator(addToCartButtonSelector).first();
        await addToCartButton.waitFor({ state: 'visible', timeout: 10000 }); // Wait for the add to cart button to be visible
        await addToCartButton.click();
        console.log("Clicked 'Add to Cart' button.");

        // Rule 4: Wait 3 seconds
        await page.waitForTimeout(3000);
        console.log("Waited 3 seconds after clicking 'Add to Cart'.");

        // Verify that the text 'Password' or 'LOGIN' is visible on the screen.
        // Look for various elements that might indicate a login/password prompt
        const verificationLocator = page.locator(
            'text=/^(Password|LOGIN)$/i, ' + // Exact text "Password" or "LOGIN" (case-insensitive)
            'input[type="password"], ' +     // Any password input field
            'a:has-text("Login"), ' +        // An anchor tag with text "Login"
            'button:has-text("Login")'       // A button with text "Login"
        );
        const isLoginPromptVisible = await verificationLocator.first().isVisible();

        // Rule 6: Use simple 'if' statements for verification
        if (isLoginPromptVisible) {
            console.log("Verification successful: 'Password' or 'LOGIN' related elements are visible.");
            // Rule 7: Log "TEST_RESULT: PASS"
            console.log("TEST_RESULT: PASS");
        } else {
            console.error("Verification failed: 'Password' or 'LOGIN' related elements are NOT visible.");
            // Rule 7: Log "TEST_RESULT: FAIL"
            console.log("TEST_RESULT: FAIL");
        }

    } catch (error) {
        console.error("An error occurred during the test:", error);
        // Rule 7: Log "TEST_RESULT: FAIL"
        console.log("TEST_RESULT: FAIL");
    } finally {
        // Close the browser
        if (browser) {
            await browser.close();
            console.log("Browser closed.");
        }
    }
}

runTest();
