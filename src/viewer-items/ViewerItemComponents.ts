import { AElementComponentWithInternalUI, ComponentFactory, HTMLElementWithChildren, IElementComponent, IElementWithChildrenComponent } from "@vanilla-ts/core";
import { Div } from "@vanilla-ts/dom";
import { IViewerItemComponent, Viewer } from "../Viewer.js";


/**
 * A viewer item component that is built from other components. The content of the component is
 * built synchronously, so the `Ready` property returns `true` from the start and no
 * `ViewerItemReadyEvent` is emitted.
 */
export class ViewerItemComponents extends AElementComponentWithInternalUI<Div> implements IViewerItemComponent {
    #naturalWidth = 1;
    #naturalHeight = 1;
    #scale = 1;
    #initialMount = true;
    #viewer?: Viewer;

    /**
     * Creates a viewer item component that is built from other components.
     * @param components The components that form the content of this viewer item. They are added to
     * the internal `Div` component of this viewer item.
     */
    constructor(...components: IElementComponent<HTMLElement>[]) {
        super();
        this.initialize(undefined, ...components);
    }

    /** @inheritdoc */
    public get Ready(): boolean { return true; }

    /** @inheritdoc */
    public get HasError(): boolean { return false; }

    /** @inheritdoc */
    public get NaturalWidth(): number { return this.#naturalWidth; }

    /** @inheritdoc */
    public get NaturalHeight(): number { return this.#naturalHeight; }

    /** @inheritdoc */
    public scale(scale: number): this {
        this.#scale = scale;
        this.#scale > 0
            ? this.style("zoom", this.#scale.toString())
            : this.#scaleToFit(scale);
        return this;
    }

    /** @inheritdoc */
    public viewer(viewer?: Viewer): void {
        this.#viewer = viewer;
    }

    /** @inheritdoc */
    public viewerResized(): void {
        if (this.#scale < 0) {
            this.#scaleToFit(this.#scale);
        }
    }

    /**
     * Scale the viewer item to fit its container.
     * @param scale One of the `fit` options (Zoom.FIT, Zoom.FITWIDTH, Zoom.FITHEIGHT).
     */
    #scaleToFit(scale: number): void {
        const viewerRect = this.#viewer?.ClientRect ?? { Width: 1, Height: 1 }; // eslint-disable-line jsdoc/require-jsdoc
        switch (scale) {
            case -2: // Zoom.FITWIDTH
                this.style("zoom", (viewerRect.Width / this.#naturalWidth).toString());
                break;
            case -3: // Zoom.FITHEIGHT
                this.style("zoom", (viewerRect.Height / this.#naturalHeight).toString());
                break;
            case -1: // Zoom.FIT (default)
            default:
                this.style("zoom", Math.min(viewerRect.Width / this.#naturalWidth, viewerRect.Height / this.#naturalHeight).toString());
                break;
        }
    }

    /** @inheritdoc */
    public override onDidMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        if (this.ui.DOM.isConnected && this.#initialMount) {
            this.#initialMount = false;
            this.#naturalWidth = Math.max(1, this.ui.DOM.offsetWidth);
            this.#naturalHeight = Math.max(1, this.ui.DOM.offsetHeight);
            this.style("width", `${this.#naturalWidth}px`)
                .style("height", `${this.#naturalHeight}px`,)
                .style("zoom", this.#scale.toString());
        }
        super.onDidMount(parent);
    }

    /** @inheritdoc */
    protected override buildUI(...components: IElementComponent<HTMLElement>[]): this {
        this.ui = new Div()
            .addClass(this.DefaultCSSClassName)
            .append(...components);
        return this;
    }
}

/**
 * Factory for `ViewerItemFromComponents` components.
 */
export class ViewerItemFromComponentsFactory<T> extends ComponentFactory<ViewerItemComponents> {
    /**
     * Create, set up and return ViewerItemFromComponents component.
     * @param components The components that form the content of this viewer item. They are added to
     * the internal `Div` component of this viewer item.
     * @param data Optional arbitrary data passed to the `setupComponent()` function of the factory.
     * @returns ViewerItemFromComponents component.
     */
    public viewerItemFromComponents(components: IElementComponent<HTMLElement>[], data: T): ViewerItemComponents {
        return this.setupComponent(new ViewerItemComponents(...components), data);
    }
}
