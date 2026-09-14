import { Orientation } from "@vanilla-ts/core";
import { Code, Div, P } from "@vanilla-ts/dom";
import { LabeledNumberInput } from "../../../../src/LabeledNumberInput.js";
import { LabeledProgress } from "../../../../src/LabeledProgress.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/Progress§ and a §@dom/Span§ representing a caption for the component. It
represents the progress of a task, such as a download or file transfer. Use a §@dom/Meter§ component
instead to represent a scalar value within a known range.

**Class:** \`@vanilla-ts/components/LabeledProgress\`
`;

const example = `
### Code example

\`\`\`
import { LabelPosition, LabeledProgress } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";

const example = new LabeledProgress(
    "Upload progress",
    100,              // Maximum value
    70,               // Current value; undefined creates an indeterminate progress indicator
    "70 out of 100"   // Fallback content
)
    .addClass("labeled-progress")
    .progress(progress => progress.style("inlineSize", "15rem"));

// The methods of the inner Progress component are also available directly on LabeledProgress.
example.value(80);
// example.indeterminate(true);

new VTS_App(document.body).append(example);
\`\`\`

For easier handling, the labeled progress component forwards the \`ProgressValueEvent\` emitted by
the inner \`Progress\` component; see the corresponding documentation in the \`LabeledProgress\`
class.
`;


export class LabeledProgressEx extends BaseExample {
    #lProgress: LabeledProgress;

    constructor() {
        super("LabeledProgress");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let valueInput: LabeledNumberInput;

        this.#lProgress = $.labeledProgress(
            "Upload progress",
            100,              // Maximum value
            70,               // Current value
            "70 out of 100"   // Fallback content
        )
            .progress(progress => progress.style("inlineSize", "15rem"));
        this.append(
            this.markdown(intro),
            this.example([this.#lProgress]),
            this.markdown("### Configuration"),
            this.properties(
                $.labeledCheckbox("Vertical orientation", undefined, "orientation")
                    .on("checked", (ev) => {
                        this.#lProgress.progress(cb => cb.orientation(ev.$.Checked ? Orientation.VERTICAL : Orientation.HORIZONTAL));
                    }),
                $.labeledNumberInput("Maximum value:", undefined, "100", "", "1", "100")
                    .numberInput(numberInput => numberInput.on("input", () => {
                        this.#lProgress.max(numberInput.ValueAsNumber);
                        valueInput.NumberInput.max(numberInput.Value);
                    })),
                valueInput = $.labeledNumberInput("Current value:", undefined, this.#lProgress.Value.toString(), "", "0", "100")
                    .numberInput(numberInput => numberInput.on("input", () => {
                        this.#lProgress.value(numberInput.ValueAsNumber === 0 ? undefined : numberInput.ValueAsNumber);
                    })),
                new P("Note: a current value of ", new Code("0"), " will set the progress component to an 'indeterminate' state.")
                    .style({
                        marginBlock: "0.5rem 0"
                    }),
            ),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags([this.#lProgress], true, "start", "start"),
                ),
            this.markdown(example),
        );
    }
}
