import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a DOM document fragment
(%\`DocumentFragment\`|https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment%).

**Class:** \`@vanilla-ts/dom/Fragment\`

There are not so many use cases for this component, but it can be useful in some scenarios,
like collecting components to be appended in a single operation later to another component, or to
create a real DOM fragment from regular components which should be appended to another DOM node.

Like with a real DOM fragment, the \`Fragment\` component shouldn't be seen as a
%performance optimization|https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment#performance%
for appending/inserting component collections. If you need to append/insert multiple components to
another component, the regular \`append()\`/\`insert()\` functions are usually a bit faster.
`;

const example = `
### Code examples

\`\`\`
import { Div, Fragment, P } from "@vanilla-ts/dom";

// Regular use case.
const f1 = new Fragment(new P("first child"));
const extracted: INodeComponent<Node>[] = [];
this.extract(extracted);
f1.append(...extracted, new P("last child"));
const t1 = new Div();
t1.appendFragment(f1);
f1.dispose();

// Using the released fragment for a direct DOM manipulation on another node.
const f2 = new Fragment();
f2.append(new P("first child"), new P("second child"), new P(" third child"));
// Append some other components
// f2.append(...);
// Release the fragment for direct DOM use
const content = f2.release();
const DOM = document.getElementById("target")!;
for (const child of content.Children) {
    console.log("Adding " + child.ClassName + " to '<" + DOM.tagName + ">' target element.");
}
DOM.append(content.Fragment);
f2.dispose();
\`\`\`
`;


export class FragmentEx extends BaseExample {
    constructor() {
        super("Fragment");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.markdown(example)
        );
    }
}
