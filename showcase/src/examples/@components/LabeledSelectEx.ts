import { Div, Em, Option, P, SelectChild } from "@vanilla-ts/dom";
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
import { LabelPosition, LabeledSelect } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Em, Option, P, SelectChild } from "@vanilla-ts/dom";

const options: SelectChild[] = [
    new Option("Apple").value("apple"),
    new Option("Banana").value("banana"),
    new Option("Cherry").value("cherry"),
    new Option("Dragonfruit").value("dragonfruit"),
    new Option("Eggplant").value("eggplant")
];

const example = new LabeledSelect("Fruits", options)
    .addClass("labeled-select")
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

const introMultiple = `
## Multiple selection

The inner \`Select\` component also supports multiple selection. It can be configured while creating
the \`LabeledSelect\` instance by passing a callback to \`select()\` and calling \`multiple(true)\`.
The selected options/values can be read from the \`SelectedOptions\` property of the inner \`Select\`
component. Depending on the operating system, users can select multiple entries by holding the
*Ctrl*, *Command* or *Shift* key.
`;

const exampleMultiple = `
### Code example (multiple selection)

\`\`\`
import { LabelPosition, LabeledSelect } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Em, Option, P } from "@vanilla-ts/dom";

const example = new LabeledSelect("Fruits", [
    new Option("Apple").value("apple").selected(true),
    new Option("Banana").value("banana"),
    new Option("Cherry").value("cherry").selected(true),
    new Option("Dragonfruit").value("dragonfruit"),
    new Option("Eggplant").value("eggplant")
])
    .addClass("labeled-select")
    .labelPosition(LabelPosition.TOP)
    .select(select => select
        .multiple(true)
        .size(5)
    )
    .on("change", updateLog);

const log = new P("Select fruits from the list above.")
    .style({
        width: "20rem",
        marginBlockStart: "1rem"
    });

function updateLog(): void {
    const selectedValues = example.Select.SelectedOptions.map(option => option.Value);
    log.phrase(
        "Selected fruits (values): ",
        new Em(selectedValues.join(", ") || "None")
    );
}

new VTS_App(document.body).append(example, log);
\`\`\`
`;


export class LabeledSelectEx extends BaseExample {
    #lInput: LabeledSelect;
    #lInputMultiple: LabeledSelect;

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
        const log = new P("Select a fruit from the dropdown above.")
            .style({
                width: "20rem",
                marginBlockStart: "1rem"
            });
        this.#lInput = $.labeledSelect("Fruits", options)
            .value("cherry")
            .labelPosition(LabelPosition.TOP)
            .on("change", () => log.phrase("Selected fruit (value): ", new Em(this.#lInput.Value)));

        const logMultiple = new P("Select fruits from the list above.")
            .style({
                width: "20rem",
                marginBlockStart: "1rem"
            });
        const updateMultipleLog = (): void => {
            const selectedValues = this.#lInputMultiple.Select.SelectedOptions.map(option => option.Value);
            logMultiple.phrase(
                "Selected fruits (values): ",
                new Em(selectedValues.join(", ") || "None")
            );
        };
        this.#lInputMultiple = $.labeledSelect("Fruits", [
            new Option("Apple").value("apple").selected(true),
            new Option("Banana").value("banana"),
            new Option("Cherry").value("cherry").selected(true),
            new Option("Dragonfruit").value("dragonfruit"),
            new Option("Eggplant").value("eggplant")
        ])
            .labelPosition(LabelPosition.TOP)
            .select(select => select
                .multiple(true)
                .size(5)
            )
            .on("change", updateMultipleLog);

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
            this.markdown("---"),
            this.markdown(introMultiple),
            this.example([
                this.#lInputMultiple,
                logMultiple
            ]),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lInputMultiple], true, "top", "start"),
                ),
            this.markdown(exampleMultiple),
        );
    }
}
