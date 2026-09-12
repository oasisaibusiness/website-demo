import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const screenshotDir = join(__dirname, 'temporary screenshots');
if (!existsSync(screenshotDir)) {
    mkdirSync(screenshotDir, { recursive: true });
}

// Find next available number
const existingFiles = readdirSync(screenshotDir);
const numbers = existingFiles
    .filter(f => f.startsWith('screenshot-'))
    .map(f => {
        const match = f.match(/screenshot-(\d+)/);
        return match ? parseInt(match[1]) : 0;
    });
const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

const filename = label
    ? `screenshot-${nextNumber}-${label}.png`
    : `screenshot-${nextNumber}.png`;
const outputPath = join(screenshotDir, filename);

console.log(`Taking screenshot of ${url}...`);

const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto(url, { waitUntil: 'networkidle0' });

// Wait a moment for any animations
await new Promise(resolve => setTimeout(resolve, 1000));

await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved to: ${outputPath}`);
