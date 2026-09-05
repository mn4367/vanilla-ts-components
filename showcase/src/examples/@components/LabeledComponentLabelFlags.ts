import { IElementComponent, Option } from "@vanilla-ts/core";
import { Label, Span } from "@vanilla-ts/dom";
import { LabeledCheckbox } from "../../../../src/LabeledCheckbox.js";
import { LabelAlignment, LabeledComponent, LabelPosition } from "../../../../src/LabeledComponents.js";
import { LabeledSelect } from "../../../../src/LabeledSelect.js";
import { RadioButtonGroup } from "../../../../src/RadioButtonGroup.js";
import { $ } from "../../App.js";

export function labeledComponentLabelFlags(
    lc: (LabeledComponent<Label | Span, IElementComponent<HTMLElement>> | RadioButtonGroup)[],
    includeWideLabel: boolean = true,
    positionValue: "top" | "end" | "bottom" | "start" = "start",
    alignmentValue: "start" | "center" | "end" = "start"
): [LabeledSelect, LabeledSelect, LabeledCheckbox?] {
    let lsPositionCb: LabeledSelect;
    let lsAlignmentCb: LabeledSelect;
    return [
        lsPositionCb = $.labeledSelect(
            "Label position",
            [
                new Option("TOP").value("top"),
                new Option("END").value("end"),
                new Option("BOTTOM").value("bottom"),
                new Option("START").value("start"),
            ],
            undefined,
            positionValue
        )
            .on("change", () => {
                switch (lsPositionCb.Value) {
                    case "top":
                        lc.forEach((e) => e.labelPosition(LabelPosition.TOP));
                        break;
                    case "end":
                        lc.forEach((e) => e.labelPosition(LabelPosition.END));
                        break;
                    case "bottom":
                        lc.forEach((e) => e.labelPosition(LabelPosition.BOTTOM));
                        break;
                    case "start":
                        lc.forEach((e) => e.labelPosition(LabelPosition.START));
                        break;
                    default:
                        break;
                }
            }),
        lsAlignmentCb = $.labeledSelect(
            "Label alignment",
            [
                new Option("START").value("start"),
                new Option("CENTER").value("center"),
                new Option("END").value("end"),
            ],
            undefined,
            alignmentValue
        )
            .on("change", () => {
                switch (lsAlignmentCb.Value) {
                    case "start":
                        lc.forEach((e) => e.labelAlignment(LabelAlignment.START));
                        break;
                    case "center":
                        lc.forEach((e) => e.labelAlignment(LabelAlignment.CENTER));
                        break;
                    case "end":
                        lc.forEach((e) => e.labelAlignment(LabelAlignment.END));
                        break;
                    default:
                        break;
                }
            }),
        includeWideLabel
            ? $.labeledCheckbox("Use wide label with fixed width")
                .on("checked", () => lc.forEach((e) => e.toggleClass("wide-label")))
            : undefined
    ];
}
