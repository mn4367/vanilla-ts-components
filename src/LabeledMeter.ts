import { ComponentFactory, DefaultEventMap, Phrase, Phrases } from "@vanilla-ts/core";
import { Meter } from "@vanilla-ts/dom";
import { LabelAlignment, LabeledComponentWithSpan, LabelPosition } from "./LabeledComponents.js";


/**
 * Labeled meter component.
 */
export class LabeledMeter<EventMap extends DefaultEventMap = DefaultEventMap> extends LabeledComponentWithSpan<Meter, EventMap> {
    /**
     * Create LabeledMeter component.
     * @param labelPhrase The phrasing content for the label.
     * @param max The maximum value for the component. Default: `1`.
     * @param value The current value for the element. The DOM getter limits the value to the
     * current minimum and maximum. Default: `0`.
     * @param min The minimum value for the component. Default: `0`.
     * @param low The upper boundary of the low range. If omitted, the DOM getter defaults to the
     * current minimum.
     * @param high The lower boundary of the high range. If omitted, the DOM getter defaults to the
     * current maximum.
     * @param optimum The optimum value. If omitted, the DOM getter defaults to the midpoint of the
     * current range.
     * @param meterPhrase The phrasing content for the meter element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     */
    constructor(labelPhrase: Phrase | Phrases, max: number = 1, value: number = 0, min: number = 0, low?: number, high?: number, optimum?: number, meterPhrase?: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment) {
        super(
            new Meter(max, value, min, low, high, optimum, ...[meterPhrase ?? []].flat()),
            labelPhrase,
            lblPosition,
            lblAlignment
        );
    }

    /**
     * Get Meter component of this component. Equivalent to `Component`, just with a more
     * descriptive name.
     */
    public get Meter(): Meter {
        return this._component;
    }

    /**
     * Access the internal `Meter` component via a callback function. Useful for seamless chaining
     * when creating instances of this component.
     * @param cb A callback function that receives the current `Meter` component instance and this
     * instance as parameters.
     * @returns This instance.
     */
    public meter(cb: (meter: Meter, owner?: this) => void): this {
        cb(this._component, this);
        return this;
    }

    /**
     * Set the phrasing content of the components meter element. __The setter `Phrase` here is an
     * alias for the property `this.Meter.Phrase`.__
     */
    public set Phrase(phrase: Phrase | Phrases) {
        this._component.Phrase = phrase;
    }

    /**
     * Set the phrasing content of the components meter element. __The function `phrase()` here is
     * an alias for the function `this.Meter.phrase()` but it returns _this_ instance instead of
     * the 'Meter' instance.__
     * @param phrase The phrasing content to be set for the meter element.
     * @returns This instance.
     */
    public phrase(...phrase: Phrases): this {
        this._component.phrase(...phrase);
        return this;
    }

    /**
     * Set the phrasing content of the components meter element. __The setter `Rephrase` here is an
     * alias for the property `this.Meter.Rephrase`.__
     */
    public set Rephrase(phrase: Phrase | Phrases) {
        this._component.Rephrase = phrase;
    }

    /**
     * Set the phrasing content of the components meter element. __The function `rephrase()` here
     * is an alias for the function `this.Meter.rephrase()` but it returns _this_ instance instead
     * of the 'Meter' instance.__
     * @param phrase The phrasing content to be set for the meter element.
     * @returns This instance.
     */
    public rephrase(...phrase: Phrases): this {
        this._component.rephrase(...phrase);
        return this;
    }

    /** Get/set the `min` attribute value of the meter component. */
    public get Min(): number {
        return this._component.Min;
    }
    /** @inheritdoc */
    public set Min(v: number) {
        this._component.Min = v;
    }

    /**
     * Set the `min` attribute value of the meter component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public min(v: number): this {
        this._component.min(v);
        return this;
    }

    /** Get/set the `max` attribute value of the meter component. */
    public get Max(): number {
        return this._component.Max;
    }
    /** @inheritdoc */
    public set Max(v: number) {
        this._component.Max = v;
    }

    /**
     * Set the `max` attribute value of the meter component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public max(v: number): this {
        this._component.max(v);
        return this;
    }

    /** Get/set the `low` attribute value of the meter component. */
    public get Low(): number {
        return this._component.Low;
    }
    /** @inheritdoc */
    public set Low(v: number | undefined) {
        this._component.Low = v;
    }

    /**
     * Set the `low` attribute value of the meter component.
     * @param v The value to be set. If omitted or `undefined`, the attribute is removed.
     * @returns This instance.
     */
    public low(v?: number): this {
        this._component.low(v);
        return this;
    }

    /** Get/set the `high` attribute value of the meter component. */
    public get High(): number {
        return this._component.High;
    }
    /** @inheritdoc */
    public set High(v: number | undefined) {
        this._component.High = v;
    }

    /**
     * Set the `high` attribute value of the meter component.
     * @param v The value to be set. If omitted or `undefined`, the attribute is removed.
     * @returns This instance.
     */
    public high(v?: number): this {
        this._component.high(v);
        return this;
    }

    /** Get/set the `optimum` attribute value of the meter component. */
    public get Optimum(): number {
        return this._component.Optimum;
    }
    /** @inheritdoc */
    public set Optimum(v: number | undefined) {
        this._component.Optimum = v;
    }

    /**
     * Set the `optimum` attribute value of the meter component.
     * @param v The value to be set. If omitted or `undefined`, the attribute is removed.
     * @returns This instance.
     */
    public optimum(v?: number): this {
        this._component.optimum(v);
        return this;
    }

    /** Get/set the `value` attribute value of the meter component. */
    public get Value(): number {
        return this._component.Value;
    }
    /** @inheritdoc */
    public set Value(v: number) {
        this._component.Value = v;
    }

    /**
     * Set the `value` attribute value of the meter component.
     * @param v The value to be set.
     * @returns This instance.
     */
    public value(v: number): this {
        this._component.value(v);
        return this;
    }
}

/**
 * Factory for `LabeledMeter` components.
 */
export class LabeledMeterFactory<T> extends ComponentFactory<LabeledMeter> {
    /**
     * Create, set up and return LabeledMeter component.
     * @param labelPhrase The phrasing content for the label.
     * @param max The maximum value for the component. Default: `1`.
     * @param value The current value for the element. The DOM getter limits the value to the
     * current minimum and maximum. Default: `0`.
     * @param min The minimum value for the component. Default: `0`.
     * @param low The upper boundary of the low range. If omitted, the DOM getter defaults to the
     * current minimum.
     * @param high The lower boundary of the high range. If omitted, the DOM getter defaults to the
     * current maximum.
     * @param optimum The optimum value. If omitted, the DOM getter defaults to the midpoint of the
     * current range.
     * @param meterPhrase The phrasing content for the meter element.
     * @param lblPosition The position of the label.
     * @param lblAlignment The alignment of the label.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns LabeledMeter component.
     */
    public labeledMeter(labelPhrase: Phrase | Phrases, max: number = 1, value: number = 0, min: number = 0, low?: number, high?: number, optimum?: number, meterPhrase?: Phrase | Phrases, lblPosition?: LabelPosition, lblAlignment?: LabelAlignment, data?: T): LabeledMeter {
        return this.setupComponent(new LabeledMeter(labelPhrase, max, value, min, low, high, optimum, meterPhrase, lblPosition, lblAlignment), data);
    }
}
