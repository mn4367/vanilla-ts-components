import { Code, H1, H2, P, Section } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<section>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/section%.

**Class:** \`@vanilla-ts/dom/Section\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Code, Div, H1, H2, P, Section } from "@vanilla-ts/dom";

const example = new Div(
    new H1("Choosing an Apple*"),
    new Section(
        new H2("Introduction"),
        new P(
            "This document provides a guide to help with ..."
        ),
    ),
    new Section(
        new H2("Criteria"),
        new P(
            "There are many different criteria to be considered ..."
        ),
    ),
    new P(
        "* Example text taken from the MDN article on ",
        new Code("<section>"),
        " linked to above."
    )
        .addClass("sz-smaller")
)

new VTS_App(document.body).append(example);
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
                new H1("Choosing an Apple*"),
                new Section(
                    new H2("Introduction"),
                    new P("This document provides a guide to help with the important task of choosing the correct Apple."),
                ),
                new Section(
                    new H2("Criteria"),
                    new P(
                        "There are many different criteria to be considered when choosing an Apple — "
                        + "size, color, firmness, sweetness, tartness..."
                    ),
                ),
                new P(
                    "* Example text taken from the MDN article on ",
                    new Code("<section>"),
                    " linked to above."
                ).addClass("sz-smaller"),
            ]),
            this.markdown(example),
        );
    }
}
