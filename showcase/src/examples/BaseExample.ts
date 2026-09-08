import { AChildren, AElementComponentWithInternalUI, FlowContent, HTMLElementWithChildren, IChildrenMixin, IElementComponent, IElementWithChildrenComponent, mixin } from "@vanilla-ts/core";
import { Button, Div, H2, Option, Text, TextArea } from "@vanilla-ts/dom";
import { LabeledSelect } from "../../../src/LabeledSelect.js";
import { ScrollContainer } from "../../../src/ScrollContainer.js";
import { $ } from "../App.js";
import { markdown } from "./Drawdown.js";


/**
 * Container for an example.
 */
export abstract class BaseExample extends AElementComponentWithInternalUI<ScrollContainer> { // eslint-disable-line @typescript-eslint/no-unsafe-declaration-merging
    #scrollOffset = { X: 0, Y: 0 };
    #copyCodeButtons: Button[] = [];

    constructor(title?: string) {
        super();
        this.initialize(undefined, title);
        // A class extending this class isn't fully constructed yet here, so defer `buildExample()`.
        queueMicrotask(() => {
            this.buildExample();
            const codeBlocks = this.DOM.querySelectorAll("pre > code");
            for (const codeBlock of codeBlocks) {
                // @ts-expect-error - `highlightElement` is not typed in `@types/highlight.js` (which is used by `markdown`), but it exists at runtime.
                hljs.highlightElement(codeBlock);
                this.addCopyCodeButton(codeBlock as HTMLElement);
            }
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
                            new Option("Tiny (50%)").value("tiny"),
                            new Option("Small (67%)").value("small"),
                            new Option("Smaller (83%)").value("smaller"),
                            new Option("Normal").value("normal"),
                            new Option("Larger (125%)").value("larger"),
                            new Option("Medium (150%)").value("medium"),
                            new Option("Large (175%)").value("large"),
                            new Option("Huge (200%)").value("huge"),
                            new Option("110%").value("110"),
                            new Option("120%").value("120"),
                            new Option("130%").value("130"),
                            new Option("140%").value("140"),
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

    protected addCopyCodeButton(codeBlock: HTMLElement): void {
        function copyTextFallback(text: string): boolean {
            const ta = new TextArea()
                .value(text)
                .readonly(true)
                .style({ position: "fixed", opacity: "0" });
            document.body.append(ta.DOM);
            ta.select();
            const copied = document.execCommand("copy");
            !copied && console.error("Fallback: also failed to copy code.");
            document.body.removeChild(ta.DOM);
            ta.dispose();
            return copied;
        }

        const copyBtn = new Button("Copy")
            .addClass("regular", "button-copy-code")
            .title("Copy code to clipboard")
            .on("click", () => {
                const code = codeBlock.textContent ?? "";
                navigator.clipboard.writeText(code)
                    .then(() => {
                        copyBtn.Text = "Copied!";
                        setTimeout(() => {
                            copyBtn.Text = "Copy";
                        }, 2000);
                    })
                    .catch((err) => {
                        console.error("Failed to copy code: ", err);
                        if (!copyTextFallback(code)) {
                            copyBtn.Text = "Failed to copy!";
                            setTimeout(() => {
                                copyBtn.Text = "Copy";
                            }, 2000);
                        }
                    });
            });
        this.#copyCodeButtons.push(copyBtn);
        codeBlock.parentElement?.insertBefore(copyBtn.DOM, codeBlock);
    }
    // #endregion

    /** Build the example's content. */
    protected abstract buildExample(): void;

    /** @inheritdoc */
    protected override clearOwner(): void {
        for (const btn of this.#copyCodeButtons) {
            btn.DOM.parentElement?.removeChild(btn.DOM);
            btn.dispose();
        }
        this.#copyCodeButtons = [];
        super.clearOwner();
    }

    static {
        /** Mixin the IChildren implementation (which targets `this.ui.Content`). */
        mixin(false, this, AChildren);
    }
}

// Augment class definition with `IChildren` (see `static`).
export interface BaseExample extends IChildrenMixin { } // eslint-disable-line jsdoc/require-jsdoc
