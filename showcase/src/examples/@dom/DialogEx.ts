import { IElementComponent } from "@vanilla-ts/core";
import { Br, Code, Dialog, P, Text } from "@vanilla-ts/dom";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a native dialog DOM element
(%\`<dialog>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog%).
The §@components/Dialog§ class from \`@vanilla-ts/components\` builds upon this class here and adds
a lot of advanced features.

**Class:** \`@vanilla-ts/dom/Dialog\`
`;

const example = `
### Code example

\`\`\`
import { IElementComponent, VTS_App } from "@vanilla-ts/core";
import { Br, Code, Dialog, P } from "@vanilla-ts/dom";

function getDialog(modal: boolean, caller?: IElementComponent<HTMLElement>): Dialog {
    const dlg = new Dialog(
        new P(
            \`This is a \${modal? "modal": "non-modal"} dialog.\`, new Br(),
            modal
                ? "It can be closed by clicking the 'Close' button, by pressing the 'Esc' key"
                : "It can be closed by clicking the 'Close' button", new Br(),
            "or programmatically via the ", new Code("<dlg>.close()"), " function.",
        ),
        new Button("Close")
            .autofocus(true)
            .on("click", () => dlg.close())
    ).on("close", () => caller?.disabled(false));
    return dlg;
}

const nonModalDlg = getDialog(false, btnNonModal);
const modalDlg = getDialog(true, btnModal);

const btnNonModal = new Button("Open a non-modal dialog")
    .on("click", () =>
        nonModalDlg.Open || btnNonModal.disabled(true) && nonModalDlg.show()
    );

const btnModal = new Button("Open a modal dialog")
    .on("click", () =>
        modalDlg.Open
            ? modalDlg.close()
            : btnModal.disabled(true) && modalDlg.showModal()
    );

new VTS_App(document.body).append(btnNonModal, btnModal);
\`\`\`
`;


export class DialogEx extends BaseExample {
    constructor() {
        super("Dialog");
    }

    /** @inheritdoc */
    protected override async buildExample(): Promise<void> {

        function getDialog(modal: boolean, caller?: IElementComponent<HTMLElement>): Dialog {
            const dlg = new Dialog(
                new P(
                    `This is a ${modal ? "modal" : "non-modal"} dialog.`, new Br(),
                    modal
                        ? "It can be closed by clicking the 'Close' button, by pressing the 'Esc' key"
                        : "It can be closed by clicking the 'Close' button", new Br(),
                    "or programmatically via the ", new Code("<dlg>.close()"), " function.",
                ),
                $.buttonRegular("Close")
                    .autofocus(true)
                    .on("click", () => dlg.close())
            ).on("close", () => caller?.disabled(false));
            return dlg;
        }

        const btnNonModal = $.buttonRegular("Open a non-modal dialog")
            .on("click", () =>
                nonModalDlg.Open || btnNonModal.disabled(true) && nonModalDlg.show()
            );

        const btnModal = $.buttonRegular("Open a modal dialog")
            .on("click", () =>
                modalDlg.Open ? modalDlg.close() : btnModal.disabled(true) && modalDlg.showModal()
            );

        const nonModalDlg = getDialog(false, btnNonModal);
        const modalDlg = getDialog(true, btnModal);

        this.append(
            this.markdown(intro),
            this.markdown("### Examples"),
            this.properties(btnNonModal, new Text("\u2003"), btnModal),
            this.markdown(example),
        );
    }
}
