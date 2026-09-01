import { Em, ISelectValues, P, Select } from "@vanilla-ts/dom";
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
import { Em, ISelectValues, P, Select } from "@vanilla-ts/dom";

const selectValues: ISelectValues[] = [
    { Text: "Apple", Value: "apple" },
    { Text: "Banana", Value: "banana" },
    { Text: "Cherry", Value: "cherry" },
    { Text: "Dragonfruit", Value: "dragonfruit" },
    { Text: "Eggplant", Value: "eggplant" }
];

const example = new Select(selectValues)
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


export class SelectEx extends BaseExample {
    constructor() {
        super("Select");
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
        const log = new P("Select a fruit from the dropdown above.").style({ width: "20rem", marginBlockStart: "1rem" });
        const select = new Select(selectValues)
            .value("cherry")
            .style("width", "10rem")
            .on("change", () => log.phrase("Selected fruit (value): ", new Em(select.Value)));
        this.append(
            this.markdown(intro),
            this.example([
                select,
                log
            ]),
            this.markdown(example),
        );
    }
}
