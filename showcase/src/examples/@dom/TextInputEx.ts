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
import { TextInput } from "@vanilla-ts/dom";

const input = new TextInput().placeholder("Enter some text here");
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
