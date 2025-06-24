/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: "/",
    data: { url: "/data", static: true },
    de: { url: "/de" },
    en: { url: "/en" },
    visualizations: { url: "/visualizations" },
    /* ... */
  },
  plugins: [
    /* ... */
    [
      "snowpack-plugin-raw-file-loader",
      {
        exts: [".txt", ".md"],
      },
    ],
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
