import { Div } from "@vanilla-ts/dom";
import { LabeledSearchInput } from "../../../../src/LabeledSearchInput.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/SearchInput§ and a §@dom/Label§ representing a caption for the component.

**Class:** \`@vanilla-ts/components/LabeledSearchInput\`
`;

const example = `
### Code example

\`\`\`
import { LabeledSearchInput } from "@vanilla-ts/components";

const input = new LabeledSearchInput("Search")
    .addClass("labeled-search-input")
    .searchInput(c => c.placeholder("Enter search term..."));
\`\`\`
`;


export class LabeledSearchInputEx extends BaseExample {
    #lInput: LabeledSearchInput;

    constructor() {
        super("LabeledSearchInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.#lInput = $
            .labeledSearchInput("Search")
            .searchInput(c => c.placeholder("Enter search term..."));
        this.append(
            this.markdown(intro),
            this.example([this.#lInput]),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lInput], true, "start", "start")
                ),
            this.markdown(example),
        );
    }
}
