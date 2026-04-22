import { ModifierKeys } from "@vanilla-ts/core";
import { Div, P } from "@vanilla-ts/dom";
import { DLG_RESIZERS_ALL } from "../../src/Dialog.js";
import { msgDlg } from "../../src/StdDialog.js";
import { _ } from "./App.js";
import { EventBus } from "./EventBus.js";
import { APP } from "./index.js";


export class DataAnalysis extends Div {
    constructor() {
        super();
        this
            .addClass("data-analysis")
            .append(
                new P("Data Analysis"),
                _.buttonRegular("Click to start lengthy data analysis operation")
                    .on("click", async () => {
                        EventBus.emit("OpStarted");
                        const title = new P("Data Analysis");
                        await APP.busy();
                        try {
                            await APP.sleep(1500);
                        } finally {
                            APP.idle();
                            await msgDlg("Report has been submitted successfully!", {
                                Title: title,
                                ClassNames: ["analysis-result-dlg"],
                                DlgOptions: {
                                    Movable: true,
                                    MoveHandle: title,
                                    CenteredResize: () => ModifierKeys.Shift,
                                    // Resizers: DlgResizers.W | DlgResizers.E,
                                    Resizers: DLG_RESIZERS_ALL,
                                },
                            });
                        }
                        EventBus.emit("OpFinished");
                    }),
            );
    }
}
