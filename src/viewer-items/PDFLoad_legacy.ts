/**
 * Using the modern `PDF.js` build still fails on most mobile browsers as of July 2026, so this
 * module uses the legacy build of `PDF.js` for loading PDF documents.
 */
import { getDocument, GlobalWorkerOptions, PDFDocumentLoadingTask } from "pdfjs-dist/legacy/build/pdf.mjs";


/**
 * PDFLoader module for loading PDF documents using `PDF.js`. The only difference to the original
 * `PDF.js` API is that the worker script is bundled and used automatically, so there is no need to
 * care about it. In most cases this is sufficient for loading PDF documents. But for some PDF
 * documents `PDF.js` needs further external resources for the initialization object
 * `DocumentInitParameters`. These are _not_ bundled so their URLs must be set separately and the
 * data behind them must be accessible. These URLs are: `cMapUrl`, `iccUrl`, `standardFontDataUrl`,
 * `wasmUrl` and `docBaseUrl`. See the `PDF.js` documentation for details.
 *
 * If a bundled worker script is not required, this module can be omitted, and the original `PDF.js`
 * API can be used to load PDF documents.
 */

/** Base64-encoded `PDF.js` worker source. The real source is inserted during the build process. */
const PDFJS_WORKER_SRC_BASE64 = "";

/** Lazy load flag for the `PDF.js` worker script. */
let PDFJSWorkerLoaded = false;

/** Document initialization parameters for `PDF.js`. */
export type DocumentInitParameters = NonNullable<Parameters<typeof getDocument>[0]>;

/**
 * Load a PDF document from a given URL using `PDF.js`.
 * @param url The URL of the document to be loaded.
 * @returns A `PDF.js` `PDFDocumentLoadingTask` object. See overloaded function `loadPDF(options:
 * DocumentInitParameters)` for details.
 */
export function loadPDF(url: string): PDFDocumentLoadingTask;
/**
 * Load a PDF document using `PDF.js`.
 * @param options The document initialization parameters to pass to `PDF.js`.
 * @returns A `PDF.js` `PDFDocumentLoadingTask` object. This object can be used, for example, to
 * track the loading progress. To get a fully loaded `PDFDocumentProxy`, simply await the
 * `task.promise` property.
 * @example
 * ```ts
 * const task = loadPDF({ url: "my-document.pdf" });
 * task.onProgress = (progressData) => {
 *     console.log(`Loading progress: ${progressData.loaded} / ${progressData.total}`);
 *     //console.log(`Loaded ${progressData.percent}%`);
 * };
 * const pdfDocument1 = await task.promise;
 * console.log(`Loaded PDF document with ${pdfDocument1.numPages} pages.`);
 *
 * // Or simply:
 * const pdfDocument2 = await loadPDF("my-document.pdf").promise;
 * console.log(`Loaded PDF document with ${pdfDocument2.numPages} pages.`);
 * ```
 */
export function loadPDF(options: DocumentInitParameters): PDFDocumentLoadingTask;
export function loadPDF(urlOrOptions: string | DocumentInitParameters): PDFDocumentLoadingTask {
    if (!PDFJSWorkerLoaded) {
        // Load the `PDF.js` worker script. This is necessary for `PDF.js` to work properly. The
        // worker script is loaded from a Blob URL created from the base64-encoded worker script.
        const workerBlob = new Blob(
            [new TextDecoder().decode(Uint8Array.from(atob(PDFJS_WORKER_SRC_BASE64), (s) => s.codePointAt(0)!))],
            { type: "text/javascript" } // eslint-disable-line jsdoc/require-jsdoc
        );
        GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
        PDFJSWorkerLoaded = true;
    }
    const loadingTask = getDocument(
        /* eslint-disable jsdoc/require-jsdoc */
        typeof urlOrOptions === "string"
            ? { url: urlOrOptions }
            : {
                ...urlOrOptions,
                // Further default options can be added here if needed.
            }
        /* eslint-enable */
    );
    return loadingTask;
}
