import { URI } from "./database";
import session, { MemoryStore } from "express-session";
import { PlayerInfo, FavoritedQuote, BlackListedQuote, Quote, Character } from "./types";
import mongoDbSession from "connect-mongodb-session";
const MongoDBStore = mongoDbSession(session);

const mongoStore = new MongoDBStore({
    uri: URI,
    collection: "sessions",
    databaseName: "login-express",
});

declare module 'express-session' {
    export interface SessionData {
        user?: PlayerInfo;
        userCurrentQuestion: number;
        userCurrentScore: number;
        favoritedQuotes: FavoritedQuote[];
        blackListedQuotes: BlackListedQuote[];
        editQuote: BlackListedQuote[];
        allQuotes: Quote[];
        tRStarted: boolean;
        sDStarted: boolean;
        tQStarted: boolean;
        characters: Character[]
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
    store: mongoStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
});