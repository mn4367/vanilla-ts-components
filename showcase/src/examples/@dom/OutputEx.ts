import { Div, NumberInput, Output, RangeInput, Text } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<output>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output%.

**Class:** \`@vanilla-ts/dom/Output\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Div, NumberInput, Output, RangeInput, Text } from "@vanilla-ts/dom";

let ri: RangeInput;
let ni: NumberInput;
let output: Output;

function updateOutput() {
    output.text((ri.ValueAsNumber + ni.ValueAsNumber).toString());
}

const example = new Div(
    ri = new RangeInput()
        .id("range-output")
        .value("32"),
    new Text("+"),
    ni = new NumberInput()
        .id("number-output")
        .min("0")
        .max("1000")
        .value("10"),
    new Text("="),
    output = new Output()
        .for("range-output number-output")
        .style("width", "3rem"),
)
    .on("input", updateOutput)
    .style({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "0.5rem"
    })

new VTS_App(document.body).append(example);

\`\`\`
`;


export class OutputEx extends BaseExample {
    constructor() {
        super("Output");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        let ri: RangeInput;
        let ni: NumberInput;
        let output: Output;

        function updateOutput() {
            output.text((ri.ValueAsNumber + ni.ValueAsNumber).toString());
        }

        this.append(
            this.markdown(intro),
            this.example([
                new Div(
                    ri = new RangeInput()
                        .id("range-output")
                        .value("32"),
                    new Text("+"),
                    ni = new NumberInput()
                        .id("number-output")
                        .min("0")
                        .max("1000")
                        .value("10"),
                    new Text("="),
                    output = new Output()
                        .for("range-output number-output")
                        .style("width", "3rem"),
                )
                    .on("input", updateOutput)
                    .style({
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "0.5rem"
                    })
            ]),
            this.markdown(example),
        );
        updateOutput();
    }
}
