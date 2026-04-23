import { AChildren, AElementComponentWithInternalUI, FlowContent, HTMLElementWithChildren, IChildrenMixin, IElementComponent, IElementWithChildrenComponent, mixin } from "@vanilla-ts/core";
import { Div, H2, Text } from "@vanilla-ts/dom";
import { LabeledSelect } from "../../../src/LabeledSelect.js";
import { ScrollContainer } from "../../../src/ScrollContainer.js";
import { $ } from "../App.js";
import { markdown } from "./Drawdown.js";


/**
 * Container for an example.
 */
export abstract class BaseExample extends AElementComponentWithInternalUI<ScrollContainer> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    #scrollOffset = { X: 0, Y: 0 };

    constructor(title?: string) {
        super();
        this.initialize(undefined, title);
        // A class extending this class isn't fully constructed yet here, so defer `buildExample()`.
        queueMicrotask(() => {
            this.buildExample();
            // @ts-expect-error - `highlightElement` is not typed in `@types/highlight.js` (which is used by `markdown`), but it exists at runtime.
            this.DOM.querySelectorAll("pre > code").forEach((e) => hljs.highlightElement(e));
        });
    }

    // #region

    /** @inheritdoc */
    public override onBeforeUnmount(): void {
        this.#scrollOffset = this.ui.ScrollOffset;
        super.onBeforeUnmount();
    }

    /** @inheritdoc */
    public override onDidMount(parent: IElementWithChildrenComponent<HTMLElementWithChildren>): void {
        super.onDidMount(parent); /*!!*/
        this.ui.scroll({
            left: this.#scrollOffset.X,
            top: this.#scrollOffset.Y,
            behavior: "instant",
        });
    }

    /** @inheritdoc */
    protected override buildUI(title?: string): this {
        const content = new Div().addClass("example-content");
        this.ui = $.scrollContainer()
            .addClass("example", "ex-" + this.DefaultCSSClassName.slice(0, -3))
            .append(
                title
                    ? content.append(new H2(title))
                    : content
            );
        // Set target DOM for the `IChildren` mixin!!
        this.setChildrenDOMTarget(content.DOM);
        return this;
    }

    protected example(children: FlowContent[], toDisable?: IElementComponent<HTMLElement>[]): IElementWithChildrenComponent<HTMLElement> {
        let toolbar: Div;
        let sizeSelect: LabeledSelect;
        let content: Div;
        const example = new Div()
            .addClass("example-area", "toolbar")
            .append(
                toolbar = new Div()
                    .addClass("toolbar")
                    .append(
                        sizeSelect = $.labeledSelect("Size", [
                            { Text: "Tiny (50%)", Value: "tiny" },
                            { Text: "Small (67%)", Value: "small" },
                            { Text: "Smaller (83%)", Value: "smaller" },
                            { Text: "Normal", Value: "normal" },
                            { Text: "Larger (125%)", Value: "larger" },
                            { Text: "Medium (150%)", Value: "medium" },
                            { Text: "Large (175%)", Value: "large" },
                            { Text: "Huge (200%)", Value: "huge" },
                            { Text: "110%", Value: "110" },
                            { Text: "120%", Value: "120" },
                            { Text: "130%", Value: "130" },
                            { Text: "140%", Value: "140" },
                        ])
                            .value("normal")
                            .on("change", () => {
                                let sizeClass = sizeSelect.Value === "normal"
                                    ? ""
                                    : "sz-" + sizeSelect.Value;
                                for (const child of example.ElementChildren) {
                                    child !== toolbar && child
                                        .removeClass(
                                            "sz-tiny", "sz-small", "sz-smaller", "sz-larger",
                                            "sz-medium", "sz-large", "sz-huge", "sz-110", "sz-120",
                                            "sz-130", "sz-140"
                                        )
                                        .addClass(sizeClass);
                                }
                            }),
                        new Text("|"),
                        $.labeledCheckbox("Disabled")
                            .on("checked", (ev) => {
                                const childrenToDisable = toDisable ?? content.ElementChildren;
                                for (const child of childrenToDisable) {
                                    child !== toolbar && child.disabled(ev.$.Checked);
                                }
                            }),
                        new Text("|"),
                        $.labeledCheckbox("Direction RTL")
                            .on("checked", (ev) => {
                                for (const child of example.ElementChildren) {
                                    child !== toolbar && child.dir(ev.$.Checked ? "rtl" : null);
                                }
                            }),
                    ),
                content = new Div().addClass("canvas")
                    .append(...children)
            );
        return example;
    }

    protected exampleNoToolbar(...children: FlowContent[]): IElementWithChildrenComponent<HTMLElement> {
        const example = new Div()
            .addClass("example-area")
            .append(
                new Div()
                    .append(...children)
            );
        return example;
    }

    protected properties(...children: FlowContent[]): IElementWithChildrenComponent<HTMLElement> {
        const props = new Div()
            .addClass("example-properties")
            .append(...children);
        return props;
    }

    protected markdown(md: string): IElementComponent<HTMLElement> {
        const result = new Div().addClass("md");
        const html = markdown(md)
            .replace(/§@([^\/]+)\/(.*?)§/g, (_match: string, navTarget: string, label: string) => {
                // return `<a href="javascript: __navigateTo__('#@${navTarget}/${label}')">${label}</a>`;
                return `<a href="#@${navTarget}/${label}">${label}</a>`;
            })
            .replace(/%([^\|]+)\|(.*?)%/g, (_match: string, label: string, href: string) => {
                return `<a href="${href}" target="_blank">${label}</a>`;
            })
            .replace(/\\/g, "<br/>")
            .replaceAll("<code>", '<code dir="ltr">');
        result.DOM.insertAdjacentHTML("beforeend", html);
        return result;
    }
    // #endregion

    /** Build the example's content. */
    protected abstract buildExample(): void;

    static {
        /** Mixin the IChildren implementation (which targets `this.ui.Content`). */
        mixin(false, this, AChildren);
    }
}

// Augment class definition with `IChildren` (see `static`).
export interface BaseExample extends IChildrenMixin { } // eslint-disable-line jsdoc/require-jsdoc
