import { BaseExample } from "../BaseExample.js";


const intro = `
\`Input\` is an *abstract* component that is used as the base class for all input components, such
as §@dom/TextInput§, §@dom/Checkbox / Switch§, §@dom/RadioButton§, etc., so there is no visual
example here. It provides basic functionality common to all input components, such as required /
readonly attributes and value handling.

**Class:** \`@vanilla-ts/dom/Input\`
`;


export class InputEx extends BaseExample {
    constructor() {
        super("Input");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
        );
    }
}
