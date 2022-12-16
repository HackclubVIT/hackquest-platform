# Hackquest website

## Environment and setup

-   Node.js: Preferably v16
-   Run `yarn` in the project root to install dependencies
-   Environment variables
    -   `SESSION_SECRET`: A strong OpenSSL generated key
    -   `DB_PATH`: Path to a SQLite database
    -   `LEADERBOARD_CACHE_TIME`: Time in milliseconds to cache the leaderboard
    -   `QUESTIONS_BASE_PATH`: Path to the questions directory which should contain the images and the `questions.json` file
    -   `REGISTERED_USERS_PATH`: Path to a json file containing an array of users' email addresses registered on VIT Chennai Events.