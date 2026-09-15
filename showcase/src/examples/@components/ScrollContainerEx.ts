import { Div, P, Text } from "@vanilla-ts/dom";
import { ScrollContainer } from "../../../../src/ScrollContainer.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A container for content that may overflow its available area. It provides horizontal and vertical
scrolling with consistently styled scroll bars across platforms and user agents. Either direction
can be enabled independently; native scroll bars can also be used when required.

The outer component must have a defined height and its \`padding\` should remain \`0\`. Apply
padding and other content-related styles through the \`Content\` property instead. Add and remove
children through the \`ScrollContainer\` itself so that their size changes are observed and the
scroll bars remain synchronized.

**Class:** \`@vanilla-ts/components/ScrollContainer\`
`;

const example = `
### Code example

\`\`\`
import { ScrollContainer } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Div, P } from "@vanilla-ts/dom";

const content = new Div(
    ...Array.from({ length: 12 }, (_, index) =>
        new P(\`\${index + 1}. Content that extends beyond the visible width of the container.\`)
    )
)
    .style("width", "max-content");

const scrollContainer = new ScrollContainer(true, true)
    .addClass("scroll-container")
    .style({
        inlineSize: "24rem",
        blockSize: "14rem",
        border: "1px solid lightgray"
    })
    // Add and remove children through the ScrollContainer, not through Content.
    .append(content);

// Content may be used for styling the inner scrollable area.
scrollContainer.Content.style({ padding: "1rem" });

new VTS_App(document.body).append(scrollContainer);
\`\`\`

The available scroll directions can be changed with \`horizontal()\` and \`vertical()\`.
\`native(true)\` switches to the user agent's native scroll bars. Scrolling can also be controlled
programmatically:

\`\`\`
scrollContainer.scroll({
    left: getComputedStyle(scrollContainer.DOM).direction === "ltr" ? 100 : -100,
    top: 0,
    behavior: "smooth"
});
scrollContainer.scrollBy({ left: 100, top: 100, behavior: "smooth" });

const { X, Y } = scrollContainer.ScrollOffset;
\`\`\`
`;


export class ScrollContainerEx extends BaseExample {
    #scrollContainer: ScrollContainer;

    constructor() {
        super("ScrollContainer");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const content = new Div(
            ...Array.from({ length: 12 }, (_, index) =>
                new P(`${index + 1}. Content that extends beyond the visible width of the container.`)
            )
        )
            .style("width", "max-content");

        this.#scrollContainer = $.scrollContainer(true, true)
            .style({
                inlineSize: "24rem",
                blockSize: "14rem",
                border: "var(--panel-border)"
            })
            .append(content);
        this.#scrollContainer.Content.style({
            padding: "1rem",
        });

        this.append(
            this.markdown(intro),
            this.example([this.#scrollContainer]),
            this.markdown("### Configuration"),
            this.properties(
                $.labeledCheckbox("Horizontal scrolling")
                    .checked(true)
                    .on("checked", event => {
                        this.#scrollContainer
                            .horizontal(event.$.Checked)
                            .sync();
                    }),
                $.labeledCheckbox("Vertical scrolling")
                    .checked(true)
                    .on("checked", event => {
                        this.#scrollContainer
                            .vertical(event.$.Checked)
                            .sync();
                    }),
                $.labeledCheckbox("Native scroll bars")
                    .on("checked", event => this.#scrollContainer.native(event.$.Checked))
                    .style({
                        marginBlockEnd: "0.5rem"
                    }),
                $.buttonRegular("Scroll to start")
                    .on("click", () => this.#scrollContainer.scroll({
                        left: 0,
                        top: 0,
                        behavior: "smooth"
                    })),
                new Text("\u2003"),
                $.buttonRegular("Scroll by 100 px")
                    .on("click", () => this.#scrollContainer.scrollBy({
                        left: getComputedStyle(this.#scrollContainer.DOM).direction === "ltr" ? 100 : -100,
                        top: 100,
                        behavior: "smooth"
                    }))
            ),
            this.markdown(example)
        );
    }
}
