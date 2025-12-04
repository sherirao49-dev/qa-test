import 'dotenv/config'; 
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- DATABASE SETUP ---
const db = new sqlite3.Database('./webapp.sqlite', (err) => {
    if (err) console.error("DB Error:", err);
    else console.log("✅ Connected to SQLite Database");
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, url TEXT, instruction TEXT, status TEXT, date TEXT, logs TEXT)`);
});

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) return res.status(400).json({error: "Missing fields"});
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: "Username taken" });
        res.json({ success: true });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (!user) return res.status(400).json({ error: "User not found" });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Wrong password" });
        req.session.userId = user.id;
        req.session.username = user.username;
        res.json({ success: true });
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/user', (req, res) => {
    if (req.session.userId) res.json({ loggedIn: true, username: req.session.username });
    else res.json({ loggedIn: false });
});

// --- HISTORY ROUTES ---
app.get('/api/history', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
    db.all(`SELECT * FROM history WHERE user_id = ? ORDER BY id DESC`, [req.session.userId], (err, rows) => res.json(rows));
});

app.delete('/api/history/:id', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Not logged in" });
    const recordId = req.params.id;
    db.run(`DELETE FROM history WHERE id = ? AND user_id = ?`, [recordId, req.session.userId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- QA TOOL ROUTE ---
app.post('/api/run-test', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Please Login First!" });
    
    const { url, instruction } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are a QA Automation Engineer. Write a complete Node.js Playwright script.
        TARGET URL: ${url}
        TASK: ${instruction}
        RULES:
        1. Use 'import { chromium } from "playwright";' ONLY.
        2. Launch browser with { headless: false, slowMo: 1000 }.
        3. CRITICAL: Use: await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        4. Do NOT use waitForNavigation. Use await page.waitForTimeout(5000); instead.
        5. CRITICAL: When clicking the product, use: await page.locator('div[data-qa-locator="product-item"] a, .gridItem--Yd0g9 a, div.box--Mj3Q7 a').first().click();
           (Fallback: click first 'a' tag containing "iPhone").
        6. To verify success, use simple 'if' statements.
        7. Log "TEST_RESULT: PASS" or "TEST_RESULT: FAIL".
        8. Output ONLY raw javascript code.
        `;

        const result = await model.generateContent(prompt);
        let code = result.response.text().replace(/```javascript/g, '').replace(/```/g, '');
        const testFileName = `test_${Date.now()}.js`;
        fs.writeFileSync(testFileName, code);

        exec(`node ${testFileName}`, (error, stdout, stderr) => {
            const status = stdout.includes("TEST_RESULT: PASS") ? "PASS" : "FAIL";
            
            // Save to DB
            db.run(`INSERT INTO history (user_id, url, instruction, status, date, logs) VALUES (?, ?, ?, ?, ?, ?)`,
                [req.session.userId, url, instruction, status, new Date().toLocaleString(), stdout]
            );

            // AUTO-DELETE: Clean up the file immediately after running
            try {
                fs.unlinkSync(testFileName);
            } catch (err) {
                console.error("Could not delete temp file:", err);
            }
            
            res.json({ success: true, output: stdout, status: status });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Web App running at http://localhost:${port}`);
});