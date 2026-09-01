import { BaseExample } from "../BaseExample.js";


const intro = `
## DOM components

The components provided by the \`@vanilla-ts/dom\` package are basic elements that encapsulate
native DOM elements and provide a convenient API for their usage and configuration. They are also
used as building blocks for more complex components like those in the
[\`@vanilla-ts/components\`](#@components/Introduction) package. Currently not yet all native DOM
elements are covered by this package. However, many common ones are and the package is continuously
being expanded.
`;

export class DOMIntroductionEx extends BaseExample {
    constructor() {
        super();
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this
            .addClass("ex-dom-introduction")
            .append(
                this.markdown(intro)
            );
    }
}
