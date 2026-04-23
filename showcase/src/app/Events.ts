import { SHOWCASE_EVENTBUS as EventBus, ShowcaseEventMap } from "./EventBus.js";
import { navigateTo } from "./Navigation.js";


/**
 * Register all event handlers for the event bus used in the showcase app.
 */
export function registerEventBusEventHandlers(): void {
    EventBus.on("NavigateTo", (ev: ShowcaseEventMap["NavigateTo"]) => {
        navigateTo(ev.Target, ev.Sender, ev.Focus);
    });
}
