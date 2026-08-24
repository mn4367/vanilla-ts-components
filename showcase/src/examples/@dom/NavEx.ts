import { Nav } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<nav>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav%.

**Class:** \`@vanilla-ts/dom/Nav\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Nav } from "@vanilla-ts/dom";

const example = new Nav();

new VTS_App(document.body).append(example);
\`\`\`
`;


export class NavEx extends BaseExample {
    constructor() {
        super("Nav");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new Nav()
            ]),
            this.markdown(example),
        );
    }
}
