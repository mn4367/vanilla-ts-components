import { BaseExample } from "../BaseExample.js";


export class ElementComponentWithChildrenEx extends BaseExample {
    constructor() {
        super("ElementComponentWithChildren");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this
            .append(
                this.markdown("...")
            );
    }
}
