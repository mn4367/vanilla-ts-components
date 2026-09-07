import { Code, Div, TemporalInput, TemporalType } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates various native date/time related DOM input elements:

- %\`<input type="date">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date%
- %\`<input type="datetime-local">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local%
- %\`<input type="time">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time%
- %\`<input type="month">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month%
- %\`<input type="week">\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week%

Please note that the availability of these input types may vary across different browser engines and
platforms. For example, the \`<input type="week">\` is not supported in the desktop versions of
Safari and Firefox. The look and feel of the pickers (if available at all) is also different across
browsers and platforms.

This component is also available as a §@components/LabeledTemporalInput§.

**Class:** \`@vanilla-ts/dom/TemporalInput\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Code, Div, TemporalInput, TemporalType } from "@vanilla-ts/dom";

function getTemporalInput(type: TemporalType): Div {
    let typeName: string;
    let tt: TemporalType;
    switch (type) {
        case TemporalType.DateTimeSeconds:
            typeName = "DateTimeSeconds";
            tt = TemporalType.DateTimeSeconds;
            break;
        case TemporalType.DateTime:
            typeName = "DateTime";
            tt = TemporalType.DateTime;
            break;
        case TemporalType.TimeSeconds:
            typeName = "TimeSeconds";
            tt = TemporalType.TimeSeconds;
            break;
        case TemporalType.Time:
            typeName = "Time";
            tt = TemporalType.Time;
            break;
        case TemporalType.Month:
            typeName = "Month";
            tt = TemporalType.Month;
            break;
        case TemporalType.Week:
            typeName = "Week";
            tt = TemporalType.Week;
            break;
        default:
            typeName = "Date";
            tt = TemporalType.Date;
            break;
    }
    return new Div(
        // The CSS for \`.temporal-input-type\` could be something like
        // \`display: inline-block; width: 20rem;\`
        new Code("TemporalType." + typeName).addClass("temporal-input-type"),
        new TemporalInput(tt)
    );
}

const example = new Div(
    ...[
        TemporalType.DateTimeSeconds, TemporalType.DateTime,
        TemporalType.Date, TemporalType.TimeSeconds,
        TemporalType.Time, TemporalType.Month, TemporalType.Week
    ].map((e) => getTemporalInput(e))
)
    .style({ display: "flex", flexDirection: "column", gap: "0.5rem" });

new VTS_App(document.body).append(example);
\`\`\`
`;


export class TemporalInputEx extends BaseExample {
    constructor() {
        super("TemporalInput");
    }

    private getTemporalInput(type: TemporalType): Div {
        let typeName: string;
        let tt: TemporalType;
        switch (type) {
            case TemporalType.DateTimeSeconds:
                typeName = "DateTimeSeconds";
                tt = TemporalType.DateTimeSeconds;
                break;
            case TemporalType.DateTime:
                typeName = "DateTime";
                tt = TemporalType.DateTime;
                break;
            case TemporalType.TimeSeconds:
                typeName = "TimeSeconds";
                tt = TemporalType.TimeSeconds;
                break;
            case TemporalType.Time:
                typeName = "Time";
                tt = TemporalType.Time;
                break;
            case TemporalType.Month:
                typeName = "Month";
                tt = TemporalType.Month;
                break;
            case TemporalType.Week:
                typeName = "Week";
                tt = TemporalType.Week;
                break;
            default:
                typeName = "Date";
                tt = TemporalType.Date;
                break;
        }
        return new Div(
            new Code("TemporalType." + typeName).addClass("temporal-input-type"),
            new TemporalInput(tt)
        );
    }

    /** @inheritdoc */
    protected override buildExample(): void {

        this.append(
            this.markdown(intro),
            this.example(
                [
                    TemporalType.DateTimeSeconds, TemporalType.DateTime, TemporalType.Date,
                    TemporalType.TimeSeconds, TemporalType.Time, TemporalType.Month,
                    TemporalType.Week
                ].map((e) => this.getTemporalInput(e))
            ),
            this.markdown(example),
        );
    }
}
