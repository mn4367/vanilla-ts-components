import { BaseExample } from "../BaseExample.js";


export class ComponentFactoriesEx extends BaseExample {
    constructor() {
        super("Component factories");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this
            .append(
                this.markdown("...")
            );
    }
}
