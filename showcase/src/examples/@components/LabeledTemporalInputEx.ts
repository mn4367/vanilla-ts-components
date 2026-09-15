import { Code, Div, Option, P, Span, TemporalType, Text } from "@vanilla-ts/dom";
import { LabelPosition } from "../../../../src/LabeledComponents.js";
import { LabeledSelect } from "../../../../src/LabeledSelect.js";
import { LabeledTemporalInput } from "../../../../src/LabeledTemporalInput.js";
import { $ } from "../../App.js";
import { BaseExample } from "../BaseExample.js";
import { labeledComponentLabelFlags } from "./LabeledComponentLabelFlags.js";


const intro = `
A component with a §@dom/TemporalInput§ and a §@dom/Label§ representing a caption for the component.
The label is automatically associated with the temporal input through its \`for\` and \`id\`
attributes. The inner input can represent a date, time, local date and time, month or week, depending
on the supplied \`TemporalType\`.

Please note that the availability and appearance of temporal input types and their pickers may vary
across browser engines and platforms.

**Class:** \`@vanilla-ts/components/LabeledTemporalInput\`
`;

interface TemporalInputConfiguration {
    type: string;
    label: string;
    max: string;
    min: string;
    step: string;
    stepDescription: string;
    value: string;
}

const now = new Date();
const currentLocalDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
const currentLocalTimeWithSeconds = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(11, 19);

const temporalInputConfigurations: Record<TemporalType, TemporalInputConfiguration> = {
    [TemporalType.Date]: {
        type: "TemporalType.Date",
        label: "Select an appointment date",
        min: "2027-01-01",
        max: "2027-12-31",
        step: "1",
        stepDescription: "one day",
        value: "2027-09-15"
    },
    [TemporalType.Time]: {
        type: "TemporalType.Time",
        label: "Desired time of delivery",
        min: "08:00",
        max: "18:00",
        step: "60",
        stepDescription: "one minute",
        value: "16:30"
    },
    [TemporalType.TimeSeconds]: {
        type: "TemporalType.TimeSeconds",
        label: "Ticket opened today at",
        min: "00:00:00",
        max: "23:59:59",
        step: "1",
        stepDescription: "one second",
        value: currentLocalTimeWithSeconds
    },
    [TemporalType.DateTime]: {
        type: "TemporalType.DateTime",
        label: "Date and time of birth",
        min: "1900-01-01T00:00",
        max: currentLocalDateTime,
        step: "60",
        stepDescription: "one minute",
        value: currentLocalDateTime
    },
    [TemporalType.DateTimeSeconds]: {
        type: "TemporalType.DateTimeSeconds",
        label: "Planned date/time of rocket launch",
        min: "2027-04-01T08:00:00",
        max: "2027-05-31T23:59:00",
        step: "1",
        stepDescription: "one second",
        value: "2027-04-01T14:30:15"
    },
    [TemporalType.Week]: {
        type: "TemporalType.Week",
        label: "Expected week of commissioning",
        min: "2027-W01",
        max: "2027-W52",
        step: "1",
        stepDescription: "one week",
        value: "2027-W38"
    },
    [TemporalType.Month]: {
        type: "TemporalType.Month",
        label: "Best before",
        min: "2027-01",
        max: "2035-12",
        step: "1",
        stepDescription: "one month",
        value: "2028-09"
    }
};

const initialType = TemporalType.DateTime;
const initialConfig = temporalInputConfigurations[initialType];

const example = `
### Code example

\`\`\`
import { LabelPosition, LabeledTemporalInput } from "@vanilla-ts/components";
import { VTS_App } from "@vanilla-ts/core";
import { TemporalType } from "@vanilla-ts/dom";

const example = new LabeledTemporalInput(
    "${initialConfig.label}",
    ${initialConfig.type},
    // id (auto-generated if not provided)
    undefined,
    // value (initial value)
    "${initialConfig.value}",
    // name (form name)
    "temporal-input"
)
    .addClass("labeled-temporal-input")
    .temporalInput(temporalInput => temporalInput
        .min("${initialConfig.min}")
        .max("${initialConfig.max}")
        .step("${initialConfig.step}") // One minute steps
    )
    .labelPosition(LabelPosition.TOP);

new VTS_App(document.body).append(example);
\`\`\`
`;


export class LabeledTemporalInputEx extends BaseExample {
    #lTemporalInput: LabeledTemporalInput;

    constructor() {
        super("LabeledTemporalInput");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let stepGranularity: Span;
        let temporalTypeSelect: LabeledSelect;
        let value: Code;

        this.#lTemporalInput = $.labeledTemporalInput(
            initialConfig.label,
            initialType,
            undefined,
            initialConfig.value,
            "temporal-input"
        )
            .temporalInput(temporalInput => temporalInput
                .min(initialConfig.min)
                .max(initialConfig.max)
                .step(initialConfig.step)
            )
            .labelPosition(LabelPosition.TOP)
            .on("input", () => value.text(this.#lTemporalInput.Value));
        const labeledTemporalInputs = [this.#lTemporalInput];
        this.append(
            this.markdown(intro),
            this.example([
                this.#lTemporalInput,
                new P("Current value: ", value = new Code(this.#lTemporalInput.Value))
                    .style({
                        marginBlock: "0.5rem 0",
                        width: "20rem"
                    })
            ]),
            this.markdown("### Configuration"),
            this.properties(
                temporalTypeSelect = $.labeledSelect("Temporal type", [
                    new Option("TemporalType.Date").value(TemporalType.Date.toString()),
                    new Option("TemporalType.Time").value(TemporalType.Time.toString()),
                    new Option("TemporalType.TimeSeconds")
                        .value(TemporalType.TimeSeconds.toString()),
                    new Option("TemporalType.DateTime").value(TemporalType.DateTime.toString()),
                    new Option("TemporalType.DateTimeSeconds")
                        .value(TemporalType.DateTimeSeconds.toString()),
                    new Option("TemporalType.Week").value(TemporalType.Week.toString()),
                    new Option("TemporalType.Month").value(TemporalType.Month.toString())
                ])
                    .style("marginBlockEnd", "0.5rem")
                    .component(cb => cb.style("inlineSize", "19rem"))
                    .value(initialType.toString())
                    .on("change", () => {
                        // The Select component stores its option values as strings.
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                        const temporalType = Number(temporalTypeSelect.Value) as TemporalType;
                        const configuration = temporalInputConfigurations[temporalType];
                        const previousTemporalInput = this.#lTemporalInput;
                        const parent = previousTemporalInput.Parent;
                        if (!parent) {
                            return;
                        }
                        const index = parent.Children.indexOf(previousTemporalInput);
                        const replacement = $.labeledTemporalInput(
                            configuration.label,
                            temporalType,
                            previousTemporalInput.TemporalInput.ID,
                            configuration.value,
                            previousTemporalInput.Name
                        )
                            .temporalInput(temporalInput => temporalInput
                                .min(configuration.min)
                                .max(configuration.max)
                                .step(configuration.step)
                            )
                            .labelPosition(previousTemporalInput.LabelPosition)
                            .labelAlignment(previousTemporalInput.LabelAlignment)
                            .clazz(previousTemporalInput.Clazz)
                            .dir(previousTemporalInput.Dir)
                            .disabled(previousTemporalInput.Disabled)
                            .parentDisabled(previousTemporalInput.ParentDisabled)
                            .on("input", () => value.text(replacement.Value));

                        parent.remove(previousTemporalInput).insert(index, replacement);
                        this.#lTemporalInput = replacement;
                        labeledTemporalInputs[0] = replacement;
                        previousTemporalInput.dispose();
                        value.text(configuration.value);
                        stepGranularity.text(`\u2003(Step granularity is ${configuration.stepDescription})`);
                    }),
                new Span("Change value")
                    .style({
                        display: "inline-block",
                        inlineSize: "10rem"
                    }),
                $.buttonRegular("Step down")
                    .on("click", () => {
                        this.#lTemporalInput.stepDown();
                        value.text(this.#lTemporalInput.Value);
                    }),
                new Text("\u2002"),
                $.buttonRegular("Step up")
                    .on("click", () => {
                        this.#lTemporalInput.stepUp();
                        value.text(this.#lTemporalInput.Value);
                    }),
                stepGranularity = new Span(`\u2003(Step granularity is ${initialConfig.stepDescription})`)
            ),
            this.markdown("### Label position and label alignment"),
            new Div()
                .addClass("example-properties")
                .append(
                    ...labeledComponentLabelFlags(labeledTemporalInputs, true, "start", "start"),
                ),
            this.markdown(example),
        );
    }
}
