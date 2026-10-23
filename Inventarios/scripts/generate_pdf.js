const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const htmlFile = path.join(rootDir, 'manual_usuario.html');
const pdfFile = path.join(rootDir, 'manual_usuario.pdf');

// Posibles rutas para navegadores en Windows
const browserPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

const browserExe = browserPaths.find(p => fs.existsSync(p));

if (!browserExe) {
    console.error('Error: No se encontró Google Chrome ni Microsoft Edge en las rutas estándar.');
    process.exit(1);
}

console.log(`Usando navegador: ${browserExe}`);
console.log(`Generando PDF desde: ${htmlFile}`);

const fileUrl = 'file:///' + htmlFile.replace(/\\/g, '/');

const args = [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    `--print-to-pdf=${pdfFile}`,
    fileUrl
];

const result = spawnSync(browserExe, args, { stdio: 'inherit' });

if (result.status === 0 && fs.existsSync(pdfFile)) {
    const stats = fs.statSync(pdfFile);
    console.log(`\n¡Manual en PDF generado exitosamente!`);
    console.log(`Archivo: ${pdfFile}`);
    console.log(`Tamaño: ${(stats.size / (1024 * 1024)).toFixed(2)} MB (${stats.size} bytes)`);
} else {
    console.error('Error al generar el manual en PDF.');
    process.exit(1);
}
