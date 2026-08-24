import { TextInput } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native text input DOM element
(%\`<input type="text">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text%).
This component is also available as a §@components/LabeledTextInput§.

**Class:** \`@vanilla-ts/dom/TextInput\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { TextInput } from "@vanilla-ts/dom";

const example = new TextInput().placeholder("Enter some text here");

new VTS_App(document.body).append(example);
\`\`\`
`;


export class TextInputEx extends BaseExample {
    constructor() {
        super("TextInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new TextInput().placeholder("Enter some text here")
            ]),
            this.markdown(example)
        );
    }
}
