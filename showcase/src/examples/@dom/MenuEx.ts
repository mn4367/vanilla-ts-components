import { ButtonFactory, LiUl, Menu } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<menu>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menu%.

**Class:** \`@vanilla-ts/dom/Menu\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { ButtonFactory, LiUl, Menu } from "@vanilla-ts/dom";

const bf = new ButtonFactory();

const example = new Menu()
    .addClass("menu-example")
    .append(
        new LiUl(
            bf.buttonRegular("Cut")
                .title("Cut the selected text")
                .on("click", () => console.log("Fake 'Cut text' executed"))
        ),
        new LiUl(
            bf.buttonRegular("Copy")
                .title("Copy the selected text")
                .on("click", () => console.log("Fake 'Copy text' executed"))
        ),
        new LiUl(
            bf.buttonRegular("Paste")
                .title("Paste text from the clipboard")
                .on("click", () => console.log("Fake 'Paste text' executed"))
        )
    );

new VTS_App(document.body).append(example);
\`\`\`
`;

const exampleCSS = `
### CSS

\`\`\`css
.menu-example {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
    > li {
        > button.regular {
            width: 5rem;
        }
    }
}
\`\`\`
`;


export class MenuEx extends BaseExample {
    constructor() {
        super("Menu");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const bf = new ButtonFactory();
        this.append(
            this.markdown(intro),
            this.example([
                new Menu()
                    .addClass("menu-example")
                    .append(
                        new LiUl(
                            bf.buttonRegular("Cut")
                                .title("Cut the selected text")
                                .on("click", () => console.log("Fake 'Cut text' executed"))
                        ),
                        new LiUl(
                            bf.buttonRegular("Copy")
                                .title("Copy the selected text")
                                .on("click", () => console.log("Fake 'Copy text' executed"))
                        ),
                        new LiUl(
                            bf.buttonRegular("Paste")
                                .title("Paste text from the clipboard")
                                .on("click", () => console.log("Fake 'Paste text' executed"))
                        )
                    )
            ]),
            this.markdown(example),
            this.markdown(exampleCSS),
        );
    }
}
