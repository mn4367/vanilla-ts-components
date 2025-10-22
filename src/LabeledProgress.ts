import { ComponentFactory, Phrase, Phrases } from "@vanilla-ts/core";
import { Progress, ProgressValueEvent } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponentWithSpan, LabelPosition } from "./LabeledComponents.js";


/** Additional event(s) for `LabeledProgressEventMap`. */
export interface LabeledProgressEventMap extends HTMLElementEventMap {
    /**
     * The value of the progress component has changed. This event is purely informative and can't
     * be cancelled.
     */
    "progress-value": ProgressValueEvent;
}

/**
 * Labeled progress component.
 */
export class LabeledProgress<EventMap extends LabeledProgressEventMap = LabeledProgressEventMap> extends LabeledComponentWithSpan<Progress, EventMap> {
    /**
     * Create LabeledProgress component.
     * @param labelPhrase The phrasing content for the label.
     * @param max The maximum value for the component. For the setter the value must be greater than
     * `0` (it is automatically corrected to `1` if it is lower than or equal to `0`). Default: `1`.
     * @param value The current value for the element. The value must be greater than or equal to
     * `0` and less than or equal to the maximum value (it is automatically corrected so that it
     * complies with these limit values). If the value is undefined, the component shows an
     * 'indeterminate' state.
     * @param progressPhrase The phrasing content for the progress element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrases, max: number = 1, value: number | undefined, progressPhrase?: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(
            new Progress(max, value, ...[progressPhrase ?? []].flat()),
            labelPhrase,
            lblPosition,
            lblAlignment
        );
    }

    /**
     * Get Progress component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get Progress(): Progress {
        return this.component;
    }

    /**
     * Set the phrasing content of the components progress element. __The setter `Phrase` here is an
     * alias for the property `this.Progress.Phrase`.__
     */
    public set Phrase(phrase: Phrase | Phrases) {
        this.component.Phrase = phrase;
    }

    /**
     * Set the phrasing content of the the components progress element. __The function `phrase()`
     * here is an alias for the function `this.Progress.phrase()` but it returns _this_ instance
     * instead of the 'Progress' instance.__
     * @param phrase The phrasing content to be set for the progress element.
     * @returns This instance.
     */
    public phrase(...phrase: Phrases): this {
        this.component.phrase(...phrase);
        return this;
    }

    /**
     * Set the phrasing content of the components progress element. __The setter `Rephrase` here is
     * an alias for the property `this.Progress.Rephrase`.__
     */
    public set Rephrase(phrase: Phrase | Phrases) {
        this.component.Rephrase = phrase;
    }

    /**
     * Set the phrasing content of the the components progress element. __The function `rephrase()`
     * here is an alias for the function `this.Progress.rephrase()` but it returns _this_ instance
     * instead of the 'Progress' instance.__
     * @param phrase The phrasing content to be set for the progress element.
     * @returns This instance.
     */
    public rephrase(...phrase: Phrases): this {
        this.component.rephrase(...phrase);
        return this;
    }

    /**
     * Get/set the indeterminate state of the progress element (re-exported for easier direct
     * access).
     */
    public get Indeterminate(): boolean {
        return this.component.Indeterminate;
    }
    /** @inheritdoc */
    public set Indeterminate(v: boolean) {
        this.component.Indeterminate = v;
    }

    /**
     * Sets the indeterminate state of the progress element (re-exported for easier direct access).
     * @param indeterminate `true`, if the state of the component should be indeterminate, otherwise
     * false. If `indeterminate` is `true`, the `value` attribute is removed, otherwise the value
     * attribute is set to `0`, if the component has no value attribute, or the current `value`
     * attribute is unchanged.
     * @returns This instance.
     */
    public indeterminate(indeterminate: boolean): this {
        this.component.indeterminate(indeterminate);
        return this;
    }

    /**
     * Get/set the `max` attribute value of the progress component (re-exported for easier direct
     * access). For the setter the value must be greater than `0` (it is automatically corrected to
     * `1` if it is lower than or equal to `0`).
     */
    public get Max(): number {
        return this.component.Max;
    }
    /** @inheritdoc */
    public set Max(v: number) {
        this.component.max(v);
    }

    /**
     * Get/set the `max` attribute value of the progress component (re-exported for easier direct
     * access). The value must be greater than `0` (it is automatically corrected to `1` if it is
     * lower than or equal to `0`). If the new maximum value is also greater than the current value,
     * the current value is set to the maximum value.
     * @param v The value to be set.
     * @returns This instance.
     */
    public max(v: number) {
        this.component.max(v);
        return this;
    }

    /**
     * Get/set the `value` attribute value of the component (re-exported for easier direct access).
     * For the setter, the value must be greater than or equal to `0` and less than or equal to the
     * maximum value (it is automatically corrected so that it lies between these limits). If the
     * component has no `value` attribute (it is in an 'indeterminate' state), the return value of
     * the getter is nevertheless always `0`. If `Value` is set to `undefined`, the `value`
     * attribute is removed.
     */
    public get Value(): number {
        return this.component.Value;
    }
    /** @inheritdoc */
    public set Value(v: number | undefined) {
        this.component.value(v);
    }

    /**
     * Get/set the `value` attribute value of the component (re-exported for easier direct access).
     * The value must be greater than or equal to `0` and less than or equal to the maximum value
     * (it is automatically corrected so that it lies between these limits). If `v` is omitted or is
     * `undefined`, the `value` attribute is removed.
     * @param v The value to be set.
     * @returns This instance.
     */
    public value(v?: number) {
        this.component.value(v);
        return this;
    }
}

/**
 * Factory for `LabeledProgress` components.
 */
export class LabeledProgressFactory<T> extends ComponentFactory<LabeledProgress> {
    /**
     * Create LabeledProgress component.
     * @param labelPhrase The phrasing content for the label.
     * @param max The maximum value for the component. For the setter the value must be greater than
     * `0` (it is automatically corrected to `1` if it is lower than or equal to `0`). Default: `1`.
     * @param value The current value for the element. The value must be greater than or equal to
     * `0` and less than or equal to the maximum value (it is automatically corrected so that it
     * complies with these limit values). If the value is undefined, the component shows an
     * 'indeterminate' state.
     * @param progressPhrase The phrasing content for the progress element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledProgress component.
     */
    public labeledProgress(labelPhrase: Phrase | Phrases, max: number = 1, value: number | undefined, progressPhrase?: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledProgress {
        return this.setupComponent(new LabeledProgress(labelPhrase, max, value, progressPhrase, lblPosition, lblAlignment), data);
    }
}
