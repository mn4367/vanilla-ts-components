import { DataList, Option, TextInput } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<datalist>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist%.
It provides a list of predefined suggestions for an input component. The \`DataList\` and the input
are associated by setting the input's \`list\` attribute to the ID of the \`DataList\` component.
Unlike a §@dom/Select§ component, the input still allows values that are not part of the suggestions.

**Class:** \`@vanilla-ts/dom/DataList\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { DataList, Option, TextInput } from "@vanilla-ts/dom";

const dataList = new DataList(
    new Option("Berlin"),
    new Option("London"),
    // Some browsers will display the label as an additional description for the option.
    // Gecko-based browsers (e.g. Firefox) will display the label instead of the value,
    // but the value will still be used when the option is selected.
    new Option("Paris").label("Capital of France"),
    new Option("Rome"),
    new Option("Vienna")
).id("city-suggestions");

const example = new TextInput()
    .attrib("list", dataList.ID)
    .placeholder("Choose or enter a city")
    .style("width", "12rem");

new VTS_App(document.body).append(example, dataList);
\`\`\`
`;


export class DataListEx extends BaseExample {
    constructor() {
        super("DataList");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const dataList = new DataList(
            new Option("Berlin"),
            new Option("London"),
            new Option("Paris").label("Capital of France"),
            new Option("Rome"),
            new Option("Vienna")
        ).id("city-suggestions");
        const textInput = new TextInput()
            .attrib("list", dataList.ID)
            .placeholder("Choose or enter a city")
            .style("width", "12rem");
        this.append(
            this.markdown(intro),
            this.example([
                textInput,
                dataList
            ], [textInput]),
            this.markdown(example),
        );
    }
}
