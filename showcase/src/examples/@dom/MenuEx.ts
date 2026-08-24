import { Menu } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<menu>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menu%.

**Class:** \`@vanilla-ts/dom/Menu\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Menu } from "@vanilla-ts/dom";

const example = new Menu();

new VTS_App(document.body).append(example);
\`\`\`
`;


export class MenuEx extends BaseExample {
    constructor() {
        super("Menu");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new Menu()
            ]),
            this.markdown(example),
        );
    }
}
