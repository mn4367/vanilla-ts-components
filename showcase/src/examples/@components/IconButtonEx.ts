import { ComponentFactory } from "@vanilla-ts/core";
import { Div, Hr, P } from "@vanilla-ts/dom";
import { IconButton, IconButtonOptions } from "../../../../src/IconButton.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
\`IconButton\` is a component to display buttons with icons and/or text. The
component itself is a regular \`§@dom/Button§\` component that contains three inner \`§@dom/Span§\`
components which can be styled individually:

- A \`Span\` component at the logical start side of the button (on the left side in 'ltr' direction,
  otherwise on right side; with a vertical layout the component is placed at the top side).
- A \`Span\` component containing the phrasing content of the button.
- A \`Span\` component at the logical end side of the button (on the right side in 'ltr' direction,
  otherwise on left side; with a vertical layout the component is placed at the bottom side).

The intended use of this component is that the icons (part one and three) are styled by background
images or with an icon font like 'Material Icons'.

**Class:** \`@vanilla-ts/components/IconButton\`

*Note:* \`IconButton\` has no built-in default design except for some basic inner margins. The two examples
provided below rely on the design of a regular default \`Button\` (see there) and use a custom
component factory to create the \`IconButton\` instances with the default CSS classes needed.
`;

const exampleIBF = `
### IconButton factory

\`\`\`
// Module \`IconButtonFactory.ts\`
import { ComponentFactory } from "@vanilla-ts/core";
import { IconButton, IconButtonOptions } from "@vanilla-ts/components";

class MyIconButtonFactory<T> extends ComponentFactory<IconButton> {
    public iconButton(options?: IconButtonOptions, data?: T): IconButton {
        return this.setupComponent(
            new IconButton(options).addClass("icon-button", "regular"),
            data
        );
    }
}

export const IconButtonFactory = new MyIconButtonFactory();
\`\`\`
`;

const exampleBackgroundImages = `
### Code example (using background images)

\`\`\`
import { Div } from "@vanilla-ts/dom";
import { IconButtonFactory as IBF } from "IconButtonFactory.js";

let ibWifi: IconButton;

new Div().append(
    IBF.iconButton({
        // The \`-\` character here and in all occurences below results in an empty
        // span element. Since this example uses background images, there is no need
        // to have any text content in the span.
        IconStart: "-ios_share",
        Title: "Share..."
    }),
    IBF.iconButton({
        IconStart: "-settings",
        Caption: ["Settings"],
        Title: "Open settings dialog"
    }),
    IBF.iconButton({
        IconEnd: "-print",
        Caption: ["Print"],
        Title: "Print document"
    }),
    ibWifi = IBF.iconButton({
        IconStart: "-wifi",
        Caption: ["Wifi"],
        IconEnd: "-circle",
        Title: "Turn Wifi on"
    })
        .on("click", () => {
            setTimeout(() => {
                ibWifi
                    .toggleClass("wifi-on")
                    .title(ibWifi.hasClass("wifi-on") ? "Turn Wifi off" : "Turn Wifi on");
            }, 500);
        })
);
\`\`\`
`;

const cssBackgroundImages = `
### CSS example (for background images)

\`\`\`
.icon-button {
    > .start,
    > .end {
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        /* 'Hide' any text in these span elements. */
        font-size: 0;
        color: transparent;
        &:not(.empty) {
            /* Make room for icons. */
            width: 1.2rem;
            aspect-ratio: 1;
        }
    }
    &.disabled {
        > .start,
        > .end {
            filter: opacity(0.5);
        }
    }
    > .ios_share {
        background-image: url("data:image/svg+xml,...");
    }
    > .settings {
        background-image: url("data:image/svg+xml,...");
    }
    > .print {
        background-image: url("data:image/svg+xml,...");
    }
    > .wifi {
        background-image: url("data:image/svg+xml,...");
    }
    > .circle {
        background-image: url("data:image/svg+xml;...");
    }
    &.wifi-on > .circle {
        background-image: url("data:image/svg+xml;...");
    }
}
\`\`\`
`;

const exampleIconFont = `
### Code example (using an icon font)

This example is almost identical to the example above which uses background images except for the
strings for \`IconStart\` and \`IconEnd\` which don't start with a leading hyphen. These spans will
contain the given strings as text content which will be rendered with an icon font.

\`\`\`
import { Div } from "@vanilla-ts/dom";
import { IconButtonFactory as IBF } from "IconButtonFactory.js";

let ibWifi: IconButton;

new Div().append(
    IBF.iconButton({
        // The text content here and in all occurences below must correspond to/trigger
        // the desired icon glyph. See the documentation of the used icon font for details.
        IconStart: "ios_share",
        Title: "Share..."
    }),
    IBF.iconButton({
        IconStart: "settings",
        Caption: ["Settings"],
        Title: "Open settings dialog"
    }),
    IBF.iconButton({
        IconEnd: "print",
        Caption: ["Print"],
        Title: "Print document"
    }),
    ibWifi = IBF.iconButton({
        IconStart: "wifi",
        Caption: ["Wifi"],
        IconEnd: "circle",
        Title: "Turn Wifi on"
    })
        .on("click", () => {
            setTimeout(() => {
                ibWifi
                    .toggleClass("wifi-on")
                    .title(ibWifi.hasClass("wifi-on") ? "Turn Wifi off" : "Turn Wifi on");
            }, 500);
        })
);
\`\`\`
`;

const cssIconFont = `
### CSS example (for an icon font)

Compared to the example which uses background images the amount of CSS needed here is much less.

\`\`\`
.icon-button {
    > .start,
    > .end {
        /* Uses the 'Material Icons' font from Google. */
        font-family: "MaterialIconsRounded";
        font-size: 1.2rem;
        line-height: 1;
    }
    > .circle {
        color: red;
        /* Support for a filled symbol. */
        font-variation-settings: "FILL" 1, "wght" 400, "GRAD" 0, "opsz" 20;
    }
    &.disabled > .circle {
        filter: opacity(0.5);
    }
    &.wifi-on > .circle {
        color: green;
    }
}
\`\`\`
`;


class MyIconButtonFactory<T> extends ComponentFactory<IconButton> {
    public iconButton(options?: IconButtonOptions, data?: T): IconButton {
        return this.setupComponent(new IconButton(options).addClass("icon-button", "regular"), data);
    }
}


export class IconButtonEx extends BaseExample {
    constructor() {
        super("IconButton");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let ib0: IconButton;
        let ib1: IconButton;
        let ib2: IconButton;
        let ib3: IconButton;
        let ib0a: IconButton;
        let ib1a: IconButton;
        let ib2a: IconButton;
        let ib3a: IconButton;
        const ibf = new MyIconButtonFactory();
        this.append(
            this.markdown(intro),
            this.example([
                new P("IconButtons with background images:"),
                new Div().addClass("icon-button-container").append(
                    ib0 = ibf.iconButton({
                        IconStart: "-ios_share",
                        Title: "Share...",
                    }),
                    ib1 = ibf.iconButton({
                        IconStart: "-settings",
                        Caption: ["Settings"],
                        Title: "Open settings dialog",
                    }),
                    ib2 = ibf.iconButton({
                        IconEnd: "-print",
                        Caption: ["Print"],
                        Title: "Print document",
                    }),
                    ib3 = ibf.iconButton({
                        IconStart: "-wifi",
                        Caption: ["Wifi"],
                        IconEnd: "-circle",
                        Title: "Turn Wifi on"
                    })
                        .on("click", () => {
                            setTimeout(() => {
                                ib3
                                    .toggleClass("wifi-on")
                                    .title(ib3.hasClass("wifi-on") ? "Turn Wifi off" : "Turn Wifi on");
                            }, 500);
                        }),
                ),
                new Hr(),
                new P("IconButtons with icon font symbols:"),
                new Div().addClass("icon-button-container").append(
                    ib0a = ibf.iconButton({
                        IconStart: "ios_share",
                        Title: "Share...",
                    }),
                    ib1a = ibf.iconButton({
                        IconStart: "settings",
                        Caption: ["Settings"],
                        Title: "Open settings dialog",
                    }),
                    ib2a = ibf.iconButton({
                        IconEnd: "print",
                        Caption: ["Print"],
                        Title: "Print document",
                    }),
                    ib3a = ibf.iconButton({
                        IconStart: "wifi",
                        Caption: ["Wifi"],
                        IconEnd: "circle",
                        Title: "Turn Wifi on"
                    })
                        .on("click", () => {
                            setTimeout(() => {
                                ib3a
                                    .toggleClass("wifi-on")
                                    .title(ib3a.hasClass("wifi-on") ? "Turn Wifi off" : "Turn Wifi on");
                            }, 500);
                        })
                )
            ], [ib0, ib1, ib2, ib3, ib0a, ib1a, ib2a, ib3a]),
            this.markdown("### Layout"),
            this.properties(
                $.labeledCheckbox("Vertical")
                    .checked(false)
                    .on("checked", (e) => [ib0, ib1, ib2, ib3, ib0a, ib1a, ib2a, ib3a].forEach(ib => ib.options({ Horizontal: !e.$.Checked }))),
            ),
            this.markdown(exampleIBF),
            this.markdown(exampleBackgroundImages),
            this.markdown(cssBackgroundImages),
            this.markdown(exampleIconFont),
            this.markdown(cssIconFont)
        );
        [ib0, ib1, ib2, ib3].forEach(ib => ib.addClass("ib-img"));
        [ib0a, ib1a, ib2a, ib3a].forEach(ib => ib.addClass("ib-font"));
    }
}
