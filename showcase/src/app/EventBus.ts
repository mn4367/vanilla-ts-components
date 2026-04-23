import { AEventBus, IElementComponent } from "@vanilla-ts/core";
import { NAVIGATION_TARGET } from "./Navigation.js";


/**
 * Global event bus event map for this app.
 */
export interface ShowcaseEventMap {
    "NavigateTo": {
        Target: NAVIGATION_TARGET;
        Sender?: IElementComponent<HTMLElement>;
        Focus?: IElementComponent<HTMLElement>;
    };
}

/**
 * Global event bus class for the showcase app.
 */
class ShowcaseEventBus extends AEventBus<ShowcaseEventMap> { }

/**
 * Use the event bus from everywhere with:
 * @example
 * ```typescript
 * import { SHOWCASE_EVENTBUS as EventBus } from "./EventBus.js";
 * EventBus.on(...)
 * EventBus.emit(...)
 * ```
 */
export const SHOWCASE_EVENTBUS = new ShowcaseEventBus("OrgUnitUIEventBus");
