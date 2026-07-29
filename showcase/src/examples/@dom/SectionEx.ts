import { Section } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<section>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section%.

**Class:** \`@vanilla-ts/dom/Section\`
`;

const example = `
### Code example

\`\`\`
import { Section } from "@vanilla-ts/dom";

new Section();

\`\`\`
`;


export class SectionEx extends BaseExample {
    constructor() {
        super("Section");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new Section()
            ]),
            this.markdown(example),
        );
    }
}
