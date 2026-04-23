import { CSSStyleDeclarations } from "@vanilla-ts/core";
import { Div, Label, TextInput } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<label>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label%.

**Class:** \`@vanilla-ts/dom/Label\`
`;

const example = `
### Code example

\`\`\`
import { Div, Label, TextInput } from "@vanilla-ts/dom";

const style: CSSStyleDeclarations = {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem"
};
const labeledTextInput = new Div()
    .style(style)
    .append(
        new Label("ti", "Username"),
        new TextInput("ti", undefined, "text-input")
            .placeholder("Enter username here")
    );
\`\`\`

*Note:* \`@vanilla-ts/components\` already provides many specialized labeled components like
§@components/LabeledTextInput§ which internally use the \`Label\` component so there is usually no
need to manually construct labeled components like in the example aboove.
`;


export class LabelEx extends BaseExample {
    #label: Label;
    constructor() {
        super("Label");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const style: CSSStyleDeclarations = {
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem"
        };
        const labeledTextInput = new Div()
            .style(style)
            .append(
                this.#label = new Label("ti", "Username"),
                new TextInput("ti", undefined, "text-input")
                    .placeholder("Enter username here")
            );
        this.append(
            this.markdown(intro),
            this.example([labeledTextInput], [this.#label]),
            this.markdown(example)
        );
    }
}
