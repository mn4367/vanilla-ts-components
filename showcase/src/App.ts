// Import to be used with application variant 1.
import { CSSClassNameFactory, mixinComponentFactories, VTSApplication } from "@vanilla-ts/core";

// Import to be used with application variant 2.
// import { mixinComponentFactories, VTS_App } from "@vanilla-ts/core";

import { BrFactory, ButtonFactory, HrFactory } from "@vanilla-ts/dom";
import { BusyOverlayFactory } from "../../src/BusyOverlay.js";
import { DisclosureContainerFactory } from "../../src/DisclosureContainer.js";
import { IconButtonFactory } from "../../src/IconButton.js";
import { LabeledAnchorFactory } from "../../src/LabeledAnchor.js";
import { LabeledCheckboxFactory } from "../../src/LabeledCheckbox.js";
import { LabeledContainerFactory } from "../../src/LabeledContainer.js";
import { LabeledEmailInputFactory } from "../../src/LabeledEmailInput.js";
import { LabeledNumberInputFactory } from "../../src/LabeledNumberInput.js";
import { LabeledParagraphFactory } from "../../src/LabeledParagraph.js";
import { LabeledPasswordInputFactory } from "../../src/LabeledPasswordInput.js";
import { LabeledRadioButtonFactory } from "../../src/LabeledRadioButton.js";
import { LabeledRadioButtonGroupFactory } from "../../src/LabeledRadioButtonGroup.js";
import { LabeledSearchInputFactory } from "../../src/LabeledSearchInput.js";
import { LabeledSelectFactory } from "../../src/LabeledSelect.js";
import { LabeledTextInputFactory } from "../../src/LabeledTextInput.js";
import { RadioButtonGroupFactory } from "../../src/RadioButtonGroup.js";
import { ScrollContainerFactory } from "../../src/ScrollContainer.js";
import { SplitterFactory } from "../../src/Splitter.js";
import { AppFooter } from "./app/AppFooter.js";
import { AppHeader } from "./app/AppHeader.js";
import { AppMain } from "./app/AppMain.js";
import { SHOWCASE_EVENTBUS as EventBus } from "./app/EventBus.js";
import { registerEventBusEventHandlers } from "./app/Events.js";
import { NAVIGATION_ISSUER_COMPONENTS, NAVIGATION_TARGET } from "./app/Navigation.js";
import { ExampleCategories } from "./components/ExampleCategories.js";
import { ExampleContainer } from "./components/ExampleContainer.js";
import { ExampleSelectorLabel } from "./components/ExampleSelectorLabel.js";


//////////////////////////////////////////////////
// #region Variant 1 /////////////////////////////

// /*
// Application class for the Vanilla.ts showcase application. Can be extended to add
// application-wide features.
class ShowcaseApp extends VTSApplication {
    #header: AppHeader;
    #footer: AppFooter;
    #main: AppMain;
    #exampleCategories: ExampleCategories;
    #exampleContainer: ExampleContainer;

    constructor(rootElement: HTMLElement) {
        super(rootElement);
        this.append(
            this.#header = new AppHeader,
            this.#main = new AppMain(),
            this.#footer = new AppFooter,
        );
        this.#exampleCategories = this.#main.ExampleCategories;
        this.#exampleContainer = this.#main.ExampleContainer;
        // Handle navigation events.
        window.addEventListener("popstate", (_event) => {
            const target = decodeURIComponent(document.location.hash) as NAVIGATION_TARGET;
            const label = <ExampleSelectorLabel>NAVIGATION_ISSUER_COMPONENTS.get(target) ?? NAVIGATION_ISSUER_COMPONENTS.get("#Introduction");
            label && EventBus.emit("NavigateTo", { Target: label.EventMessage, Sender: label });
        });
    }

    public get Header(): AppHeader {
        return this.#header;
    }

    get Main(): AppMain {
        return this.#main;
    }

    get Footer(): AppFooter {
        return this.#footer;
    }

    public get ExampleCategories(): ExampleCategories {
        return this.#exampleCategories;
    }

    public get ExampleContainer(): ExampleContainer {
        return this.#exampleContainer;
    }

    // Further features to be added as needed.
}

// Global application component factory instance. Can be imported and used throughout the
// application to create components with a consistent CSS class name prefix. To be extended with
// additional component factories as needed.
export const $ = new (mixinComponentFactories(
    CSSClassNameFactory,
    BrFactory,
    BusyOverlayFactory,
    ButtonFactory,
    DisclosureContainerFactory,
    HrFactory,
    IconButtonFactory,
    LabeledAnchorFactory,
    LabeledCheckboxFactory,
    LabeledContainerFactory,
    LabeledEmailInputFactory,
    LabeledNumberInputFactory,
    LabeledParagraphFactory,
    LabeledPasswordInputFactory,
    LabeledRadioButtonFactory,
    LabeledRadioButtonGroupFactory,
    LabeledSearchInputFactory,
    LabeledSelectFactory,
    LabeledTextInputFactory,
    RadioButtonGroupFactory,
    ScrollContainerFactory,
    SplitterFactory,
    // ))("vts");
))();

// Global application instance. Can be used to access the application root and other
// application-wide features.
export let APP: ShowcaseApp;

// Initialize the @Vanilla.ts showcase application.
// @param rootElement The root element into which the application is mounted.
export const initializeApp = (rootElement: HTMLElement): void => {
    APP
        ? document.body.insertAdjacentText("afterbegin", "App is already initialized!")
        : APP = new ShowcaseApp(rootElement);
    // Register all event handlers for the event bus used in the showcase app.
    registerEventBusEventHandlers();
    // Navigate to the desired location or to the introduction page on startup.
    const target = decodeURIComponent(document.location.hash) as NAVIGATION_TARGET;
    const label = <ExampleSelectorLabel>NAVIGATION_ISSUER_COMPONENTS.get(target) ?? NAVIGATION_ISSUER_COMPONENTS.get("#Introduction");
    label && EventBus.emit("NavigateTo", { Target: label.EventMessage, Sender: label });
};
// */

// #endregion ////////////////////////////////////
//////////////////////////////////////////////////


//////////////////////////////////////////////////
// #region Variant 2 /////////////////////////////

// The variant below is an alternative version which uses a similar approach as above but mixes in
// all component factories _and_ the application class into a _single_ class and exports an instance
// of this class as the variable `$`.

/*
// Application class for the Vanilla.ts showcase application. Can be extended to add
// application-wide features.\
// __Note:__ `VTS_App` already includes `CSSClassNameFactory` functionality, see below.
class ShowcaseApp extends VTS_App {
    #header: AppHeader;
    #footer: AppFooter;
    #main: AppMain;
    #exampleCategories: ExampleCategories;
    #exampleContainer: ExampleContainer;

    constructor(rootElement: HTMLElement, cssPrefix: string = "") {
        super(rootElement, cssPrefix);
    }

    public initialize(): void {
        this.append(
            this.#header = new AppHeader,
            this.#main = new AppMain(),
            this.#footer = new AppFooter,
        );
        this.#exampleCategories = this.#main.ExampleCategories;
        this.#exampleContainer = this.#main.ExampleContainer;
        // Handle navigation events.
        window.addEventListener("popstate", (_event) => {
            const target = decodeURIComponent(document.location.hash) as NAVIGATION_TARGET;
            const label = <ExampleSelectorLabel>NAVIGATION_ISSUER_COMPONENTS.get(target) ?? NAVIGATION_ISSUER_COMPONENTS.get("#Introduction");
            label && EventBus.emit("NavigateTo", { Target: label.EventMessage, Sender: label });
        });
    }

    public get Header(): AppHeader {
        return this.#header;
    }

    get Main(): AppMain {
        return this.#main;
    }

    get Footer(): AppFooter {
        return this.#footer;
    }

    public get ExampleCategories(): ExampleCategories {
        return this.#exampleCategories;
    }

    public get ExampleContainer(): ExampleContainer {
        return this.#exampleContainer;
    }

    // Further features to be added as needed.
}

// Mixin additional component factories into the application class (`ShowcaseApp`). The result is a
// class which contains all the functionality from `ShowCaseApp` _and_ all component factories. To
// be extended with additional component factories as needed.
const AppClass = mixinComponentFactories(
    ShowcaseApp,
    BrFactory,
    BusyOverlayFactory,
    ButtonFactory,
    DisclosureContainerFactory,
    HrFactory,
    IconButtonFactory,
    LabeledAnchorFactory,
    LabeledCheckboxFactory,
    LabeledContainerFactory,
    LabeledEmailInputFactory,
    LabeledNumberInputFactory,
    LabeledParagraphFactory,
    LabeledPasswordInputFactory,
    LabeledRadioButtonFactory,
    LabeledRadioButtonGroupFactory,
    LabeledSearchInputFactory,
    LabeledSelectFactory,
    LabeledTextInputFactory,
    RadioButtonGroupFactory,
    ScrollContainerFactory,
    SplitterFactory,
);

// Global application component factory instance. Can be imported and used throughout the
// application to create components, for example, also with a consistent CSS class name prefix. To
// be extended with additional component factories as needed.\
// __Note:__ This variable also has all the features of the application class `ShowcaseApp`, so it
// can be used to access the application root and other application-wide features.
export let $: InstanceType<typeof AppClass>;

// Initialize the Vanilla.ts showcase application.
// @param rootElement The root element into which the application is mounted.
export const initializeApp = (rootElement: HTMLElement): void => {
    if ($) {
        document.body.insertAdjacentText("afterbegin", "App is already initialized!");
    } else {
        // $ = new AppClass(rootElement, "vts");
        $ = new AppClass(rootElement);
        $.initialize();
    }
    // Register all event handlers for the event bus used in the showcase app.
    registerEventBusEventHandlers();
    // Navigate to the desired location or to the introduction page on startup.
    const target = decodeURIComponent(document.location.hash) as NAVIGATION_TARGET;
    const label = <ExampleSelectorLabel>NAVIGATION_ISSUER_COMPONENTS.get(target) ?? NAVIGATION_ISSUER_COMPONENTS.get("#Introduction");
    label && EventBus.emit("NavigateTo", { Target: label.EventMessage, Sender: label });
};
*/

// #endregion ////////////////////////////////////
//////////////////////////////////////////////////
