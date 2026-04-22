import { AEventBus } from "@vanilla-ts/core";


/**
 * Known event bus events.
 */
interface ExampleAppEventMap {
    "AppLoaded": number;
    "Navigate": string;
    "DiscloseNavigationBar": boolean;
    "OpStarted": undefined;
    "OpFinished": undefined;
}

class ExampleAppEventBus extends AEventBus<ExampleAppEventMap> { }

// Must be globally available.
export const EventBus = new ExampleAppEventBus("ExampleAppEventBus");
