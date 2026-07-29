import { Br, Button, Span } from "@vanilla-ts/dom";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
\`BusyOverlay\` is a component for displaying an overlay that indicates a
'busy-with-no-defined-end' state. The overlay covers the complete viewport and prevents any user
interaction with the UI below it. It is typically used during long-running operations where user
input should be temporarily disabled.

**Class:** \`@vanilla-ts/components/BusyOverlay\`

The component offers additional features:

- Optionally allow the user to cancel the busy state by pressing the 'Esc' key.
- Configurable delay before showing the overlay.
- Custom events for busy state changes.
- Support for nested calls to \`busy()\`/\`idle()\`. This makes it very easy to use the overlay in
  scenarios where multiple (asynchronous) operations may overlap.
`;

const example = `
### Basic usage

\`\`\`
import { Button } from "@vanilla-ts/dom";
import { BusyOverlay } from "@vanilla-ts/components";

let timeout: ReturnType<typeof globalThis.setTimeout> | undefined;

const overlay = new BusyOverlay()
    .addClass("busy-overlay")
    .on("idle", () => clearTimeout(timeout));

const showOverlay = async (allowEscape: boolean, duration: number = 3000, delay?: number) => {
    overlay.allowEscape(allowEscape);
    await overlay.busy(delay);
    timeout = setTimeout(() => {
        clearTimeout(timeout);
        overlay.idle();
    }, duration);
};

new Button("Show for 3 seconds")
    .addClass("regular")
    .on("click", async () => await showOverlay(false));

new Button("Show for max. 3 seconds (cancelable with 'Esc')")
    .addClass("regular")
    .on("click", async () => await showOverlay(true));

new Button("Show for 3 seconds after a delay of 500 ms")
    .addClass("regular")
    .on("click", async () => await showOverlay(false, 3500, 500));
\`\`\`
`;

const example2 = `
### Global application context

The following example shows how the \`BusyOverlay\` component is used in a global application
context so that multiple modules can use the overlay without having to check whether the overlay is
already displayed or not.

\`\`\`
// Module \`App.ts\`
import { BusyOverlay } from "@vanilla-ts/components";

class AppClass {
    #busyOverlay = new BusyOverlay(250, false)
        .addClass("busy-overlay");

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

    /// Additional application-wide methods and properties to be added here.
    // ...
}

export const App = new AppClass();
\`\`\`

\`\`\`
// Module \`Module1.ts\`
import { App } from "./App.js";

// Long-running operation, may take an arbitrary amount of time.
export async function longRunning1() {
    await App.busy();
    try {
       ...
    } finally {
        App.idle();
    }
}
\`\`\`

\`\`\`
// Module \`Module2.ts\`
import { App } from "./App.js";
import { longRunning1 } from "./Module1.js";

// Long-running operation, may take an arbitrary amount of time.
async function longRunning2() {
    await App.busy();
    try {
        ...
        await longRunning1();
        ...
    } finally {
        App.idle();
    }
}

// Long-running operation, may take an arbitrary amount of time.
export async function longRunning3() {
    await App.busy();
    try {
        await longRunning2();
    } finally {
        App.idle();
    }
}
\`\`\`

\`\`\`
// Module \`Module3.ts\`
import { longRunning3 } from "./Module2.js";

longRunning3();
\`\`\`
`;


export class BusyOverlayEx extends BaseExample {
    constructor() {
        super("BusyOverlay");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const overlay = $.busyOverlay()
            .on("idle", () => clearTimeout(timeout));
        let timeout: ReturnType<typeof globalThis.setTimeout> | undefined;
        const show = async (allowEscape: boolean, duration: number = 3000, delay?: number) => {
            overlay.allowEscape(allowEscape);
            await overlay.busy(delay);
            timeout = setTimeout(() => {
                clearTimeout(timeout);
                overlay.idle();
            }, duration);
        };
        const btnBusy1 =
            new Button("Show")
                .addClass("regular")
                .on("click", async () => await show(false));
        const btnBusy2 =
            new Button("Show")
                .addClass("regular")
                .on("click", async () => await show(true));
        const btnBusy3 =
            new Button("Show")
                .addClass("regular")
                .on("click", async () => await show(false, 3500, 500));
        this.append(
            this.markdown(intro),
            this.markdown("### Examples"),
            this.properties(
                btnBusy1, new Span("\u2003Show for 3 seconds").style({ "display": "inline-block", "height": "2rem" }), new Br(),
                btnBusy2, new Span("\u2003Show for max. 3 seconds (cancelable with 'Esc')").style({ "display": "inline-block", "height": "2rem" }), new Br(),
                btnBusy3, new Span("\u2003Show for 3 seconds after a delay of 500 ms") //.style({ "display": "inline-block", "height": "2rem" }), new Br()
            ),
            this.markdown(example),
            this.markdown(example2),
        );
    }
}
