export class Config {
    private static _instance: Config | undefined;

    private static validated = false;

    public readonly sessionSecret: string;
    public readonly dbPath: string;
    public readonly sslKeyPath: string;
    public readonly sslCertPath: string;
    public readonly leaderboardCacheTime: number;
    public readonly questionsBasePath: string;
    public readonly registeredUsersPath: string;
    public readonly waiting: boolean;
    public readonly frozen: boolean;

    public readonly prod = process.env.NODE_ENV === "production";

    private constructor() {
        this.sessionSecret = process.env.SESSION_SECRET!;

        this.dbPath = process.env.DB_PATH!;

        this.sslKeyPath = process.env.SSL_KEY_PATH!;

        this.sslCertPath = process.env.SSL_CERT_PATH!;

        this.leaderboardCacheTime = parseInt(process.env.LEADERBOARD_CACHE_TIME!);

        this.questionsBasePath = process.env.QUESTIONS_BASE_PATH!;

        this.registeredUsersPath = process.env.REGISTERED_USERS_PATH!;

        this.waiting = process.env.ALLOW_TO_PLAY === "false";

        this.frozen = process.env.FROZEN === "true";
    }

    static get instance() {
        if (!this.validated) throw new ConfigError("Config not validated. Call Config.validate()");
        return (this._instance ||= new Config());
    }

    static validate() {
        if (this.validated) return;
        if (!process.env.SESSION_SECRET) throw new ConfigError("SESSION_SECRET is not set");
        if (!process.env.DB_PATH) throw new ConfigError("DB_PATH is not set");
        if (!process.env.SSL_KEY_PATH) throw new ConfigError("SSL_KEY_PATH is not set");
        if (!process.env.SSL_CERT_PATH) throw new ConfigError("SSL_CERT_PATH is not set");
        if (!process.env.LEADERBOARD_CACHE_TIME)
            throw new ConfigError("LEADERBOARD_CACHE_TIME is not set");
        if (!process.env.QUESTIONS_BASE_PATH)
            throw new ConfigError("QUESTIONS_BASE_PATH is not set");
        if (!process.env.REGISTERED_USERS_PATH)
            throw new ConfigError("REGISTERED_USERS_PATH is not set");
        if (process.env.ALLOW_TO_PLAY !== "true" && process.env.ALLOW_TO_PLAY !== "false")
            throw new ConfigError("ALLOW_TO_PLAY must be set to either true or false");
        if (process.env.FROZEN !== "true" && process.env.FROZEN !== "false")
            throw new ConfigError("FROZEN must be set to either true or false");

        this.validated = true;
    }
}

class ConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConfigError";
    }
}
