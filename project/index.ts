import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Character, Quote } from "./types";
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


function generateRandomNumber(max: number): number {
    return Math.floor(Math.random() * max) + 1;
}

function generateTeam() {
    let randomNum = -1;
    for (let index = 0; index < 3; index++) {
        randomNum = generateRandomNumber(CHARACTERS.length);
        const character = CHARACTERS[randomNum];
        quizTeam.push(character);
    }
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

let randomNum = -1;

app.get("/", (req, res) => {
    res.render("landingpage")
});

app.get("/:index", (req, res) => {
    generateTeam();

    let index: string = req.params.index
    const expPercentage: number = ExpPercentage(player)

    res.render(index, {
        title: index.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        player: player,
        exp_progress: expPercentage,
        characters: quizTeam
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
});