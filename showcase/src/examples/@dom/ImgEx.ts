import { Img, P } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<img>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img%.

**Class:** \`@vanilla-ts/dom/Img\`
`;

const example = `
### Code example

\`\`\`
import { Img, P } from "@vanilla-ts/dom";

const img = new Img("./res/XPR15789.jpg")
    .width(3240)   // If possible, always set width and height
    .height(2160)  // explicitly to avoid layout shifts!
    .style({ "width": "25rem", "height": "auto" })
    .loading("lazy");
const p = new P("Of course it has to be a picture of a cat!")
    .style("textAlign", "center");
\`\`\`
`;


export class ImgEx extends BaseExample {
    constructor() {
        super("Img");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const img = new Img("./res/XPR15789.jpg")
            .width(3240)
            .height(2160)
            .style({ "width": "25rem", "height": "auto" })
            .loading("lazy");
        const p = new P("Of course it has to be a picture of a cat!")
            .style("textAlign", "center");
        this.append(
            this.markdown(intro),
            this.example([img, p], [img, p]),
            this.markdown(example),
        );
    }
}
