const env = require("./config/env");

module.exports = {
  schema: "./db/schema.js",

  out: "./drizzle",

  dialect: "postgresql",

  dbCredentials: {
    url: env.databaseUrl,
  },

  strict: true,

  verbose: true,
};