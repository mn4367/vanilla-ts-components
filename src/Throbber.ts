import { AElementComponentWithInternalUI, ComponentFactory, DefaultEventMap } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";


/**
 * Throbber component for displaying a 'busy-with-no-defined-end' state. Calling this a component is
 * a bit of an exaggeration, as it is nothing more than a simple div component. The intention is
 * that the state is visualized with a simple CSS-based animation on the Div component. A very
 * simple example for such an animation can be found in the file `themes/vts/Throbber.css`.
 */
export class Throbber<EventMap extends DefaultEventMap = DefaultEventMap> extends AElementComponentWithInternalUI<Div, EventMap> {
    protected _active: boolean;

    /**
     * Create Throbber component.
     * @param active `true` if the throbber is active (showing an animation), otherwise `false`.
     */
    constructor(active: boolean = true) {
        super();
        super
            .initialize()
            .active(active);
    }

    /**
     * Get/set the `Active` state of the throbber (show/hide the animation).
     */
    public get Active(): boolean {
        return this._active;
    }
    /** @inheritdoc */
    public set Active(v: boolean) {
        this.active(v);
    }

    /**
     * Set the `Active` state of the throbber (show/hide the animation).
     * @param active `true` if the throbber is active (showing an animation), otherwise `false`.
     * @returns This instance.
     */
    public active(active: boolean): this {
        this._active = active;
        this._active
            ? this.ui.addClass("active")
            : this.ui.removeClass("active");
        return this;
    }

    /**
     * Build UI of the component.
     * @returns This instance.
     */
    protected buildUI() {
        this.ui = new Div();
        return this;
    }
}

/**
 * Factory for `Throbber` components.
 */
export class ThrobberFactory<T> extends ComponentFactory<Throbber> {
    /**
     * Create, set up and return Throbber component.
     * @param active `true` if the throbber is active (showing an animation), otherwise `false`.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns Throbber component.
     */
    public throbber(active: boolean = true, data?: T): Throbber {
        return this.setupComponent(new Throbber(active), data);
    }
}
