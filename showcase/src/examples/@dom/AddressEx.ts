import { A, Address, Br, P } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<address>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/address%.

**Class:** \`@vanilla-ts/dom/Address\`
`;

const example = `
### Code example

\`\`\`
import { A, Address, Br, Div, P } from "@vanilla-ts/dom";

const div = new Div()
    .append(
        new P("Contact the author of this page:"),
        new Address().append(
            new A("mailto:jim@example.com", "jim@example.com"),
            new Br(),
            new A("tel:+14155550132", "+1 (415) 555‑0132")
        )
    );
\`\`\`
`;


export class AddressEx extends BaseExample {
    constructor() {
        super("Address");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let address: Address;
        this.append(
            this.markdown(intro),
            this.example([
                new P("Contact the author of this page:"),
                address = new Address().append(
                    new A("mailto:jim@example.com", "jim@example.com"),
                    new Br(),
                    new A("tel:+14155550132", "+1 (415) 555‑0132")
                )
            ], [address]),
            this.markdown(example)
        );
    }
}
