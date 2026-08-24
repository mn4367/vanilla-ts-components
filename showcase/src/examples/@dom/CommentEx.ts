import { Code, Comment, Text } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates a DOM comment node
(%\`<!-\u200b- -->\`|https://developer.mozilla.org/en-US/docs/Web/API/Comment%).
There is, of course, no visual representation of a comment node in a web page but the created
component can be used like any other 'real' component.

**Class:** \`@vanilla-ts/dom/Comment\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Comment } from "@vanilla-ts/dom";

const example = new Comment("Lorem ipsum dolor sit amet.");

new VTS_App(document.body).append(example);
\`\`\`
`;


export class CommentEx extends BaseExample {
    constructor() {
        super("Comment");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        this.append(
            this.markdown(intro),
            this.exampleNoToolbar(
                new Comment("Lorem ipsum dolor sit amet."),
                new Code(
                    "<!--",
                    new Text(new Comment("Lorem ipsum dolor sit amet.").Text!),
                    "-->"
                )
            ),
            this.markdown(example),
        );
    }
}
