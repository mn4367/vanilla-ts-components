import { Option } from "@vanilla-ts/core";
import { Div, Em, P, SelectChild } from "@vanilla-ts/dom";
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
import { Option, VTS_App } from "@vanilla-ts/core";
import { Em, SelectChild, P } from "@vanilla-ts/dom";

const options: SelectChild[] = [
    new Option("Apple").value("apple"),
    new Option("Banana").value("banana"),
    new Option("Cherry").value("cherry"),
    new Option("Dragonfruit").value("dragonfruit"),
    new Option("Eggplant").value("eggplant")
];

const example = new LabeledSelect("Fruits", options)
    .value("cherry")
    .labelPosition(LabelPosition.TOP)
    .on("change", () => log.phrase("Selected fruit (value): ", new Em(example.Value)));

const log = new P("Select a fruit from the dropdown above.")
    .style({
        width: "20rem",
        marginBlockStart: "1rem"
    });

new VTS_App(document.body).append(example, log);
\`\`\`
`;


export class LabeledSelectEx extends BaseExample {
    #lInput: LabeledSelect;

    constructor() {
        super("LabeledSelect");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const options: SelectChild[] = [
            new Option("Apple").value("apple"),
            new Option("Banana").value("banana"),
            new Option("Cherry").value("cherry"),
            new Option("Dragonfruit").value("dragonfruit"),
            new Option("Eggplant").value("eggplant")
        ];
        const log = new P("Select a fruit from the dropdown above.").style({ width: "20rem", marginBlockStart: "1rem" });
        this.#lInput = $.labeledSelect("Fruits", options)
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
