import { BaseExample } from "../BaseExample.js";


const intro = `
## Advanced components

The components provided by the \`@vanilla-ts/components\` package are complex elements that address
common application requirements, such as tabs or dialog windows. They are composed entirely of the
basic DOM components provided by the [\`@vanilla-ts/dom\`](#@dom/Introduction) package and the
building blocks from the underlying \`@vanilla-ts/core\` package.

### Styling

Following the principle of being as style-agnostic as possible, the components don't come with a
*built-in* default styling. However, there is (of course) a default theme (in the directory
\`@vanilla-ts/components/themes/vts\`) that provides a design for all components. This theme uses
the component's class name in 'kebab-case' as the CSS selector. For example, the CSS selector for
the §@components/DisclosureContainer§ component is \`.disclosure-container\` and for the
§@components/Stepper§ component it is \`.stepper\`. So in most of the examples you'll find code
similar to this excerpt:

\`\`\`
const lcb = new LabeledCheckbox("Labeled checkbox")
    .addClass("labeled-checkbox") // <== Add the class name in 'kebab-case' as a CSS class.
    .checked(true);
\`\`\`

This ensures that the necessary styles from the _default theme_ are applied to the component
instance. This has to be done for _all_ components in \`@vanilla-ts/components\` that you want to
use with the default theme.

Only if you can make sure that the class names won't be changed by minification, bundling or other
optimizations, you could also use the static property \`DefaultCSSClassName\` provided by each
component. Its default implementation simply returns the the component's class name in kebab-case:

\`\`\`
const lcb = new LabeledCheckbox("Labeled checkbox")
    .addClass(LabeledCheckbox.DefaultCSSClassName) // => 'labeled-checkbox'
    .checked(true);
\`\`\`

The drawback here is that you'd have to change the implementation of \`DefaultCSSClassName\`
(prototype modification of the class \`AComponent\`) if, for any reason, it is not desirable or
possible to use kebab case class names as CSS selectors.

In most cases it is recommended to use component factories instead to get component instances, see
§@core/Component factories§. This is also what the code of the showcase application does.


### Labeled components

\`@vanilla-ts/components\` provides some common components in 'labeled' versions, which means that
they are composed of a regular component (e.g. an input field) and a label component that serves as
a caption for the regular component. For input components, the label is a standard §@dom/Label§; for
other components, a §@dom/Span§ is used.

Labeled components allow different label positions and alignments. They are based on the
\`LabeledComponent\` class, which handles the position and alignment in a generic way; as a result,
not all combinations of position and alignment are necessarily appropriate; for example, a checkbox
placed below a label tends to look rather unusual. To illustrate and try the label alignments, you
can use the checkbox 'Use wide label with fixed width' which is available for all examples for
labeled components.
`;

export class ComponentsIntroductionEx extends BaseExample {
    constructor() {
        super();
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this
            .addClass("ex-components-introduction")
            .append(
                this.markdown(intro)
            );
    }
}
