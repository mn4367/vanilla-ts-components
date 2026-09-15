import { Div } from "@vanilla-ts/dom";
import { LabeledCheckbox } from "../../../../src/LabeledCheckbox.js";
import { LabeledTextArea } from "../../../../src/LabeledTextArea.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/TextArea§ and a §@dom/Label§ representing a caption for the component. The
label is automatically associated with the textarea through its \`for\` and \`id\` attributes.

**Class:** \`@vanilla-ts/components/LabeledTextArea\`
`;

const example = `
### Code example

\`\`\`
import { LabeledTextArea } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledTextArea(
    "Message",
    undefined, // initial text
    6,         // number of visible text lines
    50,        // visible width in average character widths
    undefined, // id (auto-generated if not provided)
    "message"  // name (form name)
)
    .addClass("labeled-text-area")
    .textArea(textArea => textArea
        .placeholder("Enter your message here")
        .resizable("vertical")
    );

new VTS_App(document.body).append(example);
\`\`\`
`;


export class LabeledTextAreaEx extends BaseExample {
    #lTextArea: LabeledTextArea;

    constructor() {
        super("LabeledTextArea");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let allowResizing: LabeledCheckbox;
        let verticalResizing: LabeledCheckbox;
        let horizontalResizing: LabeledCheckbox;

        const updateResizable = (): void => {
            if (!allowResizing.Checked || (!verticalResizing.Checked && !horizontalResizing.Checked)) {
                this.#lTextArea.TextArea.resizable("none");
            } else if (verticalResizing.Checked && horizontalResizing.Checked) {
                this.#lTextArea.TextArea.resizable("both");
            } else {
                this.#lTextArea.TextArea.resizable(verticalResizing.Checked ? "vertical" : "horizontal");
            }
        };

        this.#lTextArea = $.labeledTextArea(
            "Message",
            undefined, // initial text
            6,         // number of visible text lines
            50,        // visible width in average character widths
            undefined, // id (auto-generated if not provided)
            "message"  // name (form name)
        )
            .textArea(textArea => textArea
                .placeholder("Enter your message here")
                .resizable("vertical")
            );
        this.append(
            this.markdown(intro),
            this.example([this.#lTextArea]),
            this.markdown("### Configuration"),
            this.properties(
                $.labeledNumberInput("Visible rows:", undefined, this.#lTextArea.TextArea.Rows.toString(), "", "1", "20")
                    .numberInput(numberInput => numberInput.on("input", () => {
                        this.#lTextArea.TextArea.rows(numberInput.ValueAsNumber);
                    })),
                $.labeledNumberInput("Visible columns:", undefined, this.#lTextArea.TextArea.Cols.toString(), "", "1", "100")
                    .numberInput(numberInput => numberInput.on("input", () => {
                        this.#lTextArea.TextArea.cols(numberInput.ValueAsNumber);
                    })),
                allowResizing = $.labeledCheckbox("Allow resizing")
                    .checked(true)
                    .on("checked", event => {
                        verticalResizing.disabled(!event.$.Checked);
                        horizontalResizing.disabled(!event.$.Checked);
                        updateResizable();
                    }),
                new Div()
                    .style("marginInlineStart", "2rem")
                    .append(
                        verticalResizing = $.labeledCheckbox("Vertical")
                            .checked(true)
                            .on("checked", updateResizable),
                        horizontalResizing = $.labeledCheckbox("Horizontal")
                            .on("checked", updateResizable)
                    ),
                $.buttonRegular("Reset resizing")
                    .on("click", () => this.#lTextArea.TextArea.style({
                        width: null,
                        height: null,
                        inlineSize: null,
                        blockSize: null
                    }))
                    .style("marginBlockStart", "0.5rem")
            ),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lTextArea], true, "top", "start"),
                ),
            this.markdown(example),
        );
    }
}
