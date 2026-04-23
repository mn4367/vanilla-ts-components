import { concatCSS } from "@vanilla-ts/core/build";


await concatCSS({
    Pre: [
        /** Get basic theme CSS from @vanilla-ts/components. */
        {
            Pattern: [
                "./themes/vts/Vars.css",
                "./themes/vts/Common.css"
            ],
            RelativeTo: "./showcase/style/"
        },
        /** Get basic CSS for the app. */
        {
            Pattern: [
                "./showcase/src/style/default/Vars.css",
                "./showcase/src/style/default/App.css",
                "./showcase/src/style/default/Fonts.css",
                "./showcase/src/style/default/examples/LabeledComponentEx.css",
            ],
            RelativeTo: "./showcase/style"
        }
    ],
    ScriptFiles: [
        /** Step 1: Get used CSS only from @vanilla-ts/components and @vanilla-ts/dom. */
        {
            SourceFile: "./showcase/out/showcase/src/index.js",
            IgnoreSourceFiles: {
                Pattern: [
                    "./showcase/out/showcase/src/**/*.js",
                ]
            },
            Lookup: {
                Pattern: "./themes/**/*.css"
            },
            RelativeTo: "./showcase/style",
            RollupOptions: {
                external: ["@vanilla-ts/core", /*"@vanilla-ts/dom"*/]
            },
            Debug: {
                // Modules: true,
                // Ignored: true,
                // Used: true,
                // Warnings: true
            }
        },
        /**
         * Step 2: Get used CSS only from the local sources. */
        {
            SourceFile: "./showcase/out/showcase/src/index.js",
            IgnoreSourceFiles: {
                Pattern: [
                    "./showcase/out/src/**/*.js"
                ]
            },
            Lookup: {
                Pattern: [
                    "./showcase/src/style/**/*.css"
                ]
            },
            RelativeTo: "./showcase/style/",
            UseNodeResolve: false,
            Debug: {
                // Modules: true,
                // Ignored:true,
                // Used: true,
                // Warnings: true
            }
        }
    ],
    Post: [
        /** Get app overwrites. */
        {
            Pattern: [
                "./showcase/src/style/default/Overwrites.css",
            ],
            RelativeTo: "./showcase/style"
        }
    ],
    OutputFile: process.argv[2]
});
