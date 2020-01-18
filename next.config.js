require("dotenv").config();
const path = require("path");

module.exports = {
  env: {
    PRISMIC_REPOSITORY: process.env.PRISMIC_REPOSITORY
  },

  webpack(config, options) {
    config.module.rules.push({
      test: /\.graphql$/,
      include: [path.resolve(__dirname, "queries")],
      exclude: /node_modules/,
      use: [options.defaultLoaders.babel, { loader: "graphql-let/loader" }]
    });

    config.module.rules.push({
      test: /\.graphql$/,
      include: [path.resolve(__dirname, "schema")],
      exclude: /node_modules/,
      loader: "graphql-tag/loader"
    });

    return config;
  },

  experimental: {
    async rewrites() {
      return [{ source: "/", destination: "/home" }];
    }
  }
};
