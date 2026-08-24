import { Div, P, Text } from "@vanilla-ts/dom";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a
%\`DOM Text node\`|https://developer.mozilla.org/en-US/docs/Web/API/Text%.

**Class:** \`@vanilla-ts/dom/Text\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { P, Text } from "@vanilla-ts/dom";

let c = 0;

const t = new Text(c.toString());

const example = new P("Counter called ", t, " times.");

setInterval(() => t.text((++c).toString()), 1000);

new VTS_App(document.body).append(example);
\`\`\`

If you inspect the paragraph inside the example above with the browsers development tools, you will
see that it consists of three text nodes and that only the middle one is updated every second.
`;


export class TextEx extends BaseExample {
    #c = 0;
    #t: Text;
    #interval: ReturnType<typeof setInterval>;

    constructor() {
        super("Text");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new P("Counter called ", this.#t = new Text(this.#c.toString()), " times."),
            ]),
            this.markdown("### Example usage"),
            new Div().addClass("example-properties")
                .append(
                    $.labeledCheckbox("Counter active", "lcb-text-ex")
                        .on("checked", ((ev) => {
                            ev.$.Checked
                                ? this.#interval = setInterval(() => this.#t.text((++this.#c).toString()), 1000)
                                : clearInterval(this.#interval);
                        })
                        ),
                ),
            this.markdown(example),
        );
    }
}
