import { ComponentFactory, Phrase, Phrases } from "@vanilla-ts/core";
import { SearchInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabelPosition } from "./LabeledComponent.js";
import { LabeledInputComponent } from "./LabeledInputComponent.js";


/**
 * Labeled search input component.
 */
export class LabeledSearchInput<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledInputComponent<SearchInput, EventMap> {
    /**
     * Create LabeledSearchInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the search input element.
     * @param value The value of the search input element.
     * @param name The `name` attribute of the search input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the search input element, if `labelAction` is `false`, clicking on the label does nothing.
     */
    constructor(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean) {
        super(labelPhrase, id, lblPosition, lblAlignment, labelAction);
        (this.lblPosition === LabelPosition.START) || (this.lblPosition === LabelPosition.TOP)
            ? this.ui.append(this.component = new SearchInput(id, value, name))
            : this.ui.insert(0, this.component = new SearchInput(id, value, name));
    }

    /**
     * Get SearchInput component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get SearchInput(): SearchInput {
        return this.component;
    }
}

/**
 * Factory for `LabeledSearchInput` components.
 */
export class LabeledSearchInputFactory<T> extends ComponentFactory<LabeledSearchInput> {
    /**
     * Create, set up and return LabeledSearchInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The `id` attribute of the search input element.
     * @param value The value of the search input element.
     * @param name The `name` attribute of the search input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param labelAction Controls the following behavior:
     * - If `id` isn't defined, clicking on the label does nothing.
     * - If `id` is defined: if `labelAction` is `true` or `undefined`, a click on the label focuses
     *   the search input element, if `labelAction` is `false`, clicking on the label does nothing.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledSearchInput component.
     */
    public labeledSearchInput(labelPhrase: Phrase | Phrases, id?: string, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, labelAction?: boolean, data?: T): LabeledSearchInput {
        return this.setupComponent(new LabeledSearchInput(labelPhrase, id, value, name, lblPosition, lblAlignment, labelAction), data);
    }
}
