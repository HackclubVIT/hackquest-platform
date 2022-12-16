import sqlite from "better-sqlite3";
import { readFileSync } from "fs";
import { Config } from "./config";

Config.validate();
const config = Config.instance;

export const db = sqlite(config.dbPath, { verbose: console.log });

db.pragma("journal_mode = WAL");

db.exec(readFileSync("./data/migration.sql").toString("utf-8"));

db.exec("DELETE FROM questions");

const questions = JSON.parse(
    readFileSync(`${config.questionsBasePath}/questions.json`).toString("utf-8")
) as {
    level: number;
    question: string;
    image: string;
    answer: string;
}[];

questions.forEach(({ level, question, image, answer }) =>
    db
        .prepare("INSERT INTO questions (level, question, image, answer) VALUES (?, ?, ?, ?)")
        .run(level, question, image, answer)
);
