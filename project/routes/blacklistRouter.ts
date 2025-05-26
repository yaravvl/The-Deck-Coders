import express from "express";
import { BlackListedQuote, Quote } from "../types";

export default function blacklistRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        const blackListedArray: BlackListedQuote[] = []
        // req.session.blackListedQuotes.forEach((e) => console.log(e.dialog)) //debug
        // console.log(req.session.user?.blacklistedQuotes)
        req.session.user?.blacklistedQuotes.forEach((quotes) => {
            let foundCharacter
            if (req.session.characters) {
                foundCharacter = req.session.characters.find((characters) => {
                    return characters._id === quotes.character
                })
            }
            let charInArray = blackListedArray.find((q) => {
                return q.character._id === foundCharacter!._id
            })
            if (!charInArray) {
                charInArray = {
                    character: foundCharacter!,
                    dialog: []
                }
                blackListedArray.push(charInArray)
            }
            charInArray.dialog.push({
                quoteText: quotes.dialog,
                blackListReason: quotes.reason!
            })
        })
        req.session.blackListedQuotes = blackListedArray;
        res.render("blacklist", {
            title: "Blacklist",
            bQ: req.session.blackListedQuotes
        })
    })

    router.post("/:id", (req, res) => {
        let index: string = req.params.id
        let findCharacter: BlackListedQuote | undefined = req.session.blackListedQuotes?.find((e) => {
            return e.dialog.find((q) => q.quoteText === index)
        })
        findCharacter?.dialog.forEach((e) => console.log(e.quoteText))
        if (findCharacter) {
            findCharacter.dialog = findCharacter.dialog.filter((e) => e.quoteText !== index);

            if (req.session.user) {
                req.session.user.blacklistedQuotes = req.session.user.blacklistedQuotes.filter((e) => e.dialog !== index)
            }
            else {
                throw new Error("The session.user is undefined")
            }
        }
        res.redirect("/blacklist")
    })

    router.get("/edit-quote/:id", (req, res) => {
        let index: string = req.params.id
        let findQuote: BlackListedQuote | undefined = req.session.blackListedQuotes?.find((e) => {
            return e.dialog.find((q) => q.quoteText === index)
        })
        if (findQuote) {
            res.render("blacklisted-quote", {
                quote: findQuote
            }
            )
        } else {
            res.redirect("/blacklist")
        }
    })

    router.post("/edit-quote/:id/update", (req, res) => {
        const index: string = req.params.id;
        let findQuote: Quote | undefined = req.session.user?.blacklistedQuotes?.find((e) => {
            return e.dialog === index;
        })
        console.log(req.body)
        if (findQuote) {
            console.log("foundq uote")
            findQuote.reason = req.body.blackListReason
        }
        res.redirect("/blacklist")
    })

    return router;
}