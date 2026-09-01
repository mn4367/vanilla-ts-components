import { Code, Div, P } from "@vanilla-ts/dom";
import { DiscloseEvent, DisclosureContainer, DisclosureContainerAppearance } from "../../../../src/DisclosureContainer.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";

const intro = `
A container component whose content can be disclosed/undisclosed.

**Class:** \`@vanilla-ts/components/DisclosureContainer\`

The \`DisclosureContainer\` component supports the follwoing features:

- Both the header and content areas can contain arbitrary components.
- Several appearance options.
- A (preventable) custom event when the container is disclosed/undisclosed.
- Custom buttons for the disclose/undisclose actions.
- Animations for the disclose/undisclose actions.
- An option to remove/keep content from the DOM when disclosed/undisclosed.

All features are configurable at runtime on an already existing instance.
`;

const example = `
### Notes
- If \`WeakUndisclosed\` is \`true\` the inner content container will keep its content in the DOM
  when it is undisclosed, otherwise the content will be removed from the DOM.
- Setting \`Animatable\` to \`true\` will automatically set the property \`WeakUndisclosed\` to
  \`true\` as well!
- The custom disclose button appearance in the example is not a builtin design. It is achieved by
  adding/removing a CSS class that triggers a corresponding style on the disclose button and by
  setting the \`DisclosedButtonOptions\` / \`UndisclosedButtonOptions\` properties which configure
  the contained §@components/IconButton§ component.

### Code example

\`\`\`
import { DisclosureContainer } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Code, Div, P } from "@vanilla-ts/dom";

const example = new DisclosureContainer(
    ["Some ", new Code("Lorem ipsum"), " text."],
    new Div().style({ "padding": "0.5rem" }).append(
        new P("Lorem ipsum ut wisi enim ad minim veniam, quis ..."),
        new P("Nam liber tempor cum nobis id quod mazim placerat ...")
    )
)
    .addClass("disclosure-container")
    .animatable(true)
    .style({
        "padding": "0.5rem",
        "border": "1px solid hsl(0 0% 89.8%)",
        "borderRadius": "6px",
        "backgroundColor": "hsl(0, 0%, 98%)",
    });

new VTS_App(document.body).append(example);
\`\`\`

\`\`\`
// Enable/disable custom design
if (someCondition) {
    example.disclosureButton(c => c.addClass("custom-design"))
        .disclosedButtonOptions({ Title: "Collapse" })
        .undisclosedButtonOptions({ Title: "Expand" });
} else {
    example.disclosureButton(c => c.removeClass("custom-design"))
        .disclosedButtonOptions({ Title: null })
        .undisclosedButtonOptions({ Title: null });
}
\`\`\`
`;


const css = `
\`\`\`
/* Custom design CSS */
> .disclosure-container {
    > .header-container > .disclose.icon-button.custom-design {
        width: 1.4rem;
        height: 1.4rem;
        border-radius: 50%;
        font-family: monospace;
        font-size: 1rem;
        font-weight: bolder;
        color: white;
        background: hsl(216, 92%, 63%);
        clip-path: none;
        > .phrase {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 0;
        }
        &:hover {
            filter: brightness(0.9);
        }
    }
    &.disabled > .header-container > .disclose.icon-button.custom-design {
        background: hsl(216, 92%, 68%);
    }
    &.horizontal > .header-container > .disclose.icon-button.custom-design > .phrase {
        transform: rotate(90deg);
    }
}
\`\`\`
`;


export class DisclosureContainerEx extends BaseExample {
    #dcContainer: Div;
    #dc: DisclosureContainer;
    #evCount = 0;

    constructor() {
        super("DisclosureContainer");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.#dcContainer = new Div()
            .addClass("dc-container")
            .append(
                this.#dc = $.disclosureContainer(
                    ["Some ", new Code("Lorem ipsum"), " text."],
                    new Div().style({ "padding": "var(--base-size-half)" }).append(
                        new P("Lorem ipsum ut wisi enim ad minim veniam, quis nostrud exerci ullamcorper suscipit ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis et blandit augue duis dolore te feugait nulla facilisi."),
                        new P("Nam liber tempor cum nobis id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, sed diam tincidunt ut magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.")
                    )
                )
                    .animatable(true)
                    .on("disclose", (ev) => {
                        queueMicrotask(() => {
                            logMessage.phrase(`${++this.#evCount} '${ev.type}' event(s) received: Container is disclosed => ${this.#dc.Disclosed}.`);
                        });
                    })
                    .style({
                        "padding": "var(--base-size-half)",
                        "border": "var(--1px) solid var(--border-color)",
                        "borderRadius": "var(--border-radius-normal)",
                        "backgroundColor": "var(--black-2)",
                    }),
                new Div().addClass("spacer")
            );
        const logMessage = new P(`${this.#evCount} 'disclose' event(s) received: Container is disclosed => ${this.#dc.Disclosed}.`)
            .style({
                "minWidth": "35rem",
                "marginBlockStart": "1rem",
                "fontFamily": "monospace",
                "textAlign": "center",
            });
        this
            .append(
                this.markdown(intro),
                this.example([this.#dcContainer, logMessage], [this.#dc]),
                this.markdown("### Configuration"),
                this.properties(this.#getConfiguration()),
                this.markdown(example),
                this.markdown(css)
            );
    }

    #handleDisclose(ev: DiscloseEvent): void {
        ev.preventDefault();
    }

    #getConfiguration(): Div {
        const div = new Div();
        const appearance = $.labeledSelect("Appearance", [
            { Text: "TOP_START", Value: "top-start" },
            { Text: "TOP_END", Value: "top-end" },
            { Text: "END_TOP", Value: "end-top" },
            { Text: "END_BOTTOM", Value: "end-bottom" },
            { Text: "BOTTOM_END", Value: "bottom-end" },
            { Text: "BOTTOM_START", Value: "bottom-start" },
            { Text: "START_BOTTOM", Value: "start-bottom" },
            { Text: "START_TOP", Value: "start-top" },
        ]).on("change", () => {
            switch (appearance.Value) {
                case "top-start":
                    this.#dc.Appearance = DisclosureContainerAppearance.TOP_START;
                    break;
                case "top-end":
                    this.#dc.Appearance = DisclosureContainerAppearance.TOP_END;
                    break;
                case "end-top":
                    this.#dc.Appearance = DisclosureContainerAppearance.END_TOP;
                    break;
                case "end-bottom":
                    this.#dc.Appearance = DisclosureContainerAppearance.END_BOTTOM;
                    break;
                case "bottom-end":
                    this.#dc.Appearance = DisclosureContainerAppearance.BOTTOM_END;
                    break;
                case "bottom-start":
                    this.#dc.Appearance = DisclosureContainerAppearance.BOTTOM_START;
                    break;
                case "start-bottom":
                    this.#dc.Appearance = DisclosureContainerAppearance.START_BOTTOM;
                    break;
                case "start-top":
                    this.#dc.Appearance = DisclosureContainerAppearance.START_TOP;
                    break;
                default:
                    break;
            }
        });
        const weakUndisclosed = $.labeledCheckbox("WeakUndisclosed")
            .on("checked", (ev) => {
                animatable.disabled(!ev.$.Checked);
                ev.$.Checked || animatable.checked(false);
                this.#dc.WeakUndisclosed = ev.$.Checked;
            }).checked(true);
        const animatable = $.labeledCheckbox("Animatable")
            .on("checked", (ev) => {
                ev.$.Checked && (weakUndisclosed.Checked = true);
                this.#dc.Animatable = ev.$.Checked;
            }).checked(true);
        const events = $.labeledCheckbox("Prevent disclose/undisclose events")
            .on("checked", (ev) => {
                ev.$.Checked
                    ? this.#dc.on("disclose", this.#handleDisclose)
                    : this.#dc.off("disclose", this.#handleDisclose);
            }).checked(false);
        const btns = $.labeledCheckbox("Set custom disclose button appearance")
            .on("checked", (ev) => {
                if (ev.$.Checked) {
                    this.#dc
                        .disclosureButton(c => c.addClass("custom-design"))
                        .disclosedButtonOptions({ Title: "Collapse" })
                        .undisclosedButtonOptions({ Title: "Expand" });
                } else {
                    this.#dc
                        .disclosureButton(c => c.removeClass("custom-design"))
                        .disclosedButtonOptions({ Title: null })
                        .undisclosedButtonOptions({ Title: null });
                }
            });
        div.append(appearance, weakUndisclosed, animatable, events, btns);
        return div;
    }

}
