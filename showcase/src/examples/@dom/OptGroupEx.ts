import { Em, Hr, OptGroup, Option, P, Select } from "@vanilla-ts/dom";
import { BaseExample } from "../BaseExample.js";


const intro = `
A component that encapsulates the DOM element
%\`<optgroup>\`|https://developer.mozilla.org/en-US/docs/Web/HTML/Element/optgroup%.
It groups related \`Option\` components within a §@dom/Select§ component. The first
constructor argument sets the group label; all following arguments are the contents of the group.
In a customizable select, a §@dom/Legend§ can be used as the first child to label the group.

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

const introMultiple = `
## Multiple selection

Option groups can also be used in a \`Select\` that has \`Multiple\` set to \`true\`. The selected
options/values can be read from the \`SelectedOptions\` property of the \`Select\` component.

When one or more grouped options are preselected with \`selected(true)\`, first enable multiple
selection with \`multiple(true)\` and then add the options and option groups using \`options()\`.
Preselected options cannot be passed to the constructor in this case because the underlying select
still behaves as a single-selection control while its constructor arguments are added.
`;

const exampleMultiple = `
### Code example (multiple selection)

\`\`\`
import { VTS_App } from "@vanilla-ts/core";
import { Em, Hr, OptGroup, Option, P, Select } from "@vanilla-ts/dom";

const example = new Select()
    .multiple(true)
    .size(17)
    .options([
        new Option("Berlin").value("berlin"),
        new Option("London").value("london"),
        new Option("Paris").value("paris"),
        new Hr(),
        new OptGroup(
            "North America",
            new Option("Chicago").value("chicago").selected(true),
            new Option("Los Angeles").value("los-angeles"),
            new Option("New York").value("new-york")
        ),
        new OptGroup(
            "South America",
            new Option("São Paulo").value("sao-paulo"),
            new Option("Buenos Aires").value("buenos-aires"),
            new Option("Rio de Janeiro").value("rio-de-janeiro")
        ).disabled(true),
        new OptGroup(
            "Asia",
            new Option("Seoul").value("seoul"),
            new Option("Kyoto").value("kyoto").disabled(true),
            new Option("Shanghai").value("shanghai"),
            new Option("Tokyo").value("tokyo").selected(true)
        )
    ])
    .style("width", "10rem")
    .on("change", updateLog);

const log = new P("Select one or more cities from the list above.")
    .style({
        width: "25rem",
        marginBlockStart: "1rem"
    });

function updateLog(): void {
    const selectedValues = Array.from(example.SelectedOptions, option => option.Value);
    log.phrase(
        "Selected cities (values): ",
        new Em(selectedValues.join(", ") || "None")
    );
}

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
        const logMultiple = new P("Select one or more cities from the list above.")
            .style({
                width: "25rem",
                marginBlockStart: "1rem"
            });
        const selectMultiple = new Select()
            .multiple(true)
            .size(17)
            .options([
                new Option("Berlin").value("berlin"),
                new Option("London").value("london"),
                new Option("Paris").value("paris"),
                new Hr(),
                new OptGroup(
                    "North America",
                    new Option("Chicago").value("chicago").selected(true),
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
                    new Option("Tokyo").value("tokyo").selected(true)
                )
            ])
            .style("width", "10rem")
            .on("change", () => {
                const values = Array.from(selectMultiple.SelectedOptions, option => option.Value);
                logMultiple.phrase(
                    "Selected cities (values): ",
                    new Em(values.join(", ") || "None"),
                );
            });
        this.append(
            this.markdown(intro),
            this.example([
                select,
                log
            ]),
            this.markdown(example),
            this.markdown("---"),
            this.markdown(introMultiple),
            this.example([
                selectMultiple,
                logMultiple
            ]),
            this.markdown(exampleMultiple),
        );
    }
}
