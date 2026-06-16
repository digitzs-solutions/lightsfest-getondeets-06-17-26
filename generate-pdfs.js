import puppeteer from 'puppeteer';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlDocsDir = join(__dirname, 'html-docs');
const outputDir = join(__dirname, 'pdf-docs');

await mkdir(outputDir, { recursive: true });
await mkdir(join(outputDir, 'tokenex-architecture'), { recursive: true });

async function convertHtmlToPdf(htmlPath, outputPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log(`Converting ${basename(htmlPath)} to PDF...`);

    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, {
      waitUntil: 'networkidle0'
    });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    });

    console.log(`✓ Created ${basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`✗ Error converting ${basename(htmlPath)}:`, error.message);
    return false;
  } finally {
    await browser.close();
  }
}

const docFiles = [
  { input: 'DEPLOYMENT.html', output: 'DEPLOYMENT.pdf' },
  { input: 'DIGITZS_PAYVIA_END_TO_END.html', output: 'DIGITZS_PAYVIA_END_TO_END.pdf' },
  { input: 'IXOPAY_TOKENEX_REFERENCE.html', output: 'IXOPAY_TOKENEX_REFERENCE.pdf' },
  { input: 'PAYVIA_INTEGRATION.html', output: 'PAYVIA_INTEGRATION.pdf' },
  { input: 'QUICK_START_DIGITZS.html', output: 'QUICK_START_DIGITZS.pdf' },
  { input: 'SETUP_DIGITZS_SECURITY_KEY.html', output: 'SETUP_DIGITZS_SECURITY_KEY.pdf' },
  { input: 'TICKETSOCKET_SETUP.html', output: 'TICKETSOCKET_SETUP.pdf' },
  { input: 'TOKENEX_SETUP.html', output: 'TOKENEX_SETUP.pdf' },
  { input: 'PAYVIA_API_QA_REPORT.html', output: 'PAYVIA_API_QA_REPORT.pdf' },
  {
    input: 'tokenex-architecture/DIGITZS_DIRECT_INTEGRATION.html',
    output: 'tokenex-architecture/DIGITZS_DIRECT_INTEGRATION.pdf'
  },
  {
    input: 'tokenex-architecture/DIGITZS_NMI_SECURITY_KEY.html',
    output: 'tokenex-architecture/DIGITZS_NMI_SECURITY_KEY.pdf'
  },
  {
    input: 'tokenex-architecture/IMPLEMENTATION_STATUS.html',
    output: 'tokenex-architecture/IMPLEMENTATION_STATUS.pdf'
  },
  {
    input: 'tokenex-architecture/PAYVIA_WRAPPER_DETAILS.html',
    output: 'tokenex-architecture/PAYVIA_WRAPPER_DETAILS.pdf'
  },
  {
    input: 'tokenex-architecture/TOKENEX_END_TO_END_PROCESS.html',
    output: 'tokenex-architecture/TOKENEX_END_TO_END_PROCESS.pdf'
  },
];

console.log('Starting PDF generation from HTML files...\n');
console.log('═'.repeat(70));

let successCount = 0;
let errorCount = 0;

for (const doc of docFiles) {
  const inputPath = join(htmlDocsDir, doc.input);
  const outputPath = join(outputDir, doc.output);

  const success = await convertHtmlToPdf(inputPath, outputPath);
  if (success) {
    successCount++;
  } else {
    errorCount++;
  }
}

console.log('═'.repeat(70));
console.log(`\n✨ PDF Generation Complete!\n`);
console.log(`  ✓ Success: ${successCount} files`);
console.log(`  ✗ Errors: ${errorCount} files`);
console.log(`\n📁 Output directory: ${outputDir}\n`);
console.log('═'.repeat(70));
