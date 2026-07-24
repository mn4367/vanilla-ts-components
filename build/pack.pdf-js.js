import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const pdfjsWorkerSrcFile = "./node_modules/pdfjs-dist/build/pdf.worker.min.mjs";
if (!existsSync(pdfjsWorkerSrcFile)) {
    console.info("PDF.js not installed, skipping.");
    process.exit(0);
}

if (process.argv[2] === undefined) {
    console.error("No output directory given.");
    process.exit(1);
}

const outputDir = resolve(process.argv[2]);
if (!existsSync(outputDir)) {
    console.info(`PDF viewer items unused in ${outputDir}, skipping.`);
    process.exit(0);
}

const loaderSrc = join(outputDir, "PDFLoad.js");
if (!existsSync(loaderSrc)) {
    console.error(`Loader source file ${loaderSrc} does not exist.`);
    process.exit(1);
}

const workerSrcDef = "const PDFJS_WORKER_SRC_BASE64 = \"\";";
const lines = readFileSync(loaderSrc).toString().split("\n");
let found = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(workerSrcDef)) {
        lines[i] = lines[i].replace(workerSrcDef, `const PDFJS_WORKER_SRC_BASE64 = "${readFileSync(pdfjsWorkerSrcFile).toString("base64")}";`);
        found = true;
        break;
    }
}
if (found) {
    writeFileSync(loaderSrc, lines.join("\n"));
}
