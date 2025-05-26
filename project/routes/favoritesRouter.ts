import express from "express";
import { FavoritedQuote } from "../types";

export default function favoritesRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        const quotesByCharacter: FavoritedQuote[] = []
        req.session.user?.favoritedQuotes.forEach((quotes) => {
            const foundCharacter = req.session.characters!.find((characters) => {
                return characters._id === quotes.character
            })
            let charInArray = quotesByCharacter.find((q) => {
                return q.character._id === foundCharacter!._id
            })
            if (!charInArray) {
                charInArray = {
                    character: foundCharacter!,
                    dialog: []
                }
                quotesByCharacter.push(charInArray)
            }
            charInArray.dialog.push(quotes.dialog)
        })
        req.session.favoritedQuotes = quotesByCharacter;
        res.render("favorites", {
            title: "Favorites",
            quotes: req.session.user?.favoritedQuotes,
            sortedQuotes: quotesByCharacter
        })
    })

    router.get("/detail-pagina/:id", (req, res) => {
        const index: string = req.params.id;
        const foundCharacter: FavoritedQuote | undefined = req.session.favoritedQuotes?.find((e) => {
            return e.character._id === index
        })
        if (foundCharacter) {
            res.render("character", {
                foundCharacter,
                title: foundCharacter.character.name
            })
        }
    })

    router.post("/:id", (req, res) => {
        let index: string = req.params.id
        console.log(index)
        let findCharacter: FavoritedQuote | undefined = req.session.favoritedQuotes?.find((e) => {
            return e.dialog.includes(index)
        })
        if (findCharacter) {
            findCharacter.dialog = findCharacter.dialog.filter((e) => e !== index);
            req.session.favoritedQuotes?.forEach((e) => {
                if (e === findCharacter) {
                    e = findCharacter
                }
            })

            if (req.session.user) {
                req.session.user.favoritedQuotes = req.session.user.favoritedQuotes.filter((e) => e.dialog !== index)
            }
            else {
                throw new Error("The session.user is undefined")
            }
        }
        res.redirect("/favorites")
    })

    return router;
}