import { Div } from "@vanilla-ts/dom";
import { LabeledParagraph } from "../../../../src/LabeledParagraph.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/P§ and a §@dom/Span§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledParagraph\`
`;

const example = `
### Code example

\`\`\`
import { LabeledParagraph } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledParagraph("Sample text", "Lorem ipsum ...")
    .addClass("labeled-paragraph");

new VTS_App(document.body).append(example);
\`\`\`
`;

const lorem = `
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est.
`;


export class LabeledParagraphEx extends BaseExample {
    #lParagraph: LabeledParagraph;

    constructor() {
        super("LabeledParagraph");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.#lParagraph = $.labeledParagraph("Sample text", lorem);
        this.append(
            this.markdown(intro),
            this.example([this.#lParagraph]),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lParagraph], true, "start", "start"),
                ),
            this.markdown(example),
        );
    }
}
