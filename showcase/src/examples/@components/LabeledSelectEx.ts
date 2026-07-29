import { Div, Em, ISelectValues, P } from "@vanilla-ts/dom";
import { LabelPosition } from "../../../../src/LabeledComponents.js";
import { LabeledSelect } from "../../../../src/LabeledSelect.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with an §@dom/Select§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledSelect\`
`;

const example = `
### Code example

\`\`\`
import { LabeledSelect, LabelPosition } from "@vanilla-ts/components";
import { Em, ISelectValues, P } from "@vanilla-ts/dom";

const selectValues: ISelectValues[] = [
    { Text: "Apple", Value: "apple" },
    { Text: "Banana", Value: "banana" },
    { Text: "Cherry", Value: "cherry" },
    { Text: "Dragonfruit", Value: "dragonfruit" },
    { Text: "Eggplant", Value: "eggplant" }
];

const select = new LabeledSelect("Fruits", selectValues)
    .value("cherry")
    .labelPosition(LabelPosition.TOP)
    .on("change", () => log.phrase("Selected fruit (value): ", new Em(select.Value)));

const log = new P("Select a fruit from the dropdown above.")
    .style("marginBlockStart", "1rem");
\`\`\`
`;


export class LabeledSelectEx extends BaseExample {
    #lInput: LabeledSelect;

    constructor() {
        super("LabeledSelect");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const selectValues: ISelectValues[] = [
            { Text: "Apple", Value: "apple" },
            { Text: "Banana", Value: "banana" },
            { Text: "Cherry", Value: "cherry" },
            { Text: "Dragonfruit", Value: "dragonfruit" },
            { Text: "Eggplant", Value: "eggplant" }
        ];
        const log = new P("Select a fruit from the dropdown above.").style("marginBlockStart", "1rem");
        this.#lInput = $.labeledSelect("Fruits", selectValues)
            .value("cherry")
            .labelPosition(LabelPosition.TOP)
            .on("change", () => log.phrase("Selected fruit (value): ", new Em(this.#lInput.Value)));
        this.append(
            this.markdown(intro),
            this.example([
                this.#lInput,
                log
            ]),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lInput], true, "top", "start"),
                ),
            this.markdown(example),
        );
    }
}
