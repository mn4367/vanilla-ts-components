import { Button, Text } from "@vanilla-ts/dom";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the native DOM button element
(%\`<button>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button%).

**Class:** \`@vanilla-ts/dom/Button\`

__Note:__ Buttons do not have a default styling. This is done to ease the creation of dedicated
button styles for different usage contexts (like dialogs, toolbars, icon buttons etc.).
`;

const example = `
### Code example (unstyled default button)

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Button } from "@vanilla-ts/dom";

const example = new Button("Button");

new VTS_App(document.body).append(example);
\`\`\`
`;

const exampleStyled = `
Nevertheless, it is expected that every CSS theme (like the default the theme of Vanilla-ts already
does) provides styles for the following common button types:

- Normal buttons (for example to dismiss a dialog) are given the class name \`regular\`.
- Default buttons are given the class name \`default\` in addition to \`regular\`. Usually such
  buttons are are triggerd by pressing the 'Enter' key regardless of where the current focus is.
- Buttons that trigger a destructive action (like deleting data) are given the class name \`warn\`
  in addition to \`regular\`. \`warn\` can't be used together with \`default\`, doing so may lead to
  a confusing styling.

### Code example (styled default buttons)

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Button } from "@vanilla-ts/dom";

const btnSkip = new Button("Skip").addClass("regular", "warn");
const btnCancel = new Button("Cancel").addClass("regular");
const btnOk = new Button("OK").addClass("regular", "default");

new VTS_App(document.body).append(btnSkip, btnCancel, btnOk);
\`\`\`
`;

const exampleFactory = `
### Component factory

Because always adding class names manually is not very convenient, it's recommended to use the
\`ButtonFactory\` from \`@vanilla-ts/dom/Button\`, for example:


\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { ButtonFactory } from "@vanilla-ts/dom";

const bf = new ButtonFactory();

const btnSkip = bf.buttonWarn("Skip");
const btnCancel = bf.buttonRegular("Cancel");
const btnOk = bf.buttonDefault("OK");

new VTS_App(document.body).append(btnSkip, btnCancel, btnOk);
\`\`\`

This way, the correct class names are applied automatically (the result is optically identical to
the previous example). For an advanced usage of component factories see §@core/ComponentFactories§.
`;


export class ButtonEx extends BaseExample {
    constructor() {
        super("Button");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let btnSkip: Button;
        let btnCancel: Button;
        let btnOk: Button;
        this.append(
            this.markdown(intro),
            this.markdown(example),
            this.example([
                new Button("Button")
            ]),
            this.markdown(exampleStyled),
            this.example([
                btnSkip = $.buttonWarn("Skip"),
                new Text("\u2003"),
                btnCancel = $.buttonRegular("Cancel"),
                new Text("\u2003"),
                btnOk = $.buttonDefault("OK"),
            ], [btnSkip, btnCancel, btnOk]),
            this.markdown(exampleFactory)
        );
    }
}
