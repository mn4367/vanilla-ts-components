import { CSSClassNameFactory, HTMLElementWithChildren, IElementComponent, mixinComponentFactories, VTSApplication } from "@vanilla-ts/core";
import { ButtonFactory, Footer, Header, Main } from "@vanilla-ts/dom";
import { BusyOverlay, BusyOverlayFactory } from "../../src/BusyOverlay.js";
import { DisclosureContainerFactory } from "../../src/DisclosureContainer.js";
import { LabeledTextAreaFactory } from "../../src/LabeledTextArea.js";
import { Splitter, SplitterCollapsedState, SplitterFactory } from "../../src/Splitter.js";
import { ContentContainer } from "./ContentContainer.js";
import { DataAnalysis } from "./DataAnalysis.js";
import { EventBus } from "./EventBus.js";
import { Intro } from "./Intro.js";
import { InvalidNavTarget } from "./InvalidNavTarget.js";
import { Log } from "./Log.js";
import { NavigationBar } from "./NavigationBar.js";


/**
 * Global UI factory class. Should be used to obtain all instances of components that are to be
 * automatically decorated with a corresponding class name.
 */
const ComponentFactory = mixinComponentFactories(
    CSSClassNameFactory,
    BusyOverlayFactory,
    DisclosureContainerFactory,
    SplitterFactory,
    LabeledTextAreaFactory,
    ButtonFactory,
);
export const _ = new ComponentFactory("vts", false);


/**
 * The main app class. This is where the app is initialized and all components are put together.
 * It also allows access to the main components (header, main, footer, navigation bar, content) via
 * getter properties.
 */
export class ExampleApp extends VTSApplication {
    #busyOverlay: BusyOverlay;
    #header: Header;
    #main: Main;
    #footer: Footer;
    #splitter: Splitter;
    #navigationBar: NavigationBar;
    #contentContainer: ContentContainer;
    #intro: Intro;
    #dataAnalysis: DataAnalysis;
    #log: Log;
    #invalidNavTarget: InvalidNavTarget;

    /**
     * Ctor `ExampleApp`.
     * @param rootElement The root element where the app is to be mounted.
     */
    constructor(rootElement?: HTMLElementWithChildren) {
        super(rootElement);
        this.rootElement.translate = false;
    }

    public get Header(): Header {
        return this.#header;
    }

    public get Main(): Main {
        return this.#main;
    }

    public get Footer(): Footer {
        return this.#footer;
    }

    public get Splitter(): Splitter {
        return this.#splitter;
    }

    public get NavigationBar(): NavigationBar {
        return this.#navigationBar;
    }

    public get Content(): ContentContainer {
        return this.#contentContainer;
    }

    public get Intro(): Intro {
        return this.#intro;
    }

    public get Data(): DataAnalysis {
        return this.#dataAnalysis;
    }

    public get Log(): Log {
        return this.#log;
    }

    /**
     * Initialize the app. This is where all components are created and assembled together. Also
     * sets up listeners for all known (event bus) events.
     * @returns This instance.
     */
    public initialize(): this {
        this.#busyOverlay = _.busyOverlay(250, false);
        // Basic frame layout.
        this.#header = new Header("Header");
        this.#main = new Main();
        this.#footer = new Footer("Footer");
        // Main splitter and navigation bar.
        this.#createSplitter();
        this.#createNavigationBar();
        // Content components.
        this.#contentContainer = new ContentContainer();
        this.#intro = new Intro();
        this.#dataAnalysis = new DataAnalysis();
        this.#log = new Log();
        this.#invalidNavTarget = new InvalidNavTarget();
        // Populate and append the main splitter.
        this.#splitter.Start.append(this.#navigationBar);
        this.#splitter.End.append(this.#contentContainer);
        this.#main.append(this.#splitter);
        // Setup all event handlers.
        this.#initEvents();
        // Handle the initial navigation target.
        this.#navigate(document.location.hash || "#intro");
        // Mount everything.
        this.append(
            this.#header,
            this.#main,
            this.#footer
        );
        return this;
    }

    /**
     * Show a 'busy' overlay.
     * @param delay The delay after which the busy overlay is to be shown.
     * @returns This instance.
     */
    public async busy(delay?: number): Promise<this> {
        await this.#busyOverlay.busy(delay);
        return this;
    }

    /**
     * Hide the current 'busy' overlay.
     * @returns This instance.
     */
    public idle(): this {
        this.#busyOverlay.idle();
        return this;
    }

    /**
     * The classic sleep function.
     * @param duration The duration to sleep in milliseconds.
     * @returns A promise that resolves after the specified duration.
     */
    public async sleep(duration: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, duration));
    }

    /**
     * Set up listeners for all known (event bus) events.
     */
    #initEvents(): void {
        // Log global events to the log area.
        EventBus
            .on("AppLoaded", (duration) => this.#log.logEvent("AppLoaded", "duration", duration + "ms"))
            .on("Navigate", (href) => this.#log.logEvent("Navigate", "href", href))
            .on("DiscloseNavigationBar", (disclosed: boolean) => this.#log.logEvent("DiscloseNavigationBar", "disclosed", disclosed))
            .on("OpStarted", () => this.#log.logEvent("OpStarted"))
            .on("OpFinished", () => this.#log.logEvent("OpFinished"));
        // Handle navigation events.
        window.addEventListener("popstate", (_event) => this.#navigate(document.location.hash));
    }

    /**
     * Primitive handling of navigation events. This is where the content of the main area is
     * switched based on the navigation target.
     * @param href The navigation target
     */
    #navigate(href: string): void {
        EventBus.emit("Navigate", href);
        const current = this.#contentContainer.Children[0];
        let target: IElementComponent<HTMLElement> | undefined = undefined;
        switch (href) {
            case "#intro":
                target = this.#intro;
                break;
            case "#data-analysis":
                target = this.#dataAnalysis;
                break;
            case "#log":
                target = this.#log;
                break;
            default:
                target = this.#invalidNavTarget.invalidNavTarget(href);
                break;
        }
        target && current !== target && this.#contentContainer.remove(current).append(target);
    }

    /**
     * Set up the splitter with the navigation bar and the main content area. Also sets up listeners
     * to automatically collapse the navigation bar when the splitter area is resized to be smaller
     * than 50px and to sync the navigation bar's disclosed state with the splitter's collapsed
     * state.
     * @returns The splitter instance.
     */
    #createSplitter(): Splitter {
        return this.#splitter = _.splitter(
            {
                ActiveAreaSize: "12rem",
                StartMinSize: "12rem",
                EndMinSize: "40rem",
                // This size is 'configurable' via CSS (see `Vars.css`).
                CollapsedStartSize: getComputedStyle(document.documentElement).getPropertyValue("--app-splitter-collapsed-size") || "2.5rem"
            },
        )
            .on("splitter-area-resize", (ev) => {
                // Collapse the start area, if it's resized to be smaller than 50px.
                if (ev.$.DesiredSize < ev.$.Size && ev.$.DesiredSize < 50) {
                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                    queueMicrotask(() => {
                        this.#splitter.options({ Collapsed: SplitterCollapsedState.START });
                    });
                }
                // Doing the same for the end area would require to evaluate this expression:
                //
                // (ev.$.DesiredSize > ev.$.Size && (this.#splitter.DOM.clientWidth - ev.$.DesiredSize < 50))
                //
                // But with the current layout doing so makes no sense.
            })
            // Disclose/undisclose the navigation bar, if the splitter is collapsed/uncollapsed.
            .on("splitter-collapsed", (ev) => this.#navigationBar.disclosed(ev.$.State === SplitterCollapsedState.NONE));
    }

    /**
     * Create the navigation bar. Also sets up a listener to sync the splitter's collapsed state
     * with the navigation bar's disclosed state.
     * @returns The navigation bar instance.
     */
    #createNavigationBar(): NavigationBar {
        return this.#navigationBar = new NavigationBar()
            .on("disclose", (ev) => {
                // Sync the splitter's collapsed state with the navigation bar's disclosed state.
                this.#splitter.options({
                    Collapsed: ev.$.Disclosed ? SplitterCollapsedState.NONE : SplitterCollapsedState.START,
                });
            });
    }
}
