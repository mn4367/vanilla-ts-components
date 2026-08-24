import { LiUl, P, Ul } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<ul>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul%.

**Class:** \`@vanilla-ts/dom/Ul\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Div, LiUl, P, Ul } from "@vanilla-ts/dom";

const example = new Div(
    new P("Shopping List:"),
    new Ul(
        // List items can be strings ...
        "Flour",
        "Baking powder",
        "Sugar",
        "Salt",
        "Oil",
        // ... or @vanilla-ts/dom/LiUl components ...
        new LiUl(
            "From the cooling shelf:",
            // ... or simply any other component, e.g. another @vanilla-ts/dom/Ul instance.
            new Ul(
                new LiUl("Eggs"),
                new LiUl("Milk")
            )
        )
    )
);

new VTS_App(document.body).append(example);
\`\`\`
`;


export class UlEx extends BaseExample {
    constructor() {
        super("Ul");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new P("Shopping List:"),
                new Ul(
                    "Flour",
                    "Baking powder",
                    "Sugar",
                    "Salt",
                    "Oil",
                    new LiUl(
                        "From the cooling shelf:",
                        new Ul(
                            new LiUl("Eggs"),
                            new LiUl("Milk")
                        )
                    )
                ),
            ]),
            this.markdown(example),
        );
    }
}
