import { Text } from "@vanilla-ts/dom";


/**
 * Simple self-updating date/time component.
 */
export class DateTime extends Text {
    #interval: number;

    constructor() {
        super();
        this.text(this.#now());
        this.#interval = setInterval(() => {
            // OK for a component derived from `Text` but for other components `Text`/`text()`
            // should/must take care of already existing child nodes/components.
            this.text(this.#now());
        }, 1000);
    }

    #now() {
        return new Date().toLocaleString(navigator.language, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    public override dispose(): void {
        clearInterval(this.#interval);
        super.dispose();
    }
}
