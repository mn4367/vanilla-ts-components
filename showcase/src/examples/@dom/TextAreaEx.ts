import { TextArea } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<textarea>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea%.
This component is also available as a §@components/LabeledTextArea§.

**Class:** \`@vanilla-ts/dom/TextArea\`
`;

const example = `
### Code example

\`\`\`
import { TextArea } from "@vanilla-ts/dom";

new TextArea(
    "Lorem ipsum ut wisi enim ad minim veniam ...",
    10,
    50
);

\`\`\`
`;


export class TextAreaEx extends BaseExample {
    constructor() {
        super("TextArea");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new TextArea(
                    "Lorem ipsum ut wisi enim ad minim veniam, quis nostrud exerci ullamcorper suscipit ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis et blandit augue duis dolore te feugait nulla facilisi.",
                    10,
                    50
                ).resizable("both")
            ]),
            this.markdown(example),
        );
    }
}
