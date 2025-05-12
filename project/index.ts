import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";

import { Character, PlayerInfo, Movie, Quote } from "./types";
import { addExp, ExpPercentage } from "./experience";
import { createPlayer, connect, addUser, checkExistingPlayer, checkLogin, updateProfile, findByX } from "./database";
import bcrypt from 'bcrypt';
import session from "./session";
import { secureMiddleware, loggedIn } from "./secureMiddleware";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(session)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

let CHARACTERS: Character[] = [];
// let CHARACTERS_WITHOUT_QUOTE: Character[] = [];
let QUOTES: Quote[] = [];
// let quizTeam: Character[] = [];
let selectedCharacter: Character;
let selectedQuote: Quote;
let movies: Movie[] = [];

function generateRandomNumber(max: number): number {
    return Math.floor(Math.random() * max);
}

async function generatedSelectedCharacter(number: number) {
    const randomNum = generateRandomNumber(number);
    selectedCharacter = CHARACTERS[randomNum];

    const selectedQuoteIndex = generateRandomNumber(selectedCharacter.quotes.length);
    selectedQuote = selectedCharacter.quotes[selectedQuoteIndex];
    console.log("Debug;" + selectedQuoteIndex, selectedCharacter.quotes.length - 1)
}

async function generateTeam(): Promise<Character[]> {
    const usedNumbers: number[] = [];
    const team: Character[] = [];
    let randomNum = -1;

    while (team.length < 3) {
        randomNum = generateRandomNumber(CHARACTERS.length);

        //Dit is een check om te kijken of de nieuw gemaakte nummer al eens is gebruikt geweest met het maken van dit team.
        if (!usedNumbers.includes(randomNum)) {
            const character = CHARACTERS[randomNum];
            usedNumbers.push(randomNum);
            team.push(character);
        }
    }
    console.log(team.map((e) => e.name))
    return team;
}

async function getMovies() {
    const response = await fetch("http://localhost:3000/data/movies.json");
    if (!response.ok) {
        throw new Error("Failed to fetch movies");
    }
    movies = await response.json();
}

const ERROR_MESSAGE_UPDATE_ACCOUNT = ["Het herhaalde wachtwoord is niet hetzelfde!", "Deze gebruiksnaam is al in gebruik!", "Deze email is al in gebruik!"]

async function getCharactersWithQuotes() {
    try {
        //Dit is momenteel gewoon mijn bearer-token we kunnen zien of we dit houden of later nog dynamisch willen aanpassen per log-in account
        const headers = {
            authorization: "Bearer FrpwbfRPTwxJOACKq3D_"
        };

        //Alle quotes ophalen
        const quotesResponse = await fetch("https://the-one-api.dev/v2/quote", { headers });
        if (!quotesResponse.ok) {
            throw new Error(`Er is iets misgelopen met het ophalen van de quotes: ${quotesResponse.status}`);
        }
        const quotesData = await quotesResponse.json();
        QUOTES = quotesData.docs;

        //Alle  unieke character id's van de quotes bijhouden in een set
        const characterIdsWithQuotes = new Set(
            QUOTES.map((quote: Quote) => quote.character)
        );

        //Alle characters ophalen
        const charactersResponse = await fetch("https://the-one-api.dev/v2/character", { headers });
        if (!charactersResponse.ok) {
            throw new Error(`Er is iets misgelopen met het ophalen van de characters: ${charactersResponse.status}`);
        }
        const charactersData = await charactersResponse.json();

        //Dit is om een lijst te maken met alle id's die toegelaten zijn van de api
        const localIdsResponse = await fetch("http://localhost:3000/data/lotr_characters_with_quotes.json");
        if (!localIdsResponse.ok) {
            throw new Error("Failed to fetch local character IDs");
        };
        const localIdsData = await localIdsResponse.json();
        const allowedIds = new Set(localIdsData.map((char: { id: string }) => char.id));

        //Alle characters filteren die minstens 1 movie-quote hebben
        CHARACTERS = charactersData.docs.filter((character: Character) =>
            characterIdsWithQuotes.has(character._id) && allowedIds.has(character._id)
        );

        //Alle quotes die een character heeft bijhouden in hun property quotes.
        for (const character of CHARACTERS) {
            character.quotes = QUOTES.filter((quote: Quote) => quote.character === character._id && quote.dialog.length <= 50);
        }

        //Alle characters filteren zodat enkel de characters overblijven die in de json file zitten

        for (const character of CHARACTERS) {
            console.log(character.name)
        }

    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

app.get("/register", loggedIn, (req, res) => {
    res.render("register", {
        error: null
    });
});

app.get("/login", loggedIn, (req, res) => {
    res.render("login", {
        error: null
    })
})

app.post("/login", async (req, res) => {
    console.log("Debug test", req.body);
    let username: string = req.body.username;
    let password: string = req.body.password;
    let userExists: PlayerInfo | undefined = await checkLogin(username, password)
    console.log(userExists)
    if (!userExists) {
        return res.render("login", {
            error: "Gebruikersnaam of wachtwoord is onjuist."
        })
    }
    req.session.user = userExists
    res.redirect("welcomepage")
})

app.post("/register", async (req, res) => {
    let email: string = req.body.email;
    let username: string = req.body.username;
    let password: string = req.body.password;
    let image_url: string = req.body.profile_picture;
    const hashedPassword: string = await bcrypt.hash(password, 10)
    if (!(await checkExistingPlayer(email, username))) {
        await addUser(createPlayer(username, hashedPassword, email, image_url))
        res.redirect("quiz")
    } else {
        return res.render("register", {
            error: "Username or email already exists!"
        })
    }
});

app.post("/update-account", async (req, res) => {
    if (req.session.user) {
        const user: PlayerInfo = req.session.user
        //Check of de wachtwoorden wel hetzelfde zijn
        if (req.body.password !== req.body.repeated_password) {
            return res.render("account-settings", {
                player: req.session.user,
                error: ERROR_MESSAGE_UPDATE_ACCOUNT[0]
            })
        }
        //Check of de username als is gepakt door iemand
        if (await findByX(user, req.body.username, "username")) {
            return res.render("account-settings", {
                player: req.session.user,
                error: ERROR_MESSAGE_UPDATE_ACCOUNT[1]
            })
        }
        //Check of het email al is gepakt door iemand
        if (req.body.username !== user.username && await findByX(user, req.body.username, "username")) {
            return res.render("account-settings", {
                player: req.session.user,
                error: ERROR_MESSAGE_UPDATE_ACCOUNT[2]
            })
        }
        req.session.user.imageUrl = req.body.profile_picture;
        req.session.user.name = req.body.name;
        req.session.user.email = req.body.email;
        req.session.user.username = req.body.username;
        req.session.user.password = await bcrypt.hash(req.body.password, 10);
        console.log(req.session.user)
        await updateProfile(req.session.user)
        res.render("account-settings", {
            player: req.session.user,
            error: null
        })
    }
})

app.post("/next", (req, res) => {
    const character_id = req.body.character_id
    const movie_id = req.body.movie_id
    const choice_quote = req.body.quote_choice
    console.log(character_id, movie_id, choice_quote)
    res.redirect("/10-rounds")

})

app.post("/logout", async (req, res) => {
    await updateProfile(req.session.user)
    req.session.destroy(() => {
        res.redirect("/login")
    })
})

app.get("/", (req, res) => {
    res.render("landingpage")
});

app.get("/:index", secureMiddleware, async (req, res) => {
    const quizTeam: Character[] = await generateTeam();
    await generatedSelectedCharacter(quizTeam.length);
    console
    let index: string = req.params.index
    const expPercentage: number = 0
    res.render(index, {
        title: index.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        player: req.session.user,
        exp_progress: expPercentage,
        error: null,
        characters: quizTeam,
        movies: movies,
        selectedCharacter: selectedCharacter,
        selectedQuote: selectedQuote
    })
});

app.listen(app.get("port"), async () => {
    console.log("Server started on http://localhost:" + app.get("port"));
    try {
        await getCharactersWithQuotes();
        await getMovies();
    } catch (e) {
        console.log(e)
    }
    await connect();
});

