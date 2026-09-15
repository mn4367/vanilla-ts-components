import { Div, P } from "@vanilla-ts/dom";
import { Throbber } from "../../../../src/Throbber.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component for indicating that an operation is in progress when its duration or completion cannot
be determined. Unlike a §@components/BusyOverlay§, a \`Throbber\` does not block interaction with
the rest of the user interface and can be placed next to the content whose busy state it represents.

The component only provides its state and DOM structure; its visual representation is defined by
CSS. The default theme includes a classic border spinner and the alternative \`modern\` appearance
shown below.

**Class:** \`@vanilla-ts/components/Throbber\`
`;

const example = `
### Code example

\`\`\`
import { Throbber } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Div, P } from "@vanilla-ts/dom";

const classic = new Throbber()
    .addClass("throbber") // Use default styling
    // Increase/decrease \`borderWidth\` in CSS or at runtime for a thicker/thinner
    // outer throbber ring. A visually appealing value is \`calc(<width> / 10)\`.
    .style({ width: "4rem", borderWidth: "0.4rem" });

const modern = new Throbber()
    .addClass("throbber", "modern") // 'modern' => Use alternate styling
    // Increase/decrease the variable \`--throbber-stroke-width\` in CSS or
    // at runtime for a thicker/thinner outer throbber ring.
    .style("width", "4rem");

const example = new Div(
    new Div(new P("Classic"), classic)
        .style({ display: "flex", flexDirection: "column", alignItems: "center" }),
    new Div(new P("Modern"), modern)
        .style({ display: "flex", flexDirection: "column", alignItems: "center" })
)
    .style({ display: "flex", alignItems: "center", gap: "4rem" });

new VTS_App(document.body).append(example);
\`\`\`

The animation can be shown or hidden at runtime with \`active()\` or the \`Active\` property:

\`\`\`
classic.active(false);
modern.Active = true;
\`\`\`
`;


export class ThrobberEx extends BaseExample {
    #throbbers: Throbber[];

    constructor() {
        super("Throbber");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let classic: Throbber;
        let modern: Throbber;

        this.#throbbers = [
            classic = $.throbber()
                .style({ width: "4rem", borderWidth: "0.4rem" }),
            modern = $.throbber()
                .addClass("modern")
                .style("width", "4rem")
        ];

        this.append(
            this.markdown(intro),
            this.example([
                new Div(
                    new Div(new P("Classic"), classic)
                        .style({
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                        }),
                    new Div(new P("Modern"), modern)
                        .style({
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                        })
                )
                    .style({
                        display: "flex",
                        alignItems: "center",
                        gap: "4rem"
                    })
            ]),
            this.markdown("### Configuration"),
            this.properties(
                $.labeledCheckbox("Active")
                    .checked(true)
                    .on("checked", event => {
                        this.#throbbers.forEach(throbber => throbber.active(event.$.Checked));
                    })
            ),
            this.markdown(example)
        );
    }
}
