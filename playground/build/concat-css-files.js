import { concatCSS } from "@vanilla-ts/core/build";


await concatCSS({
    Pre: [
        /** Get basic theme CSS from @vanilla-ts/components. */
        {
            Pattern: [
                "./themes/vts/Vars.css",
                "./themes/vts/Common.css"
            ],
            RelativeTo: "./playground/style/"
        },
        /** Get basic CSS for the app. */
        {
            Pattern: [
                "./playground/src/style/Vars.css",
                "./playground/src/style/App.css",
            ],
            RelativeTo: "./playground/style"
        }
    ],
    ScriptFiles: [
        /** Step 1: Get used CSS only from @vanilla-ts/components and @vanilla-ts/dom. */
        {
            SourceFile: "./playground/out/playground/src/index.js",
            IgnoreSourceFiles: {
                Pattern: [
                    "./playground/out/playground/src/**/*.js",
                ]
            },
            Lookup: {
                Pattern: "./themes/**/*.css"
            },
            RelativeTo: "./playground/style",
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
            SourceFile: "./playground/out/playground/src/index.js",
            IgnoreSourceFiles: {
                Pattern: [
                    "./playground/out/playground/src/**/*.js"
                ]
            },
            Lookup: {
                Pattern: [
                    "./playground/src/style/**/*.css"
                ]
            },
            RelativeTo: "./playground/style/",
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
                "./playground/src/style/Overwrites.css",
            ],
            RelativeTo: "./playground/style"
        }
    ],
    OutputFile: process.argv[2]
});
