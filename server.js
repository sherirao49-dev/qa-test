import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static('public'));

app.post('/api/run-test', async (req, res) => {
    const { url, instruction, apiKey } = req.body;

    if (!apiKey) {
        return res.status(400).json({ error: "API Key is missing!" });
    }

    try {
        console.log("1. Requesting Gemini...");

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using the working model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are a QA Automation Engineer. Write a complete Node.js Playwright script.
        TARGET URL: ${url}
        TASK: ${instruction}
        
        CRITICAL RULES:
        1. Use 'import { chromium } from "playwright";' ONLY. Do NOT import 'expect'.
        2. Launch browser with { headless: false, slowMo: 1000 }.
        3. CRITICAL: Do NOT use 'waitForNavigation' or 'waitForLoadState'. They cause timeouts.
        4. INSTREAD: Use 'await page.waitForTimeout(5000);' after every click or navigation.
        5. When clicking the product, use: await page.locator('div[data-qa-locator="product-item"] a, .gridItem--Yd0g9 a, div.box--Mj3Q7 a').first().click();
           (If those specific classes fail, fall back to clicking the first 'a' tag containing "iPhone").
        6. To verify success, use simple 'if' statements.
        7. Log "TEST_RESULT: PASS" or "TEST_RESULT: FAIL".
        8. Output ONLY raw javascript code.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let code = response.text();
        
        code = code.replace(/```javascript/g, '').replace(/```/g, '');

        const testFileName = 'temp_test.js';
        fs.writeFileSync(testFileName, code);

        console.log("3. Running generated script...");
        exec(`node ${testFileName}`, (error, stdout, stderr) => {
            console.log("4. Finished.");
            res.json({
                success: true,
                output: stdout,
                error: stderr,
                generatedCode: code
            });
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});