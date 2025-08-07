import { defineConfig } from "vitest/config";


export default defineConfig({
    test: {
        setupFiles: ["src/tests/test_setup.js"],
        sequence: {
            concurrent: false,
            shuffle:false
        },
        isolate:true
    },
});
