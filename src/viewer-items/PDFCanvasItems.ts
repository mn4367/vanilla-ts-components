import { AnyType } from "@vanilla-ts/core";
import { PageViewport, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { ViewerItemCanvas, ViewerItemCanvasDrawFunction } from "./ViewerItemCanvas.js";


////////////////////////////////////////////////////////////////////////////////////////////////////
// `getIntegersFromRanges` is only here because in this branch it is not yet part of the
// dependency `@vanilla-ts/core`!
////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Parses comma separated integer range definitions into a list of integers.
 * @param value The range definition string. Examples:
 * - "3-5" => 3,4,5
 * - "5-2" => 5,4,3,2
 * - "3-" => 3,4,5,...,max
 * - "-3" => start,start+1,...,3 ('open-start range', where `start` is either `0` or `1`, see below)
 * - "3" => 3
 * - "3-5,7,9-11" => 3,4,5,7,9,10,11
 * - "3 - 5, 7 , 11 -9 " => 3,4,5,7,11,10,9 (whitespace in the definition string is ignored)
 * - "" => start,start+1,...,max (an empty string results in a range from `start` to `max`,
 *   whitespace is ignored)
 * - "-" => max,...,start+1,start (a single dash results in a range from `max` to `start`,
 *   whitespace is ignored)
 * @param max The maximum allowed value. Must be greater than `0`. Values greater than `max` are
 * ignored. The function does not check for ranges that may fall out of the limit of the maximum
 * number of entries in an array. In such cases an unhandled exception will be thrown by the
 * JavaScript engine.
 * @param start The start value for open-start ranges. Must be `0` or `1`. The default is `0`.
 * @returns The array containing the parsed integers. Duplicates are not removed. The order of the
 * integers is the same as in the range definition string.
 * @throws {RangeError} If `max` is not an integer greater than `0` or if `start` is not `0` or `1`.
 * @throws {SyntaxError} If the range definition is invalid, like in `1-3-5` or `3--5` or `1-3.6`.
 */
export function getIntegersFromRanges(value: string, max: number, start: 0 | 1 = 0): number[] {
    if (!Number.isInteger(max) || max <= 0) {
        throw new RangeError("Parameter 'max' must be an integer greater than 0.");
    }
    if (start !== 0 && start !== 1) {
        throw new RangeError("Parameter 'start' must be 0 or 1.");
    }
    const appendRange = (result: number[], from: number, to: number): void => { // eslint-disable-line jsdoc/require-jsdoc
        const step = from <= to ? 1 : -1;
        for (let value = from; value !== to + step; value += step) {
            result.push(value);
        }
    };
    const result: number[] = [];
    // Everything
    if (value.trim() === "") {
        appendRange(result, start, max);
        return result;
    }
    // Everything in reverse order
    if (value.trim() === "-") {
        appendRange(result, max, start);
        return result;
    }
    const parts = value.split(/\s*,\s*/).filter((part) => part.length > 0);
    for (const part of parts) {
        // "3-5" => 3,4,5
        const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (rangeMatch !== null) {
            const from = Number(rangeMatch[1]);
            const to = Number(rangeMatch[2]);
            if (from < to && from <= max) {
                appendRange(result, from, Math.min(to, max));
            } else if (from > to && to <= max) {
                appendRange(result, Math.min(from, max), to);
            } else if (from === to && from <= max) {
                result.push(from);
            }
            continue;
        }
        // "3-" => 3,4,5,...,max
        const openEndMatch = part.match(/^(\d+)\s*-\s*$/);
        if (openEndMatch !== null) {
            const from = Number(openEndMatch[1]);
            if (from <= max) {
                appendRange(result, from, max);
            }
            continue;
        }
        // "-3" => start,start+1,...,3
        const openStartMatch = part.match(/^-\s*(\d+)$/);
        if (openStartMatch !== null) {
            const to = Math.min(Number(openStartMatch[1]), max);
            appendRange(result, start, to);
            continue;
        }
        // "3" => 3
        const singleMatch = part.match(/^\d+$/);
        if (singleMatch !== null) {
            const page = Number(singleMatch[0]);
            if (page <= max) {
                result.push(page);
            }
            continue;
        }
        // If none of the above patterns matched, the range definition must be invalid.
        throw new SyntaxError(`Invalid integer range definition: "${part}".`);
    }
    return result;
}

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
