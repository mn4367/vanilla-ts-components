import { Br, Div } from "@vanilla-ts/dom";
import { LabeledAnchor } from "../../../../src/LabeledAnchor.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with an §@dom/A§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledAnchor\`
`;

const example = `
### Code example

\`\`\`
import { LabeledAnchor } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const anchor1 = new LabeledAnchor(
    "https://github.com/mn4367/vanilla-ts-dom",
    "DOM project home",
    "Vanilla.ts DOM"
)
    .addClass("labeled-anchor")
    .target("_blank");

const anchor2 = new LabeledAnchor(
    "https://github.com/mn4367/vanilla-ts-components",
    "Components project home",
    [] // \`[]\` or \`undefined\` => link text is the href attribute of the anchor.
)
    .addClass("labeled-anchor")
    .target("_blank");

new VTS_App(document.body).append(anchor1, anchor2);
\`\`\`
`;


export class LabeledAnchorEx extends BaseExample {
    #lAnchor1: LabeledAnchor;
    #lAnchor2: LabeledAnchor;

    constructor() {
        super("LabeledAnchor");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.#lAnchor1 = $.labeledAnchor(
            "https://github.com/mn4367/vanilla-ts-dom",
            "DOM project home",
            "Vanilla.ts DOM"
        ).target("_blank");
        this.#lAnchor2 = $.labeledAnchor(
            "https://github.com/mn4367/vanilla-ts-components",
            "Components project home",
            // []
        ).target("_blank");
        this.append(
            this.markdown(intro),
            this.example([new Div(this.#lAnchor1, new Br(), this.#lAnchor2)]),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lAnchor1, this.#lAnchor2], true, "start", "start"),
                ),
            this.markdown(example),
        );
    }
}
