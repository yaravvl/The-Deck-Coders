import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Character, Movie, Quote } from "./types";
import { addExp, createPlayer, ExpPercentage, PlayerInfo } from "./public/javascript/experience";


dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

let CHARACTERS: Character[] = [];
// let CHARACTERS_WITHOUT_QUOTE: Character[] = [];
let QUOTES: Quote[] = [];
let player: PlayerInfo = createPlayer();
let quizTeam: Character[] = [];
let selectedCharacter: Character;
let movies: Movie[] = [];


function generateRandomNumber(max: number): number {
    return Math.floor(Math.random() * max) + 1;
}

function generatedSelectedCharacter() {
    const randomNum = generateRandomNumber(quizTeam.length);
    selectedCharacter = quizTeam[randomNum];
}

function generateTeam() {
    const usedNumbers: number[] = [];
    let randomNum = -1;

    while (quizTeam.length < 3) {
        randomNum = generateRandomNumber(CHARACTERS.length);

        //Dit is een check om te kijken of de nieuw gemaakte nummer al eens is gebruikt geweest met het maken van dit team.
        if (!usedNumbers.includes(randomNum)) {
            const character = CHARACTERS[randomNum];
            usedNumbers.push(randomNum);
            quizTeam.push(character);
        }
    }
}

async function getMovies() {
    const response = await fetch("http://localhost:3000/data/movies.json");
    if (!response.ok) {
        throw new Error("Failed to fetch movies");
    }
    movies = await response.json();
}

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

        //Alle characters filteren die minstens 1 movie-quote hebben
        CHARACTERS = charactersData.docs.filter((character: Character) =>
            characterIdsWithQuotes.has(character._id)
        ).slice(0, 10);

        //Alle quotes die een character heeft bijhouden in hun property quotes.
        for (const character of CHARACTERS) {
            character.quotes = QUOTES.filter((quote: Quote) => quote.character === character._id && quote.dialog.length <= 50);
        }

        for (const character of CHARACTERS) {
            console.log(character.name)
        }

    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

app.get("/", (req, res) => {
    res.render("landingpage")
});

app.get("/:index", (req, res) => {
    generateTeam();
    generatedSelectedCharacter();

    let index: string = req.params.index
    const expPercentage: number = ExpPercentage(player)

    res.render(index, {
        title: index.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        player: player,
        exp_progress: expPercentage,
        characters: quizTeam,
        movies: movies,
        selectedCharacter: selectedCharacter
    })
});

app.post('/exp-test', (req, res) => {
    player = addExp(player, 50)
    console.log(player)
    res.redirect('/account-settings')
})

app.listen(app.get("port"), async () => {
    console.log("Server started on http://localhost:" + app.get("port"));
    await getCharactersWithQuotes();
    await getMovies();
});