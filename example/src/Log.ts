import { AnyType, HTMLElementWithChildren, IElementWithChildrenComponent } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";
import { LabeledTextArea } from "../../src/LabeledTextArea.js";
import { _ } from "./App.js";


export class Log extends Div {
    #log: LabeledTextArea;

    constructor() {
        super();
        this
            .addClass("log")
            .append(
                this.#log = _.labeledTextArea("EventBus Log", "", undefined, 100)
                    .addClass("log"),
            );
        this.#log.TextArea
            .addClass("text-selectable")
            .readonly(true)
            .resizable("none")
            .wrap("off");
    }

    public logEvent(name: string, payload?: string, val?: AnyType): void {
        this.#log.value(`${this.#log.Value ? this.#log.Value + "\n" : ""}'${name}' event received with payload '${payload ?? "undefined"}': ${val ?? "undefined"}`);
        this.#log.TextArea.DOM.scrollTop = this.#log.TextArea.DOM.scrollHeight;
    }

    /** @inheritdoc */
    public override onDidMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        super.onDidMount(parent);
        this.#log.TextArea.DOM.scrollTop = this.#log.TextArea.DOM.scrollHeight;
    }
}
