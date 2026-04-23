import { AElementComponentWithInternalUI } from "@vanilla-ts/core";
import { Main } from "@vanilla-ts/dom";
import { $ } from "../App.js";
import { ExampleCategories } from "../components/ExampleCategories.js";
import { ExampleContainer } from "../components/ExampleContainer.js";


/**
 * Create the main section of the app.
 */
export class AppMain extends AElementComponentWithInternalUI<Main> {
    #exampleCategories: ExampleCategories;
    #exampleContainer: ExampleContainer;

    constructor() {
        super();
        this.initialize();
    }

    public get ExampleCategories(): ExampleCategories {
        return this.#exampleCategories;
    }

    public get ExampleContainer(): ExampleContainer {
        return this.#exampleContainer;
    }

    /** @inheritdoc */
    protected override buildUI(): this {
        this.ui = new Main()
            .addClass("app-main")
            .append(
                $.splitter(
                    {
                        ActiveAreaSize: "18rem",
                        EndMinSize: "30rem"
                    },
                    [this.#exampleCategories = new ExampleCategories()],
                    [this.#exampleContainer = new ExampleContainer()]
                )
            );
        return this;
    }
}
