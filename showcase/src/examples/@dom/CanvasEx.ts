import { Canvas } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<canvas>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas%.

**Class:** \`@vanilla-ts/dom/Canvas\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Canvas } from "@vanilla-ts/dom";

const example = new Canvas("Three overlapping colored circles")
    .width(200)
    .height(200)
    .style("border", "1px solid black");

// Get a drawing context from the underlying native canvas element (\`DOM\`).
const ctx = example.DOM.getContext("2d")!;

const drawCircle = (x: number, y: number, radius: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
};

drawCircle(50, 50, 40, "red");
drawCircle(100, 100, 40, "green");
drawCircle(150, 150, 40, "blue");

new VTS_App(document.body).append(example);
\`\`\`
`;


export class CanvasEx extends BaseExample {
    constructor() {
        super("Canvas");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const canvas = new Canvas("Three overlapping colored circles")
            .width(200)
            .height(200)
            .style("border", "1px solid black");
        const ctx = canvas.DOM.getContext("2d")!;
        const drawCircle = (x: number, y: number, radius: number, color: string) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        };
        drawCircle(50, 50, 40, "red");
        drawCircle(100, 100, 40, "green");
        drawCircle(150, 150, 40, "blue");
        this.append(
            this.markdown(intro),
            this.exampleNoToolbar(canvas),
            this.markdown(example),
        );
    }
}
