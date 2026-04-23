import { BaseExample } from "../BaseExample.js";


export class EventBusEx extends BaseExample {
    constructor() {
        super("EventBus");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this
            .append(
                this.markdown("...")
            );
    }
}
