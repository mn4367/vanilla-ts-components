import { cid, ComponentFactory, NullableString, Phrase, Phrases } from "@vanilla-ts/core";
import { SearchInput } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledInputComponent, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled search input component.
 */
export class LabeledSearchInput<EventMap extends HTMLElementEventMap = HTMLElementEventMap> extends LabeledInputComponent<SearchInput, EventMap> {
    /**
     * Create LabeledSearchInput component.
     * @param labelPhrase The phrasing content for the label.
     * @param id The id (attribute) of the search input element. If `id` is `undefined` or omitted,
     * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the search input element.
     * @param name The `name` attribute of the search input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the search input element (a unique ID has been
     *   set automatically on the search input element), if `lblAction` is `false`, clicking on the
     *   label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the search input element).
     */
    constructor(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean) {
        const _id = id === undefined
            ? cid()
            : id === null || id === ""
                ? null
                : id;
        super(
            new SearchInput(_id, value, name),
            labelPhrase,
            _id,
            lblPosition,
            lblAlignment,
            lblAction
        );
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
     * @param id The id (attribute) of the search input element. If `id` is `undefined` or omitted,
     * a unique ID will be generated. If `id` is explicitely set to `null` or an empty string, no id
     * attribute will be set. Any other value will be used as the id attribute.
     * @param value The value of the search input element.
     * @param name The `name` attribute of the search input element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param lblAction Controls the following behavior:
     * - If `id` is `undefined`, omitted or a regular id attribute value: if `lblAction` is `true`
     *   or `undefined`, a click on the label focuses the search input element (a unique ID has been
     *   set automatically on the search input element), if `lblAction` is `false`, clicking on the
     *   label does nothing.
     * - If `id` is `null` or an empty string: clicking on the label does nothing (no id attribute
     *   has been set on the search input element).
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledSearchInput component.
     */
    public labeledSearchInput(labelPhrase: Phrase | Phrases, id?: NullableString, value?: string, name?: string, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, lblAction?: boolean, data?: T): LabeledSearchInput {
        return this.setupComponent(new LabeledSearchInput(labelPhrase, id, value, name, lblPosition, lblAlignment, lblAction), data);
    }
}
