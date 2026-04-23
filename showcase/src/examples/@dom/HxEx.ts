import { Div, H1, H2, H3, H4, H5, H6 } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
6 components that encapsulate the \`h1\` to \`h6\` section heading DOM elements
(%\`<h1>\` to \`<h6>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements%).

**Classes:** \`@vanilla-ts/dom/H1\` to \`@vanilla-ts/dom/H6\`
`;

const example = `
### Code example

\`\`\`
import { Div, H1, H2, H3, H4, H5, H6 } from "@vanilla-ts/dom";

const div = new Div().append(
    new H1("H1 Heading"),
    new H2("H2 Heading"),
    new H3("H3 Heading"),
    new H4("H4 Heading"),
    new H5("H5 Heading"),
    new H6("H6 Heading")
);
\`\`\`
`;


export class HxEx extends BaseExample {
    #h1: H1;
    #h2: H2;
    #h3: H3;
    #h4: H4;
    #h5: H5;
    #h6: H6;

    constructor() {
        super("Hx");
        new Div;
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                this.#h1 = new H1("H1 Heading"),
                this.#h2 = new H2("H2 Heading"),
                this.#h3 = new H3("H3 Heading"),
                this.#h4 = new H4("H4 Heading"),
                this.#h5 = new H5("H5 Heading"),
                this.#h6 = new H6("H6 Heading")
            ], [this.#h1, this.#h2, this.#h3, this.#h4, this.#h5, this.#h6]),
            this.markdown(example),
        );
    }
}
