import { BaseExample } from "../BaseExample.js";


export class ElementComponentVoidEx extends BaseExample {
    constructor() {
        super("ElementComponentVoid");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this
            .append(
                this.markdown("...")
            );
    }
}
