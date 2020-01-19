require("dotenv").config();

module.exports = {
  env: {
    PRISMIC_REPOSITORY: process.env.PRISMIC_REPOSITORY
  },

  experimental: {
    async rewrites() {
      return [{ source: "/", destination: "/home" }];
    }
  }
};
