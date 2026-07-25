import { AnyType, getIntegersFromRanges } from "@vanilla-ts/core";
import { PageViewport, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { ViewerItemCanvas, ViewerItemCanvasDrawFunction } from "./ViewerItemCanvas.js";


/**
 * `PDFCanvasItems` module for creating `ViewerItemCanvas` items from PDF documents using `PDF.js`.
 * This module provides a function to generate canvas-based viewer items for each page of a PDF
 * document. It allows customization of rendering options, error handling, and page selection.
 */

/** Optional rendering properties for pages (from `PDF.js`). */
export type PDFPageRenderOptions = Omit<Parameters<PDFPageProxy["render"]>[0], "canvas" | "canvasContext" | "viewport">;

/**
 * Type of the function that is called when getting or rendering a page fails.
 * @param reason The reason why getting or rendering a page from the PDF document failed.
 * @param pageNumber The number of the page for which the error occured. The first page has the
 * number `1`!
 */
export type PDFPageErrorHandler = (reason: AnyType, pageNumber: number) => void;

/**
 * Builds and returns `ViewerItemCanvas` items for the pages for a given PDF document.
 * @param idPrefix A prefix for the item IDs of the created `ViewerItemCanvas` items. The item ID of
 * the first page is then `${idPrefix}/1`, the second page is `${idPrefix}/2` and so on.
 * @param pdfDocument The PDF document from which the items are to be created.
 * @param basePageScale The base scaling for pages. An `A4` page will be rendered at a size of ~
 * `595` × `841` pixels if `basePageScale` is `1` and the current magnification is `100%`. With a
 * value of `2` the size is ~ `1190` × `1683` pixels. To obtain pages with enough room for
 * magnifying/zooming in a value of `2` usually is a good compromise. Very large values (like `5` or
 * `100`) will drastically increase memory usage and substantially decrease rendering perfomance at
 * high magnifications; often such high values simply don't work. For very large PDF pages like
 * those of technical drawings `basePageScale` may need to be set to a value lower than `1` to get
 * acceptable rendering performance and memory usage.\
 * Default: `1`.
 * @param canvasScale The scale factor that is applied to the canvas element. This is a multiplier
 * for the width and height of the canvas element at a scale factor of 1 (i.e., without zooming).
 * The default value is `1`; higher values may improve the rendering quality, especially for PDF
 * pages or drawings containing text for which the recommended value is `2`. Values lower than `1`
 * may be used to improve performance and reduce memory usage, but the content may appear blurry.
 * Values lower than `0` will be auto-corrected to `1`.
 * @param pageRanges Optional page ranges to load from the document. For the documentation of the
 * syntax see {@link getIntegersFromRanges()}. If not specified, all pages are loaded.
 * @param renderOptions Additional rendering options for pages (from `PDF.js`).
 * @param onGetPageError An error handler function which is called, when rendering a page fails.
 * @param onRenderPageError An error handler function which is called, when getting a page from the
 * PDF document fails.
 * @returns An array of `ViewerItemCanvas` elements.
 * @example
 * This an example for loading a PDF document and creating a `Viewer` component with the document
 * pages as `ViewerItemCanvas` items.
 *
 * ```typescript
 * // Uses the `loadPDF()` function from the `PDFLoader.ts` module to load a PDF. The document can
 * // also be loaded using the original `PDF.js` API, but then the worker script must be set up and
 * // bundled elsewhere.
 * const pdfDoc = await loadPDF("MyDocument.pdf").promise;
 *
 * const viewerItems = getPDFCanvasViewerItems(
 *   pdfDoc,
 *   1,      // Use 'normal' scaling for the PDF pages
 *   2,      // Use higher scaling for the canvas element for better quality
 *   "-10",  // First ten pages only
 *   {},     // No additional rendering options
 *   // Only simple error logging
 *   (reason: AnyType, pageNumber: number) => {
 *     console.log(`Error rendering PDF page ${pageNumber}:`, reason);
 *   },
 *   (reason: AnyType, pageNumber: number) => {
 *     console.log(`Error getting PDF page ${pageNumber}:`, reason);
 *   }
 * );
 *
 * const viewer = new Viewer({ Items: viewerItems, Zoom: Zoom.FIT })
 *     .addClass("vts-viewer") // Depends on the styling/theming, in most cases not needed
 *     .style({ width: "50rem", height: "50rem" });
 * ```
 */
export function getPDFCanvasViewerItems(
    idPrefix: string,
    pdfDocument: PDFDocumentProxy,
    basePageScale: number = 1,
    canvasScale: number = 1,
    pageRanges: string = "",
    renderOptions?: PDFPageRenderOptions,
    onGetPageError?: PDFPageErrorHandler,
    onRenderPageError?: PDFPageErrorHandler
): ViewerItemCanvas[] {
    const result: ViewerItemCanvas[] = [];
    for (const pageNum of getIntegersFromRanges(pageRanges, pdfDocument.numPages, 1)) {
        let page: PDFPageProxy;
        let viewport: PageViewport;
        let isRendering = false;
        // The current scale of the `Viewer` component instance.
        let currentScale: number;

        // Render the PDF page to the supplied canvas.
        const drawPage: ViewerItemCanvasDrawFunction = (canvas, scale) => { // eslint-disable-line jsdoc/require-jsdoc
            // Store the current scale. Rendering is asynchronous, so it's possible that after the
            // rendering of a page has finished the viewer already has switched to another scale.
            currentScale = scale;
            // Do not render again while a page is rendering; this would lead to exceptions in
            // `PDF.js`.
            if (isRendering) {
                return;
            }
            isRendering = true;
            const renderTask = page.render({
                /* eslint-disable jsdoc/require-jsdoc */
                ...renderOptions,
                canvas: canvas,
                viewport: page.getViewport({ scale: scale * basePageScale * canvasScale }),
                /* eslint-enable */
            }).promise;
            renderTask
                .then(() => {
                    isRendering = false;
                    // When rendering has finished, test if the scale from the viewer is now
                    // different from the scale the page was rendered at. In this case render again
                    // at the scale which is valid now.
                    scale !== currentScale && drawPage(canvas, currentScale);
                })
                .catch((reason: AnyType) => {
                    onRenderPageError?.(reason, pageNum);
                });
        };

        const viewerItem = new ViewerItemCanvas(`${idPrefix}/${pageNum}`, drawPage, canvasScale);
        // Prevents scrambled text when the surrounding context is in "rtl" direction.
        viewerItem.Canvas.DOM.dir = "ltr";
        result.push(viewerItem);

        pdfDocument.getPage(pageNum)
            .then((pdfPage) => {
                page = pdfPage;
                viewport = page.getViewport({ scale: basePageScale }); // eslint-disable-line jsdoc/require-jsdoc
                viewerItem.ready(true, viewport.width, viewport.height);
            })
            .catch((reason: AnyType) => {
                onGetPageError?.(reason, pageNum);
            });
    }
    return result;
}
