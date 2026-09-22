import { ElementComponentWithChildren } from "@vanilla-ts/core";
import { Br, Checkbox, Label, Legend } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<legend>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/legend%.
It provides a caption for the contents of its parent \`<fieldset>\` element and should be its first
child. In a customizable §@dom/Select§, a \`Legend\` can also label its parent §@dom/OptGroup§.

**Class:** \`@vanilla-ts/dom/Legend\`
`;

const example = `
### Code example

\`\`\`
import { ElementComponentWithChildren, VTS_App } from "@vanilla-ts/core";
import { Br, Checkbox, Label, Legend } from "@vanilla-ts/dom";

const emailCheckboxID = "email-notifications";
const pushCheckboxID = "push-notifications";
const emailCheckbox = new Checkbox(emailCheckboxID);
const pushCheckbox = new Checkbox(pushCheckboxID);

const example = new ElementComponentWithChildren<HTMLFieldSetElement>("fieldset")
    .append(
        new Legend("Notification preferences"),
        emailCheckbox,
        new Label(emailCheckboxID, "Email notifications"),
        new Br(),
        pushCheckbox,
        new Label(pushCheckboxID, "Push notifications")
    );

new VTS_App(document.body).append(example);
\`\`\`
`;


export class LegendEx extends BaseExample {
    constructor() {
        super("Legend");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const emailCheckboxID = "legend-example-email";
        const pushCheckboxID = "legend-example-push";
        const emailCheckbox = new Checkbox(emailCheckboxID);
        const pushCheckbox = new Checkbox(pushCheckboxID);
        const fieldSet = new ElementComponentWithChildren<HTMLFieldSetElement>("fieldset")
            .addClass("legend-example")
            .append(
                new Legend("Notification preferences"),
                emailCheckbox,
                new Label(emailCheckboxID, "Email notifications"),
                new Br(),
                pushCheckbox,
                new Label(pushCheckboxID, "Push notifications")
            );

        this.append(
            this.markdown(intro),
            this.example([fieldSet]),
            this.markdown(example)
        );
    }
}
