import sqlite from "better-sqlite3";
import { readFileSync } from "fs";
import { Config } from "./config";

Config.validate();
const config = Config.instance;

export const db = sqlite(config.dbPath, { verbose: console.log });

db.exec(readFileSync("./data/migration.sql").toString("utf-8"));
