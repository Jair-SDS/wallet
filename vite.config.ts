import { defineConfig, loadEnv } from "vite";
import path from "path";
import dfxJson from "./dfx.json";
import fs from "fs";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
// https://github.com/TanStack/query/issues/5175
import nodePolyfills from "vite-plugin-node-stdlib-browser";

const isDev = process.env["DFX_NETWORK"] !== "ic";

type Network = "ic" | "local";

interface CanisterIds {
  [key: string]: { [key in Network]: string };
}

let canisterIds: CanisterIds;
try {
  canisterIds = JSON.parse(fs.readFileSync(isDev ? ".dfx/local/canister_ids.json" : "./canister_ids.json").toString());
} catch (e) {
  console.error("\n⚠️  Before starting the dev server run: dfx deploy\n\n");
}

// List of all aliases for canisters
// This will allow us to: import { canisterName } from "canisters/canisterName"
const aliases = Object.entries(dfxJson.canisters).reduce((acc, [name, _value]) => {
  // Get the network name, or `local` by default.
  const networkName = process.env["DFX_NETWORK"] ?? "local";
  const outputRoot = path.join(__dirname, ".dfx", networkName, "canisters", name);

  return {
    ...acc,
    ["canisters/" + name]: path.join(outputRoot, "index" + ".js"),
  };
}, {});

// Generate canister ids, required by the generated canister code in .dfx/local/canisters/*
// This strange way of JSON.stringifying the value is required by vite
const canisterDefinitions = Object.entries(canisterIds).reduce(
  (acc, [key, val]) => ({
    ...acc,
    [`process.env.${key.toUpperCase()}_CANISTER_ID`]: isDev ? JSON.stringify(val.local) : JSON.stringify(val.ic),
  }),
  {},
);

// Gets the port dfx is running on from dfx.json
const DFX_PORT = dfxJson.networks.local.bind.split(":")[1];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {

    build: {
      rollupOptions: {
        /**
         * Ignore "use client" waning since we are not using SSR
         * @see {@link https://github.com/TanStack/query/pull/5161#issuecomment-1477389761 Preserve 'use client' directives TanStack/query#5161}
         */
        onwarn(warning, warn) {
          if (
            warning.code === "MODULE_LEVEL_DIRECTIVE" &&
            warning.message.includes("use client")
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "ESNext",
      },
    },
    esbuild: {
      // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
      logOverride: { "this-is-undefined-in-esm": "silent" },
    },
    plugins: [
      nodePolyfills(),
      react({
        include: "**/*.tsx",
        babel: {
          plugins: ["babel-plugin-twin", "babel-plugin-macros", "babel-plugin-styled-components"],
          ignore: ["\x00commonjsHelpers.js"], // Weird babel-macro bug fix
        },
      }),
      svgrPlugin(),
      viteTsconfigPaths(),
    ],
    resolve: {
      alias: {
        // Here we tell Vite the "fake" modules that we want to define
        ...aliases,
      },
    },
    server: {
      fs: {
        allow: ["."],
      },
      proxy: {
        // This proxies all http requests made to /api to our running dfx instance
        "/api": {
          target: `http://0.0.0.0:${DFX_PORT}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
      },
      port: 3000,
    },
    define: {
      // Here we can define global constants
      // This is required for now because the code generated by dfx relies on process.env being set
      ...canisterDefinitions,
      "process.env.NODE_ENV": JSON.stringify(isDev ? "development" : "production"),
      ...Object.keys(env).reduce((prev, key) => {
        prev[`process.env.${key}`] = JSON.stringify(env[key]);
        return prev;
      }, {}),
      // global: "window",
    },
  };
});
