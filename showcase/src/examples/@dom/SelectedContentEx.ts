import { Button, Em, Option, P, Select, SelectedContent, Span } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<selectedcontent>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/selectedcontent%.
It displays a clone of the currently selected \`Option\` inside the closed control of a customizable
§@dom/Select§. The component must be placed inside a \`Button\`, which in turn must be the first
child of the \`Select\`. Its contents are managed by the browser and therefore cannot be added
through the component API.

Customizable selects and \`<selectedcontent>\` are not supported by all browsers yet. In browsers
without support, the select remains usable but is displayed as a conventional native control. In the
example below the first option's content (the emoji) is hidden inside the \`<selectedcontent>\`
element.

**Class:** \`@vanilla-ts/dom/SelectedContent\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Button, Em, Option, P, Select, SelectedContent, Span } from "@vanilla-ts/dom";

const example = new Select([
    new Button(new SelectedContent()),
    new Option(new Span("🍎 "), "Apple").value("apple"),
    new Option(new Span("🍌 "), "Banana").value("banana"),
    new Option(new Span("🍒 "), "Cherry").value("cherry")
])
    .addClass("selectedcontent-example")
    .value("banana")
    .on("change", () => log.phrase("Selected fruit (value): ", new Em(example.Value)));

const log = new P("Select a fruit from the dropdown above.")
    .style({
        width: "20rem",
        marginBlockStart: "1rem"
    });

new VTS_App(document.body).append(example, log);
\`\`\`


### CSS

\`\`\`
select.selectedcontent-example {
    /* &::picker(select) {
        appearance: base-select;
    } */
    appearance: base-select;
    display: flex;
    align-items: center;
    inline-size: 10rem;
    selectedcontent {
        span:first-child {
            display: none;
        }
    }
}
\`\`\`
`;


export class SelectedContentEx extends BaseExample {
    constructor() {
        super("SelectedContent");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const log = new P("Select a fruit from the dropdown above.")
            .style({
                width: "20rem",
                marginBlockStart: "1rem"
            });
        const select = new Select([
            new Button(new SelectedContent()),
            new Option(new Span("🍎 "), new Span("Apple")).value("apple"),
            new Option(new Span("🍌 "), new Span("Banana")).value("banana"),
            new Option(new Span("🍒 "), new Span("Cherry")).value("cherry")
        ])
            .addClass("selectedcontent-example")
            .value("banana")
            .on("change", () => log.phrase("Selected fruit (value): ", new Em(select.Value)));

        this.append(
            this.markdown(intro),
            this.example([
                select,
                log
            ]),
            this.markdown(example)
        );
    }
}
