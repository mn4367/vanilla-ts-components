import { A, LiUl, Nav, Ul } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<nav>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/nav%.

**Class:** \`@vanilla-ts/dom/Nav\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { A, LiUl, Nav, Ul } from "@vanilla-ts/dom";

const example = new Nav(
    new Ul(
        new LiUl(
            new A("#Introduction", "Introduction"),
        ),
        new LiUl(
            new A("#@core/Introduction", "Core components"),
        ),
        new LiUl(
            new A("#@dom/Introduction", "DOM components"),
        ),
        new LiUl(
            new A("#@components/Introduction", "Advanced components"),
        )
    ).style({
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        listStyle: "none",
        margin: "0",
        padding: "0"
    })
);

new VTS_App(document.body).append(example);
\`\`\`
`;


export class NavEx extends BaseExample {
    constructor() {
        super("Nav");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.example([
                new Nav(
                    new Ul(
                        new LiUl(
                            new A("#Introduction", "Introduction"),
                        ),
                        new LiUl(
                            new A("#@core/Introduction", "Core components"),
                        ),
                        new LiUl(
                            new A("#@dom/Introduction", "DOM components"),
                        ),
                        new LiUl(
                            new A("#@components/Introduction", "Advanced components"),
                        )
                    ).style({
                        display: "flex",
                        flexDirection: "row",
                        gap: "1rem",
                        listStyle: "none",
                        margin: "0",
                        padding: "0"
                    })
                )
            ]),
            this.markdown(example),
        );
    }
}
