import { SearchInput } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native search input DOM element
(%\`<input type="search">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/search%).
This component is also available as a §@components/LabeledSearchInput§.

**Class:** \`@vanilla-ts/dom/SearchInput\`
`;

const example = `
### Code example

\`\`\`
import { SearchInput } from "@vanilla-ts/dom";

const input = new SearchInput().placeholder("Enter search term...");
\`\`\`
`;


export class SearchInputEx extends BaseExample {
    constructor() {
        super("SearchInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new SearchInput().placeholder("Enter search term...")
            ]),
            this.markdown(example),
        );
    }
}
