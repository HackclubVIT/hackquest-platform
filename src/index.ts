import bcrypt from "bcrypt";
import SqliteStoreFactory from "better-sqlite3-session-store";
import Express, { urlencoded } from "express";
import session from "express-session";
import https from "https";
import { Liquid } from "liquidjs";
import { Config } from "./config";
import { db } from "./db";
import { hasRegisteredOnVITCEvents, isYupErr, signInSchema, signUpSchema } from "./validation";
import { readFileSync } from "fs";
import { base64Image, cache } from "./util";

Config.validate();
const config = Config.instance;

const app = Express();

app.use(urlencoded({ extended: true }));

app.engine("liquid", new Liquid().express());
app.set("views", "./views");
app.set("view engine", "liquid");

if (config.prod) app.set("trust proxy", 1);

const SqliteStore = SqliteStoreFactory(session);

app.use(
    session({
        store: new SqliteStore({
            client: db,
            expired: {
                clear: true,
                intervalMs: 1000 * 60 * 60 * 24 * 3,
            },
        }),
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: config.prod,
            maxAge: 1000 * 60 * 60 * 24 * 3,
            sameSite: "lax",
            httpOnly: true,
        },
    })
);

app.get("/", (req, res) => {
    const username = req.session?.username;
    res.render("index", { username });
});

app.get("/signup", (req, res, next) => {
    if (req.session?.username) return res.redirect("/");
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const { email, username, password } = signUpSchema.validateSync(req.body);

        if (!hasRegisteredOnVITCEvents(email))
            return res.render("signup", { error: "You have not registered on VIT Chennai Events" });

        const user = db
            .prepare("SELECT * FROM users WHERE email = ? OR username = ?")
            .get(email, username);
        if (user) return res.render("signup", { error: "Email or username already in use" });

        const hashedPassword = await bcrypt.hash(password, 10);

        db.prepare("INSERT INTO users (email, username, password) VALUES (?, ?, ?)").run(
            email,
            username,
            hashedPassword
        );

        req.session.username = username;

        res.redirect("/");
    } catch (err) {
        if (isYupErr(err)) return res.render("signup", { error: err.message });
        return res.render("signup", { error: "Something went wrong" });
    }
});

app.get("/signin", (req, res) => {
    if (req.session?.username) return res.redirect("/");
    res.render("signin");
});

app.post("/signin", async (req, res) => {
    try {
        const { username, password } = signInSchema.validateSync(req.body);

        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

        if (!user) return res.render("signin", { error: "User does not exist" });

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) return res.render("signin", { error: "Invalid password" });

        req.session.username = username;

        res.redirect("/");
    } catch (err) {
        if (isYupErr(err)) return res.render("signin", { error: err.message });
        return res.render("signin", { error: "Something went wrong" });
    }
});

app.get("/play", async (req, res) => {
    const username = req.session?.username;
    if (!username) return res.redirect("/");

    const question = db
        .prepare(
            "SELECT * FROM questions WHERE level = (SELECT level from users WHERE username = ?)"
        )
        .get(username);

    if (!question) return res.render("play", { username, completed: true });

    const text = question.question;
    const image = await base64Image(`${config.questionsBasePath}${question.image}`);
    const level = question.level;

    res.render("play", { username, level, text, image });
});

app.post("/play", (req, res) => {
    const username = req.session?.username;
    if (!username) return res.redirect("/");

    const { level } = db.prepare("SELECT level FROM users WHERE username = ?").get(username);

    const question = db.prepare("SELECT * FROM questions WHERE level = ?").get(level);

    if (question?.answer !== req.body.answer)
        return res.render("play", { username, question, error: "Wrong answer" });

    db.prepare("UPDATE users SET level = level + 1 WHERE username = ?").run(username);
    db.prepare("UPDATE users SET level_reached_at = ? WHERE username = ?").run(
        Date.now(),
        username
    );

    res.redirect("/play");
});

const leaderboardCache = cache(
    () =>
        db
            .prepare("SELECT username FROM users ORDER BY level DESC, level_reached_at ASC")
            .all()
            .map(user => user.username),
    config.leaderboardCacheTime
);
app.get("/leaderboard", (req, res) => {
    const username = req.session?.username;
    const leaderboard = leaderboardCache();
    res.render("leaderboard", { username, leaderboard });
});

app.get("/signout", (req, res) =>
    req.session.destroy(() => {
        res.redirect("/");
    })
);

app.use(Express.static("public"));

if (config.prod) {
    const server = https.createServer(
        {
            key: readFileSync(config.sslKeyPath),
            cert: readFileSync(config.sslCertPath),
        },
        app
    );

    server.listen(443, () => {
        console.log(`Listening on port 443`);
    });
} else {
    app.listen(9000, () => {
        console.log(`Listening on port 9000`);
    });
}
