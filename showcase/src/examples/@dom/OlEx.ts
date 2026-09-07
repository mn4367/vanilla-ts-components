import { Em, LiOl, Ol, P } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<ol>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol%. The list also supports the
properties \`start\`, \`reversed\` and \`type\`.

**Class:** \`@vanilla-ts/dom/Ol\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Em, Div, LiOl, Ol, P } from "@vanilla-ts/dom";

const example = new Div(
    new P("How to make a muffin:"),
    new Ol(
        // List items can be @vanilla-ts/dom/LiOl components ...
        new LiOl(0, "Relax (optional)."), // An individual number can be set for every list item
        // ... or simply strings ...
        "Mix flour, baking powder, sugar, and salt.",
        "In another bowl, mix eggs, milk, and oil.",
        "Stir both mixtures together.",
        "Fill muffin tray 3/4 full.",
        // ... or any other component, e.g. an @vanilla-ts/dom/Em instance.
        new Em("Bake for 20 minutes.")
    )
);

new VTS_App(document.body).append(example);
\`\`\`
`;


export class OlEx extends BaseExample {
    constructor() {
        super("Ol");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new P("How to make a muffin:"),
                new Ol(
                    new LiOl(0, "Relax (optional)."),
                    "Mix flour, baking powder, sugar, and salt.",
                    "In another bowl, mix eggs, milk, and oil.",
                    "Stir both mixtures together.",
                    "Fill muffin tray 3/4 full.",
                    new Em("Bake for 20 minutes.")
                )
            ]),
            this.markdown(example),
        );
    }
}
