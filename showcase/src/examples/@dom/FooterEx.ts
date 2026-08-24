import { cid } from "@vanilla-ts/core";
import { Div, Footer, Header, Main } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<footer>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer%.

**Class:** \`@vanilla-ts/dom/Footer\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Footer, Header, Main } from "@vanilla-ts/dom";

const style = {
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "1px solid lightgray"
};

const h = new Header("Header content").style(style);
const m = new Main("Main content").style("padding", "1rem 0.5rem");
const f = new Footer("Footer content").style(style);

new VTS_App(document.body).append(h, m, f);
\`\`\`
`;


export class FooterEx extends BaseExample {
    constructor() {
        super("Footer");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const style = {
            padding: "0.5rem",
            borderRadius: "0.5rem",
            border: "1px solid lightgray"
        };
        const h = new Header("Header content").style(style);
        const m = new Main("Main content").style("padding", "1rem 0.5rem");
        const f = new Footer("Footer content").style(style);
        this.append(
            this.markdown(intro),
            this.example([
                new Div(h, m, f).id(cid())
            ], [f]),
            this.markdown(example),
        );
    }
}
