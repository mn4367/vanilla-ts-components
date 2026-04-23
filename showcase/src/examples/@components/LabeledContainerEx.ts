import { Div, P } from "@vanilla-ts/dom";
import { LabelAlignment } from "../../../../src/LabeledComponents.js";
import { LabeledContainer } from "../../../../src/LabeledContainer.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/Div§ as a (inner) container for other components and a §@dom/Span§
representing the caption for the container component.

**Class:** \`@vanilla-ts/components/LabeledContainer\`
`;

const example = `
### Code example

\`\`\`
import { Hr, P } from "@vanilla-ts/dom";
import { LabeledContainer, RadioButtonGroup } from "@vanilla-ts/components";

let rbg1: RadioButtonGroup;
let lcb1: LabeledCheckbox;
let lcb2: LabeledCheckbox;
let lcb3: LabeledCheckbox;

const container = new LabeledContainer(
    "Software update settings",
    undefined,
    LabelAlignment.CENTER
)
    .addClass("labeled-container", "software-updates")
    .append(
        new P("Types of updates to be notified about"),
        rbg1 = new RadioButtonGroup(
            [
                { Label: "Regular updates", Value: "regular" },
                { Label: "Beta versions", Value: "beta" },
                { Label: "Nightly builds", Value: "nightly" },
            ],
            "rbg-software-updates"
        )
            .value("beta"),
        new Hr(),
        new P("Choose how updates should be installed"),
        lcb1 = new LabeledCheckbox("Automatically download available updates")
            .checked(true),
        lcb2 = new LabeledCheckbox("Install updates automatically")
            .checked(true),
        lcb3 = new LabeledCheckbox("Install security updates automatically")
            .checked(true)
            .disabled(true),
    );
\`\`\`
`;

const exampleCSS = `
### CSS example

\`\`\`css
.labeled-container.software-updates {
    > .lc-component {
        > p {
            margin-block: 0.5rem;
        }
        > hr {
            margin-block: 1rem;
        }
    }
}
\`\`\`
`;


export class LabeledContainerEx extends BaseExample {
    #container: LabeledContainer;

    constructor() {
        super("LabeledContainer");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.#container = $.labeledContainer(
            "Software update settings", undefined, LabelAlignment.CENTER)
            .addClass("software-updates-sample")
            .append(
                new P("Types of updates to be notified about"),
                $.radioButtonGroup(
                    [
                        { Label: "Regular updates", Value: "regular" },
                        { Label: "Beta versions", Value: "beta" },
                        { Label: "Nightly builds", Value: "nightly" },
                    ],
                    "rbg-sample-1"
                )
                    .value("beta"),
                $.hr(),
                new P("Choose how updates should be installed"),
                $.labeledCheckbox("Automatically download available updates").checked(true),
                $.labeledCheckbox("Install updates automatically").checked(true),
                $.labeledCheckbox("Install security updates automatically").checked(true).disabled(true),
            );
        this.append(
            this.markdown(intro),
            this.example([this.#container]),
            this.markdown("### Label position and label alignment"),
            new Div().addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#container], false, "top", "center"),
                ),
            this.markdown(example),
            this.markdown(exampleCSS),
        );
    }
}
