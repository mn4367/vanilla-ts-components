import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

const compress = process.env.COMPRESS
    ? terser({
        maxWorkers: 3,
        ecma: 2023,
        keep_classnames: true,
        keep_fnames: false,
        format: {
            comments: false,
        },
        compress: {
            passes: 2,
            keep_infinity: true,
            unused: false
        },
        mangle: {
            reserved: []
        }
    })
    : undefined;

export default {
    input: ["./example/out/example/index.js"],
    output: {
        file: "./example/index.js",
        format: "esm",
        sourcemap: true,
    },
    plugins: [
        nodeResolve({
            mainFields: ["minified:main", "browser", "jsnext:main", "module", "main"],
        }),
        commonjs(),
        json(),
        compress
    ]
};
