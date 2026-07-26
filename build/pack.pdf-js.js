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
    console.info(`PDF loading unused in ${outputDir}, skipping.`);
    process.exit(0);
}

const workerSrcDef = "const PDFJS_WORKER_SRC_BASE64 = \"\";";

const patchLoaderSrc = (PDFLoad_ts, pdfjsWorkerFile) => {
    const tsSourceFile = join(outputDir, PDFLoad_ts);
    if (!existsSync(tsSourceFile)) {
        console.info(`PDF loader source file ${tsSourceFile} does not exist, skipping.`);
        return;
    }
    let lines = readFileSync(tsSourceFile).toString().split("\n");
    let found = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(workerSrcDef)) {
            lines[i] = lines[i].replace(workerSrcDef, `const PDFJS_WORKER_SRC_BASE64 = "${readFileSync(pdfjsWorkerFile).toString("base64")}";`);
            found = true;
            break;
        }
    }
    if (found) {
        writeFileSync(tsSourceFile, lines.join("\n"));
    }
};

patchLoaderSrc("PDFLoad.js", pdfjsWorkerSrcFile);

patchLoaderSrc("PDFLoad_legacy.js", "./node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs");
