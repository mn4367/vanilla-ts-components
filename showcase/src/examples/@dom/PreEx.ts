import { Code, Pre } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<pre>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre%.

**Class:** \`@vanilla-ts/dom/Pre\`
`;

const example = `
### Code example

\`\`\`text
import { VTS_App } from "@vanilla-ts/core";
import { Code, Pre } from "@vanilla-ts/dom";

const cow = new Code(\`
^__^
(oo)\________
(__)\ufe68       )\ufe68/\ufe68
    ||----w||
    ||     ||
\`);

const example = new Pre(cow);

new VTS_App(document.body).append(example);
\`\`\`
`;


export class PreEx extends BaseExample {
    constructor() {
        super("Pre");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const cow = new Code(`
^__^
(oo)\ufe68________
(__)\ufe68       )\ufe68/\ufe68
    ||----w||
    ||     ||
`);
        this.append(
            this.markdown(intro),
            this.example([
                new Pre(cow)
            ], [cow]),
            this.markdown(example),
        );
    }
}
