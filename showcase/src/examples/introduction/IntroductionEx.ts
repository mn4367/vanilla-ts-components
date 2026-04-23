import { BaseExample } from "../BaseExample.js";


export class IntroductionEx extends BaseExample {
    constructor() {
        super();
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this
            .addClass("ex-introduction")
            .append(
                this.markdown("This showcase application..."),
            );
    }
}
