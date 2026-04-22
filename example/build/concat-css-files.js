import { concatCSS } from "@vanilla-ts/core/build";


await concatCSS({
    Pre: [
        /** Get basic theme CSS from @vanilla-ts/components. */
        {
            Pattern: [
                "./themes/vts/Vars.css",
                "./themes/vts/Common.css",
                "./themes/vts/Input.css"
            ],
            RelativeTo: "./example/style/"
        },
        /** Get basic CSS for the app. */
        {
            Pattern: [
                "./example/src/style/Vars.css",
                "./example/src/style/App.css",
            ],
            RelativeTo: "./example/style"
        }
    ],
    ScriptFiles: [
        /** Step 1: Get used CSS _only_ from @vanilla-ts/components. */
        {
            SourceFile: "./example/out/example/src/index.js",
            IgnoreSourceFiles: {
                Pattern: [
                    "./example/out/example/src/**/*.js",
                ]
            },
            Lookup: {
                Pattern: "./themes/**/*.css"
            },
            RelativeTo: "./example/style",
            RollupOptions: {
                external: ["@vanilla-ts/core"]
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
            SourceFile: "./example/out/example/src/index.js",
            Lookup: {
                Pattern: [
                    "./example/src/style/**/*.css"
                ]
            },
            RelativeTo: "./example/style/",
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
                "./example/src/style/Overwrites.css",
            ],
            RelativeTo: "./example/style"
        }
    ],
    OutputFile: process.argv[2]
});
