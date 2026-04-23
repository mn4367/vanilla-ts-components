import { Div } from "@vanilla-ts/dom";
import { LabeledNumberInput } from "../../../../src/LabeledNumberInput.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/NumberInput§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledNumberInput\`
`;

const example = `
### Code example

\`\`\`
import { LabeledNumberInput } from "@vanilla-ts/components";

const input = new LabeledNumberInput(
    "The answer to all questions?",
    undefined,      // id (auto-generated if not provided)
    "22",           // value (initial value)
    "the_question", // name (form name)
    "2",            // minimum value
    "44",           // maximum value
    "2"             // step interval
)
    .addClass("labeled-number-input");
input.NumberInput.DOM.setCustomValidity("not_42");
input.on("input", () => {
    input.NumberInput.DOM.setCustomValidity(input.Value === "42" ? "" : "not_42");
});
\`\`\`
`;

const css = `
### CSS example

\`\`\`
.labeled-number-input {
    > input[type="number"] {
        &:valid {
            /* \`--color-success\` is defined in the default theme as \`hsl(120, 100 %, 35 %)\`*/
            color: var(--color-success);
        }
        /* \`:invalid\` is already defined in the default theme with
           \`--color-warn: hsl(0, 100 %, 72.5 %)\`
        &:invalid {
            color: var(--color-warn);
        }
        */
    }
}
\`\`\`
`;


export class LabeledNumberInputEx extends BaseExample {
    #lInput: LabeledNumberInput;

    constructor() {
        super("LabeledNumberInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.#lInput = $.labeledNumberInput(
            "The answer to all questions?",
            undefined,      // id (auto-generated if not provided)
            "22",           // value (initial value)
            "the_question", // (form name)
            "2",            // minimum value
            "44",           // maximum value
            "2"             // step interval
        )
            .addClass("lni-example");
        this.#lInput.NumberInput.DOM.setCustomValidity("not_42");
        this.#lInput.on("input", () => {
            this.#lInput.NumberInput.DOM.setCustomValidity(
                this.#lInput.Value === "42" ? "" : "not_42"
            );
        });
        this.append(
            this.markdown(intro),
            this.example([this.#lInput]),
            this.markdown("### Label position and label alignment"),
            new Div().addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lInput], true, "start", "start"),
                ),
            this.markdown(example),
            this.markdown(css),
        );
    }
}
