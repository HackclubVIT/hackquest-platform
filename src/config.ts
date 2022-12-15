export class Config {
    private static _instance: Config | undefined;

    private static validated = false;

    public readonly sessionSecret: string;
    public readonly dbPath: string;
    public readonly sslKeyPath: string;
    public readonly sslCertPath: string;
    public readonly leaderboardCacheTime: number;
    public readonly dbLogPath: string;
    public readonly prod = process.env.NODE_ENV === "production";

    private constructor() {
        this.sessionSecret = process.env.SESSION_SECRET!;

        this.dbPath = process.env.DB_PATH!;

        this.sslKeyPath = process.env.SSL_KEY_PATH!;

        this.sslCertPath = process.env.SSL_CERT_PATH!;

        this.leaderboardCacheTime = parseInt(process.env.LEADERBOARD_CACHE_TIME!);

        this.dbLogPath = process.env.DB_LOG_PATH!;
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
        if (!process.env.DB_LOG_PATH) throw new ConfigError("DB_LOG_PATH is not set");

        this.validated = true;
    }
}

class ConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ConfigError";
    }
}
