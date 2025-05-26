import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";

import { PlayerInfo, Movie, Quote, FavoritedQuote, BlackListedQuote } from "./types";
import { connect, updateProfile, findByX, addQuoteToBlacklist, addQuoteToFavorites, getAllMovies } from "./database";
import bcrypt from 'bcrypt';
import session from "./session";
import { secureMiddleware, loggedIn } from "./secureMiddleware";
import { ReadableStreamBYOBRequest } from "stream/web";
import loginRouter from "./routes/loginRouter";
import highscoresRouter from "./routes/highscoresRouter";
import quizRouter from "./routes/quizRouter";
import landingPageRouter from "./routes/landingsPageRouter";
import updateAccountRouter from "./routes/updateAccountRouter";
import blacklistRouter from "./routes/blacklistRouter";
import favoritesRouter from "./routes/favoritesRouter";
import welcomepageRouter from "./routes/welcomepageRouter";

dotenv.config();

const app: Express = express();
const favicon = require("serve-favicon")

app.set("view engine", "ejs");
app.use(express.json());
app.use(session)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.set("port", process.env.PORT ?? 3000);

app.use(async (req, res, next) => {
    try {
        res.locals.movies = await getAllMovies();
    } catch (e: any) {
        console.log(e);
    }
    next();
})

app.use("/", landingPageRouter());
app.use("/", loginRouter());
app.use("/", secureMiddleware, welcomepageRouter());
app.use("/", secureMiddleware, highscoresRouter());
app.use("/quiz", secureMiddleware, quizRouter());
app.use("/", secureMiddleware, updateAccountRouter());
app.use("/blacklist", secureMiddleware, blacklistRouter());
app.use("/favorites", secureMiddleware, favoritesRouter());

// async function getMovies() {
//     const response = await fetch("http://localhost:3000/data/movies.json");
//     if (!response.ok) {
//         throw new Error("Failed to fetch movies");
//     }
//     const movies: Movie[] = await response.json();
//     return movies;
// }

app.listen(app.get("port"), async () => {
    console.log("Server started on http://localhost:" + app.get("port"));
    await connect();
});

