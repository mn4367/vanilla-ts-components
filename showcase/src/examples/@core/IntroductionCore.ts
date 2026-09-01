import { BaseExample } from "../BaseExample.js";


const intro = `
The components provided by the \`@vanilla-ts/core\` package ...
`;

export class CoreIntroductionEx extends BaseExample {
    constructor() {
        super();
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this
            .addClass("ex-core-introduction")
            .append(
                this.markdown(intro)
            );
    }
}
