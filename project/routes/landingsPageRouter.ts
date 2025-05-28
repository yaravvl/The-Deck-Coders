import express from "express";
import { Character, Quote } from "../types";

let QUOTES: Quote[] = [];
let CHARACTERS: Character[] = [];

export default function landingPageRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            const characters = await getCharactersWithQuotes();
            req.session.characters = characters
        } catch (e) {
            console.log(e)
        }
        // console.log(req.session.characters) //debug
        res.render("landingpage")
    });

    return router;
}

async function fetchQuotes(headers: any): Promise<Quote[]> {
    if (QUOTES.length > 0 ) {
        return QUOTES
    };

    const res = await fetch("https://the-one-api.dev/v2/quote", { headers });
    if (!res.ok) {
        throw new Error(`Quote fetch failed: ${res.status}`)
    };

    const data = await res.json();
    QUOTES = data.docs;
    return QUOTES;
}

async function fetchCharacters(headers: any): Promise<Character[]> {
    if (CHARACTERS.length > 0 ) {
        return CHARACTERS
    };

    const charactersResponse = await fetch("https://the-one-api.dev/v2/character", { headers });
        if (!charactersResponse.ok) {
            throw new Error(`Er is iets misgelopen met het ophalen van de characters: ${charactersResponse.status}`);
        }
    const data = await charactersResponse.json();
    CHARACTERS = data.docs
    return CHARACTERS;
}

export async function getCharactersWithQuotes(): Promise<Character[]> {
    try {
        //Dit is momenteel gewoon mijn bearer-token we kunnen zien of we dit houden of later nog dynamisch willen aanpassen per log-in account
        const headers = {
            authorization: process.env.BEARER ?? ""
        };

        //Alle quotes ophalen
        await fetchQuotes(headers)

        //Alle  unieke character id's van de quotes bijhouden in een set
        const characterIdsWithQuotes = new Set(
            QUOTES!.map((quote: Quote) => quote.character)
        );

        //Alle characters ophalen
        const charactersData = await fetchCharacters(headers);

        //Dit is om een lijst te maken met alle id's die toegelaten zijn van de api
        const localIdsResponse = await fetch("http://localhost:3000/data/lotr_characters_with_quotes.json");
        if (!localIdsResponse.ok) {
            throw new Error("Failed to fetch local character IDs");
        };
        const localIdsData = await localIdsResponse.json();
        const allowedIds = new Set(localIdsData.map((char: { id: string }) => char.id));

        //Alle characters filteren die minstens 1 movie-quote hebben
        const filteredChar = charactersData.filter((character: Character) =>
            characterIdsWithQuotes.has(character._id) && allowedIds.has(character._id)
        );

        //Alle quotes die een character heeft bijhouden in hun property quotes
        //Enkel quotes bijhouden die minder dan of net 50 tekens bevatten
        for (const char of filteredChar) {
            char.quotes = QUOTES!.filter((quote: Quote) => quote.character === char._id && quote.dialog.length <= 50);
        }

        return filteredChar
        //Alle characters filteren zodat enkel de characters overblijven die in de json file zitten

        // for (const character of CHARACTERS) {
        //     console.log(character.name)
        // }

    } catch (error) {
        console.error(`Error: ${error}`);
        return [];
    }
}