import { Code, Div, Option, P } from "@vanilla-ts/dom";
import { LabeledSelect } from "../../../../src/LabeledSelect.js";
import { ISteppable, Stepper, StepperAppearance } from "../../../../src/Stepper.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that provides controls for navigating through an object that implements \`ISteppable\`.
It can move to the first, previous, next or last entry and optionally move backwards or forwards by
a page. The availability of its buttons is automatically synchronized with the current index and
number of entries.

The preventable \`step\` event is emitted before the index changes; the \`stepped\` event reports a
completed change.

**Class:** \`@vanilla-ts/components/Stepper\`
`;

const example = `
### Code example

\`\`\`
import { ISteppable, Stepper } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { Code, Div, P } from "@vanilla-ts/dom";

const entries = [
    "Mercury", "Venus", "Earth", "Mars", "Jupiter",
    "Saturn", "Uranus", "Neptune", "Ceres", "Pluto"
];
let selectedIndex = 0;
let steppedEventCount = 0;

const selectedEntry = new P(entries[selectedIndex]);
const position = new Code(\`\${selectedIndex + 1} / \${entries.length}\`)
    .style({ inlineSize: "5rem", textAlign: "center" });
const status = new P("No ", new Code("SteppedEvent"), " received yet.");
const steppable: ISteppable = {
    Count: entries.length,
    get Index() {
        return selectedIndex;
    },
    set Index(index: number) {
        selectedIndex = index;
        selectedEntry.text(entries[index]);
    },
    PageSize: 3
};

const example = new Stepper(steppable, {
    Separator: position,
    FirstBtnOptions: { Title: "First entry" },
    PageBackwardBtnOptions: { Title: "Previous page" },
    BackwardBtnOptions: { Title: "Previous entry" },
    ForwardBtnOptions: { Title: "Next entry" },
    PageForwardBtnOptions: { Title: "Next page" },
    LastBtnOptions: { Title: "Last entry" }
})
    .addClass("stepper")
    .on("stepped", event => {
        position.text(\`\${steppable.Index + 1} / \${steppable.Count}\`);
        status.phrase(
            new Code("SteppedEvent"),
            \` received (\${++steppedEventCount}): Index = \${event.$.Index}.\`
        );
    });

new VTS_App(document.body).append(
    new Div(selectedEntry, example, status)
        .style({ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" })
);
\`\`\`
`;


export class StepperEx extends BaseExample {
    #stepper: Stepper;

    constructor() {
        super("Stepper");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let appearanceSelect: LabeledSelect;
        const entries = [
            "Mercury", "Venus", "Earth", "Mars", "Jupiter",
            "Saturn", "Uranus", "Neptune", "Ceres", "Pluto"
        ];
        let selectedIndex = 0;
        let steppedEventCount = 0;
        const selectedEntry = new P(entries[selectedIndex]);
        const position = new Code(`${selectedIndex + 1} / ${entries.length}`)
            .style({ inlineSize: "5rem", textAlign: "center" });
        const status = new P("No ", new Code("SteppedEvent"), " received yet.");
        const steppable: ISteppable = {
            Count: entries.length,
            get Index() {
                return selectedIndex;
            },
            set Index(index: number) {
                selectedIndex = index;
                selectedEntry.text(entries[index]);
            },
            PageSize: 3
        };

        this.#stepper = $.stepper(steppable, {
            Separator: position,
            FirstBtnOptions: { Title: "First entry" },
            PageBackwardBtnOptions: { Title: "Previous page" },
            BackwardBtnOptions: { Title: "Previous entry" },
            ForwardBtnOptions: { Title: "Next entry" },
            PageForwardBtnOptions: { Title: "Next page" },
            LastBtnOptions: { Title: "Last entry" }
        })
            .on("stepped", event => {
                position.text(`${steppable.Index + 1} / ${steppable.Count}`);
                status.phrase(
                    new Code("SteppedEvent"),
                    ` received (${++steppedEventCount}): Index = ${event.$.Index}.`
                );
            });

        this.append(
            this.markdown(intro),
            this.example([
                new Div(selectedEntry, this.#stepper, status)
                    .style({
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1rem"
                    })
            ]),
            this.markdown("### Configuration"),
            this.properties(
                appearanceSelect = $.labeledSelect("Appearance", [
                    new Option("HORIZONTAL").value("horizontal"),
                    new Option("HORIZONTAL_ALT").value("horizontal-alt"),
                    new Option("VERTICAL").value("vertical"),
                    new Option("VERTICAL_ALT").value("vertical-alt")
                ])
                    .value("horizontal")
                    .on("change", () => {
                        switch (appearanceSelect.Value) {
                            case "horizontal-alt":
                                this.#stepper.appearance(StepperAppearance.HORIZONTAL_ALT);
                                break;
                            case "vertical":
                                this.#stepper.appearance(StepperAppearance.VERTICAL);
                                break;
                            case "vertical-alt":
                                this.#stepper.appearance(StepperAppearance.VERTICAL_ALT);
                                break;
                            default:
                                this.#stepper.appearance(StepperAppearance.HORIZONTAL);
                        }
                    }),
                $.labeledCheckbox("Hide unavailable buttons")
                    .on("checked", event => this.#stepper.options({
                        HideButtons: event.$.Checked
                    })),
                $.labeledCheckbox("Show page buttons")
                    .checked(true)
                    .on("checked", event => this.#stepper.options({
                        PageBackward: event.$.Checked,
                        PageForward: event.$.Checked
                    })),
                $.labeledCheckbox("Continuous stepping")
                    .on("checked", event => this.#stepper.options({
                        PageBackwardContinuous: event.$.Checked,
                        BackwardContinuous: event.$.Checked,
                        ForwardContinuous: event.$.Checked,
                        PageForwardContinuous: event.$.Checked
                    }))
            ),
            this.markdown(example)
        );
    }
}
