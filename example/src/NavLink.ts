import { AElementComponentWithInternalUI } from "@vanilla-ts/core";
import { A, LiUl } from "@vanilla-ts/dom";


export class NavLink extends AElementComponentWithInternalUI<LiUl> {
    #a: A;

    constructor(href: string, text: string) {
        super();
        this.initialize(undefined, href, text);
    }

    public get Href(): string {
        return this.#a.Href;
    }
    public set Href(v: string) {
        this.#a.href(v);
    }

    public override get Text(): string {
        return this.#a.Text ?? "";
    }
    public override set Text(v: string) {
        this.#a.text(v);
    }

    protected override buildUI(href: string, text: string): this {
        this.ui = new LiUl(this.#a = new A(href, text));
        return this;
    }
}
