require("dotenv").config();

import configs from "~/knexfile";
import knex from "knex";

console.log("client id db: ", process.env.CLIENT_ID);

const environment =
  process.env.NODE_ENV !== "production" ? "development" : "production";
const envConfig = configs[environment];
const db = knex(envConfig);

module.exports = db;
