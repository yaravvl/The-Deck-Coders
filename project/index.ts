import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Character, Quote } from "./types";
import { addExp, createPlayer, ExpPercentage } from "./public/javascript/experience";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

let CHARACTERS: Character[] = [];
let QUOTES: Quote[] = [];
let player = createPlayer();

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
            throw new Error(`Er is iets misgelopen met het ophalen van de quotes: ${charactersResponse.status}`);
        }
        const charactersData = await charactersResponse.json();

        //Alle characters filteren die minstens 1 movie-quote hebben
        CHARACTERS = charactersData.docs.filter((character: Character) =>
            characterIdsWithQuotes.has(character._id)
        );


    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

getCharactersWithQuotes();


app.get("/", (req, res) => {
    res.render("landingpage")
});

app.get("/:index", (req, res) => {
    let index: string = req.params.index
    const expPercentage: number = ExpPercentage(player)
    res.render(index, {
        title: index.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        player: player,
        exp_progress: expPercentage
    })
});

app.post('/exp-test', (req, res) => {
    player = addExp(player, 50)
    console.log(player)
    res.redirect('/account-settings')
})

app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get("port"));
});