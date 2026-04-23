import { cid } from "@vanilla-ts/core";
import { Div, Footer, Header, Main } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<header>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header%.

**Class:** \`@vanilla-ts/dom/Header\`
`;

const example = `
### Code example

\`\`\`
import { Div, Footer, Header, Main } from "@vanilla-ts/dom";

const style = {
    padding: "0.5rem",
    borderRadius: "0.5rem",
    border: "1px solid lightgray"
};

const h = new Header("Header content").style(style);
const m = new Main("Main content").style("padding", "1rem 0.5rem");
const f = new Footer("Footer content").style(style);

new Div().id("app").append(
    h,
    m,
    f;
)
\`\`\`
`;


export class HeaderEx extends BaseExample {
    constructor() {
        super("Header");
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
                new Div().id(cid()).append(
                    h,
                    m,
                    f
                )
            ], [h]),
            this.markdown(example),
        );
    }
}
