import { ComponentFactory } from "@vanilla-ts/core";
import { Div, Span } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponent, LabelPosition } from "./LabeledComponent.js";


/**
 * Labeled div component.
 */
export class LabeledContainer extends LabeledComponent<Span> {
    protected container: Div;

    /**
     * Builds the labeled div component.
     * @param labelText The text for the label.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelText: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super("div", lblPosition, lblAlignment);
        this.append(
            this.label = new Span(labelText),
            this.container = new Div()
        );
    }

    /**
     * The internal container that holds all children of this container.
     */
    public get Container(): Div {
        return this.container;
    }
}

/**
 * Factory for LabeledContainer components.
 */
export class LabeledContainerFactory<T> extends ComponentFactory<LabeledContainer> {
    /**
     * Create, set up and return LabeledContainer component.
     * @param labelText The label text for the LabeledContainer component.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledContainer component.
     */
    public labeledContainer(labelText: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledContainer {
        return this.setupComponent(new LabeledContainer(labelText, lblPosition, lblAlignment), data);
    }
}
