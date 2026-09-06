import { Em, Hr, OptGroup, Option, P, Select } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<optgroup>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup%.
It groups related \`@vanilla-ts/core/Option\` components within a §@dom/Select§ component. The first
constructor argument sets the group label; all following arguments are the options of the group.

**Class:** \`@vanilla-ts/dom/OptGroup\`
`;

const example = `
### Code example

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Em, Hr, OptGroup, Option, P, Select } from "@vanilla-ts/dom";

const example = new Select([
    new Option("Berlin").value("berlin"),
    new Option("London").value("london"),
    new Option("Paris").value("paris"),
    new Hr(),
    new OptGroup(
        "North America",
        new Option("Chicago").value("chicago"),
        new Option("Los Angeles").value("los-angeles"),
        new Option("New York").value("new-york"),
    ),
    new OptGroup(
        "South America",
        new Option("São Paulo").value("sao-paulo"),
        new Option("Buenos Aires").value("buenos-aires"),
        new Option("Rio de Janeiro").value("rio-de-janeiro"),
    ).disabled(true),
    new OptGroup(
        "Asia",
        new Option("Seoul").value("seoul"),
        new Option("Kyoto").value("kyoto").disabled(true),
        new Option("Shanghai").value("shanghai"),
        new Option("Tokyo").value("tokyo")
    )
])
    .value("tokyo")
    .style("width", "10rem")
    .on("change", () => log.phrase("Selected city (value): ", new Em(example.Value)));

const log = new P("Select a city from the grouped dropdown above.")
    .style({
        width: "25rem",
        marginBlockStart: "1rem"
    });

new VTS_App(document.body).append(example, log);
\`\`\`
`;


export class OptGroupEx extends BaseExample {
    constructor() {
        super("OptGroup");
    }

    /** @inheritdoc */
    protected override buildExample(): void {
        const log = new P("Select a city from the grouped dropdown above.")
            .style({
                width: "25rem",
                marginBlockStart: "1rem"
            });
        const select = new Select([
            // .append(
            new Option("Berlin").value("berlin"),
            new Option("London").value("london"),
            new Option("Paris").value("paris"),
            new Hr(),
            new OptGroup(
                "North America",
                new Option("Chicago").value("chicago"),
                new Option("Los Angeles").value("los-angeles"),
                new Option("New York").value("new-york"),
            ),
            new OptGroup(
                "South America",
                new Option("São Paulo").value("sao-paulo"),
                new Option("Buenos Aires").value("buenos-aires"),
                new Option("Rio de Janeiro").value("rio-de-janeiro"),
            ).disabled(true),
            new OptGroup(
                "Asia",
                new Option("Seoul").value("seoul"),
                new Option("Kyoto").value("kyoto").disabled(true),
                new Option("Shanghai").value("shanghai"),
                new Option("Tokyo").value("tokyo")
            )
        ])
            .value("tokyo")
            .style("width", "10rem")
            .on("change", () => log.phrase("Selected city (value): ", new Em(select.Value)));
        this.append(
            this.markdown(intro),
            this.example([
                select,
                log
            ]),
            this.markdown(example),
        );
    }
}
