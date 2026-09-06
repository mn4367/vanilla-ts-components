import { Em, Option, P, Select, SelectChild } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native DOM select element
(%\`<select>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select%).
This component is also available as a §@components/LabeledSelect§.

**Class:** \`@vanilla-ts/dom/Select\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Em, Option, P, Select, SelectChild } from "@vanilla-ts/dom";

const options: SelectChild[] = [
    new Option("Apple").value("apple"),
    new Option("Banana").value("banana"),
    new Option("Cherry").value("cherry"),
    new Option("Dragonfruit").value("dragonfruit"),
    new Option("Eggplant").value("eggplant")
];

const example = new Select(options)
    .value("cherry")
    .style("width", "8rem")
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

Setting \`Multiple\` to \`true\` (or calling \`multiple(true)\`) allows users to select more than
one option. The selected options/values can be read from the \`SelectedOptions\` property of the
component. Depending on the operating system, users can select multiple entries by holding the
*Ctrl*, *Command* or *Shift* key.
`;

const exampleMultiple = `
### Code example (multiple selection)

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Em, Option, P, Select } from "@vanilla-ts/dom";

const example = new Select([
    new Option("Apple").value("apple").selected(true),
    new Option("Banana").value("banana"),
    new Option("Cherry").value("cherry").selected(true),
    new Option("Dragonfruit").value("dragonfruit"),
    new Option("Eggplant").value("eggplant")
])
    .multiple(true)
    .size(5)
    .style("width", "10rem")
    .on("change", updateLog);

const log = new P("Select fruits from the list above.")
    .style({
        width: "20rem",
        marginBlockStart: "1rem"
    });

function updateLog(): void {
    const selectedValues = Array.from(example.SelectedOptions, option => option.Value);
    log.phrase(
        "Selected fruits (values): ",
        new Em(selectedValues.join(", ") || "None")
    );
}

new VTS_App(document.body).append(example, log);
\`\`\`
`;


export class SelectEx extends BaseExample {
    constructor() {
        super("Select");
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
                width: "20rem", marginBlockStart: "1rem"
            });
        function updateSingleLog(): void {
            log.phrase("Selected fruit (value): ", new Em(select.Value));
        }
        const select = new Select(options)
            .value("cherry")
            .style("width", "10rem")
            .on("change", updateSingleLog);
        //
        const logMultiple = new P("Select fruits from the list above.")
            .style({
                width: "20rem",
                marginBlockStart: "1rem"
            });
        function updateMultipleLog(): void {
            const selectedValues = Array.from(selectMultiple.SelectedOptions, option => option.Value);
            logMultiple.phrase(
                "Selected fruits (values): ",
                new Em(selectedValues.join(", ") || "None")
            );
        }
        const selectMultiple = new Select([
            new Option("Apple").value("apple").selected(true),
            new Option("Banana").value("banana"),
            new Option("Cherry").value("cherry").selected(true),
            new Option("Dragonfruit").value("dragonfruit"),
            new Option("Eggplant").value("eggplant")
        ])
            .multiple(true)
            .size(5)
            .style("width", "10rem")
            .on("change", updateMultipleLog);

        this.append(
            this.markdown(intro),
            this.example([
                select,
                log
            ]),
            this.markdown(example),
            this.markdown("---"),
            this.markdown(introMultiple),
            this.example([
                selectMultiple,
                logMultiple
            ]),
            this.markdown(exampleMultiple),
        );
    }
}
