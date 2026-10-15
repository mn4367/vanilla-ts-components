import { Orientation } from "@vanilla-ts/core";
import { Code, P } from "@vanilla-ts/dom";
import { ButtonGroup, SelectionMode } from "../../../../src/ButtonGroup.js";
import { IconButton } from "../../../../src/IconButton.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
\`ButtonGroup\` is a container for §@dom/Button§s and §@components/IconButton§s components that
manages the selection state (\`Pressed\`) of its child buttons. It supports single and multiple
selection, optionally requiring at least one selected button. A common use case for this component
is the implementation of toolbars or option groups.

The example below uses \`SINGLE_REQUIRED\` for the 'Text alignment' group and \`MULTIPLE\` for the
'Text formatting' group. Both groups are reachable via the 'Tab' key as a single tab stop, the focus
is moved within each group using the arrow keys.

The component emits \`value\` events whenever the selection changes and also \`pressed\` events when
a button is pressed. Programmatic access to the selection state is also available via the \`Values\`
property and the \`values()\` function.

**Class:** \`@vanilla-ts/components/ButtonGroup\`
`;

const example = `
### Code example

\`\`\`
import { ButtonGroup, IconButton, SelectionMode } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Code, P } from "@vanilla-ts/dom";

const alignmentValue = new Code("left");
const formattingValue = new Code("none");
new P(
    "Lorem ipsum ut wisi enim ad minim veniam, quis nostrud exerci ullamcorper "
    + "suscipit ut aliquip ex ea commodo consequat. Duis autem vel eum iriure "
    + "dolor in vulputate velit esse molestie consequat, vel illum dolore eu "
    + "feugiat nulla facilisis et blandit augue duis dolore te."
).style({
    inlineSize: "100%",
    maxInlineSize: "34rem",
    lineHeight: "1.6",
    textAlign: "left"
});

function iconButton(icon: string, label: string, value: string): IconButton {
    const button = new IconButton({ IconStart: icon, Title: label })
        .addClass("icon-button", "regular")
        .attrib("aria-label", label)
        .value(value);
    button.DOM.querySelector(".start")?.setAttribute("aria-hidden", "true");
    return button;
}

const alignment = new ButtonGroup([
    iconButton("format_align_left", "Align left", "left"),
    iconButton("format_align_center", "Center", "center"),
    iconButton("format_align_right", "Align right", "right"),
    iconButton("format_align_justify", "Justify", "justify")
], SelectionMode.SINGLE_REQUIRED)
    .addClass("button-group")
    .attrib("aria-label", "Text alignment")
    .values(["left"])
    .on("value", event => {
        const value = event.$.Value[0] ?? "left";
        preview.style("textAlign", value);
        alignmentValue.text(value);
    });

const formatting = new ButtonGroup([
    iconButton("format_bold", "Bold", "bold"),
    iconButton("format_italic", "Italic", "italic"),
    iconButton("format_underlined", "Underline", "underline")
], SelectionMode.MULTIPLE)
    .addClass("button-group")
    .attrib("aria-label", "Text formatting")
    .on("value", event => {
        const values = event.$.Value;
        preview.style({
            fontWeight: values.includes("bold") ? "bold" : "normal",
            fontStyle: values.includes("italic") ? "italic" : "normal",
            textDecorationLine: values.includes("underline") ? "underline" : "none"
        });
        formattingValue.text(values.join(", ") || "none");
    });

new VTS_App(document.body).append(
    new P("Text alignment: ", alignmentValue),
    alignment,
    new P("Text formatting: ", formattingValue),
    formatting,
    preview
);
\`\`\`
`;

const CSS = `
### CSS

\`\`\`
.button-group,
.vts-button-group {
    .icon-button,
    .vts-icon-button {
        width: 2.5rem;
        height: auto;
        aspect-ratio: 1;
        > .start,
        > .end {
            font-family: "MaterialIconsRounded";
            font-size: 1.8rem;
        }
    }
}
\`\`\`
`;


/** Showcase for exclusive text alignment and independent text formatting buttons. */
export class ButtonGroupEx extends BaseExample {
    constructor() {
        super("ButtonGroup");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const alignmentValue = new Code("left");
        const formattingValue = new Code("none");
        const preview =
            new P(
                "Lorem ipsum ut wisi enim ad minim veniam, quis nostrud exerci ullamcorper "
                + "suscipit ut aliquip ex ea commodo consequat. Duis autem vel eum iriure "
                + "dolor in vulputate velit esse molestie consequat, vel illum dolore eu "
                + "feugiat nulla facilisis et blandit augue duis dolore te."
            )
                .style({
                    inlineSize: "100%",
                    maxInlineSize: "34rem",
                    lineHeight: "1.6",
                    textAlign: "left"
                });

        const alignment = new ButtonGroup([
            this.#iconButton("format_align_left", "Align left", "left"),
            this.#iconButton("format_align_center", "Center", "center"),
            this.#iconButton("format_align_right", "Align right", "right"),
            this.#iconButton("format_align_justify", "Justify", "justify")
        ], SelectionMode.SINGLE_REQUIRED)
            .addClass("button-group")
            .attrib("aria-label", "Text alignment")
            .values(["left"])
            .on("value", event => {
                const value = event.$.Value[0] ?? "left";
                alignmentValue.text(value);
                preview.style("textAlign", value);
            });

        const formatting = new ButtonGroup([
            this.#iconButton("format_bold", "Bold", "bold"),
            this.#iconButton("format_italic", "Italic", "italic"),
            this.#iconButton("format_underlined", "Underline", "underline")
        ], SelectionMode.MULTIPLE)
            .addClass("button-group")
            .attrib("aria-label", "Text formatting")
            .on("value", event => {
                const values = event.$.Value;
                formattingValue.text(values.join(", ") || "none");
                preview.style({
                    fontWeight: values.includes("bold") ? "bold" : "normal",
                    fontStyle: values.includes("italic") ? "italic" : "normal",
                    textDecorationLine: values.includes("underline") ? "underline" : "none"
                });
            });

        this.append(
            this.markdown(intro),
            this.example([
                new P("Text alignment: ", alignmentValue),
                alignment,
                new P("Text formatting: ", formattingValue),
                formatting,
                preview
            ], [alignment, formatting]),
            this.markdown("### Configuration"),
            this.properties(
                $.labeledCheckbox("Vertical text alignment group")
                    .checked(alignment.Orientation === Orientation.VERTICAL || alignment.Orientation === Orientation.ARIA_VERTICAL)
                    .on("checked", event => alignment.orientation(event.$.Checked ? Orientation.VERTICAL : Orientation.HORIZONTAL)),
                $.labeledCheckbox("Vertical text formatting group")
                    .checked(formatting.Orientation === Orientation.VERTICAL || formatting.Orientation === Orientation.ARIA_VERTICAL)
                    .on("checked", event => formatting.orientation(event.$.Checked ? Orientation.VERTICAL : Orientation.HORIZONTAL)),
            ),
            this.markdown(example),
            this.markdown(CSS)
        );
    }

    /**
     * Create an icon-only button using the existing showcase icon-font stylesheet.
     * @param icon The MaterialIconsRounded ligature.
     * @param label The accessible name and tooltip.
     * @param value The selection value.
     * @returns The configured icon button.
     */
    #iconButton(icon: string, label: string, value: string): IconButton {
        const button = new IconButton({ IconStart: icon, Title: label })
            .addClass("icon-button", "regular")
            .attrib("aria-label", label)
            .value(value);
        button.DOM.querySelector(".start")?.setAttribute("aria-hidden", "true");
        return button;
    }
}
