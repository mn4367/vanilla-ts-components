import { Button, Code, LiUl, P, Strong, Ul } from "@vanilla-ts/dom";
import { MenuHeading, MenuItem, MenuSeparator, PopupMenu } from "../../../../src/Menu.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A popup menu for presenting a temporary list of commands. A \`PopupMenu\` can contain selectable
\`MenuItem\` components, non-selectable \`MenuHeading\` components and \`MenuSeparator\` components.
Menu items can include content and a hint (usually a keyboard shortcut), hold application-specific
data, be checked or disabled.

The component emits a preventable \`show\` event before it opens, a preventable \`select\` event when
a menu item is activated and a non-preventable \`hide\` event after it closes. It supports pointer
interaction as well as keyboard navigation with the arrow, *Home*, *End*, *Tab*, *Enter*, *Space*
and *Escape* keys.

**Classes:** \`@vanilla-ts/components/PopupMenu\`, \`@vanilla-ts/components/MenuItem\`,
\`@vanilla-ts/components/MenuHeading\`, \`@vanilla-ts/components/MenuSeparator\`
`;

const example = `
### Code example

\`\`\`
import {
    MenuHeading,
    MenuItem,
    MenuSeparator,
    PopupMenu
} from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Button, Code, LiUl, P, Strong, Ul } from "@vanilla-ts/dom";

const eventLog = new Ul(new LiUl("No menu event received yet."))
    .style({ inlineSize: "30rem" });
let eventReceived = false;

function logEvent(name: string, message: string = ""): void {
    if (!eventReceived) {
        eventLog.clear();
        eventReceived = true;
    }
    eventLog.append(new LiUl(new Code(name), message));
}

const autosaveItem = new MenuItem("Autosave", undefined, true, "autosave");
const menu = new PopupMenu(
    new MenuHeading("Document"),
    new MenuItem("New document", "Ctrl+N", false, "new"),
    new MenuItem([new Strong("Save"), " document"], "Ctrl+S", false, "save"),
    new MenuSeparator(),
    autosaveItem,
    new MenuItem("Print", "Ctrl+P", false, "print").disabled(true)
)
    .addClass("popup-menu")
    .on("show", () => logEvent("PopupMenuShowEvent", " received."))
    .on("select", event => {
        const item = event.$.MenuItem;
        const itemData = item.MenuItemData;
        const data = typeof itemData === "object"
            ? JSON.stringify(itemData)
            : String(itemData ?? "No data");
        if (item === autosaveItem) {
            item.checked(!item.Checked);
            event.preventDefault(); // Keep the menu open.
        }
        logEvent("PopupMenuItemSelectEvent", \` received for "\${data}".\`);
    })
    .on("hide", () => logEvent("PopupMenuHideEvent", " received."));

const showMenuButton = new Button("Show menu")
    .addClass("regular")
    .style({ inlineSize: "8rem" })
    .on("click", () => {
        const rect = showMenuButton.DOM.getBoundingClientRect();
        menu.show(new DOMPoint(
            window.scrollX + rect.left,
            window.scrollY + rect.bottom
        ));
    });

new VTS_App(document.body).append(
    showMenuButton,
    new P("Received events:"),
    eventLog,
    new Button("Clear log")
        .addClass("regular")
        .style({ inlineSize: "8rem" })
        .on("click", () => {
            eventLog
                .clear()
                .append(new LiUl("No menu event received yet."));
            eventReceived = false;
        })
);
\`\`\`
`;


export class ComponentMenuEx extends BaseExample {
    #menu: PopupMenu;

    constructor() {
        super("Menu");
    }

    /** @inheritdoc */
    public override onBeforeUnmount(): void {
        this.#menu.DOM.isConnected && this.#menu.hide();
        super.onBeforeUnmount();
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const eventLog = new Ul(new LiUl("No menu event received yet."))
            .style({ inlineSize: "30rem" });
        let eventReceived = false;
        const logEvent = (name: string, message: string = ""): void => {
            if (!eventReceived) {
                eventLog.clear();
                eventReceived = true;
            }
            eventLog.append(new LiUl(new Code(name), message));
        };

        const autosaveItem = new MenuItem("Autosave", undefined, true, "autosave");
        this.#menu = new PopupMenu(
            new MenuHeading("Document"),
            new MenuItem("New document", "Ctrl+N", false, "new"),
            new MenuItem([new Strong("Save"), " document"], "Ctrl+S", false, "save"),
            new MenuSeparator(),
            autosaveItem,
            new MenuItem("Print", "Ctrl+P", false, "print").disabled(true)
        )
            .addClass("popup-menu")
            .on("show", () => logEvent("PopupMenuShowEvent", " received."))
            .on("select", event => {
                const item = event.$.MenuItem;
                const itemData = item.MenuItemData;
                const data = typeof itemData === "object"
                    ? JSON.stringify(itemData)
                    : String(itemData ?? "No data");

                if (item === autosaveItem) {
                    item.checked(!item.Checked);
                    event.preventDefault();
                }
                logEvent("PopupMenuItemSelectEvent", ` received for "${data}".`);
            })
            .on("hide", () => logEvent("PopupMenuHideEvent", " received."));

        let showMenuButton: Button;
        this.append(
            this.markdown(intro),
            this.example([
                showMenuButton = $.buttonRegular("Show menu")
                    .style({ inlineSize: "8rem" })
                    .on("click", () => {
                        const rect = showMenuButton.DOM.getBoundingClientRect();
                        this.#menu.show(new DOMPoint(
                            window.scrollX + rect.left,
                            window.scrollY + rect.bottom
                        ));
                    }),
                new P("Received events:")
                    .style("marginBlockEnd", "0.25rem"),
                eventLog
                    .style("marginBlockStart", "0"),
                new Button("Clear log")
                    .addClass("regular")
                    .style({ inlineSize: "8rem" })
                    .on("click", () => {
                        eventLog
                            .clear()
                            .append(new LiUl("No menu event received yet."));
                        eventReceived = false;
                    })
            ]),
            this.markdown(example)
        );
    }
}
