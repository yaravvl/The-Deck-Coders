import express from "express";
import { Character, Movie, Quote } from "../types";
import { addExp, calculateExp10, calculateSuddenDeath, calculateTimedQuiz } from "../experience";
import { addQuoteToBlacklist, addQuoteToFavorites, updateProfile } from "../database";
import { generateRandomNumber } from "../utilities";
import { getCharactersWithQuotes } from "./landingsPageRouter";

let selectedCharacter: Character;
let selectedQuote: Quote;

export default function quizRouter() {
    const router = express.Router();
    router.get("/", async (req, res) => {
        if (!req.session.characters) {
            const characters = await getCharactersWithQuotes();
            req.session.characters = characters
        }
        res.render("quiz", {
            title: "Quiz"
        })
    })

    router.get("/10-rounds", async (req, res) => {
        let showMenu = false;
        console.log(req.session.characters)
        if (!req.session.tRStarted) {
            req.session.userCurrentQuestion = 1;
            req.session.userCurrentScore = 0;
        }
        req.session.sDStarted = false;
        req.session.tQStarted = false;
        req.session.tRStarted = true;
        let quizTeam: Character[] = [];
        if (req.session.characters) {
            quizTeam = await generateTeam(req.session.characters);
        }
        let blackListedQuote: Quote | undefined
        do {
            await generatedSelectedCharacter(quizTeam, quizTeam.length);
            blackListedQuote = req.session.user?.blacklistedQuotes.find((e) => {
                return e.id === selectedQuote.id
            })
        } while (blackListedQuote !== undefined)
        // quizTeam.forEach((e) => {
        //     console.log(e.name)
        // })
        const moviedebug = res.locals.movies.find((e: Movie) => {
            return e.id === selectedQuote.movie
        })
        // console.log(moviedebug?.name)
        // console.log(selectedCharacter.name)
        if (req.session.userCurrentQuestion! === 11) {
            req.session.userCurrentQuestion = 10
            req.session.tRStarted = false
            showMenu = true
            addExp(req.session.user!, calculateExp10(req.session.userCurrentScore!))
            if (req.session.user?.tenRoundsHs! < req.session.userCurrentScore!) {
                req.session.user!.tenRoundsHs! = req.session.userCurrentScore!
            }
            await updateProfile(req.session.user)
        }

        res.render("10-rounds", {
            characters: quizTeam,
            movies: res.locals.movies,
            selectedCharacter: selectedCharacter,
            selectedQuote: selectedQuote,
            userCurrentQuestion: req.session.userCurrentQuestion || 1,
            userCurrentScore: req.session.userCurrentScore || 0,
            favoritedQuotes: req.session.favoritedQuotes || [],
            showMenu: showMenu,
            receivedExp: calculateExp10(req.session.userCurrentScore!),
            mvdebug: moviedebug?.name, //DEBUG VERWIJDER LATER
            chardebug: selectedCharacter.name //DEUG
        })
    });

    router.post("/10-rounds/next", async (req, res) => {
        const character_id = req.body.character_id
        const movie_id = req.body.movie_id
        const choice_quote = req.body.quote_choice
        const blacklist_reason = req.body.blacklist_reason
        console.log(selectedQuote.dialog)

        if (choice_quote === "favorited") {
            await addQuoteToFavorites(selectedQuote, req.session.user!)
        } else if (choice_quote === "blacklist") {
            await addQuoteToBlacklist(selectedQuote, req.session.user!, blacklist_reason)
            // const foundCharacter = req.session.characters?.find((e) => {
            //     return e._id === character_id
            // })
            // if (foundCharacter) {
            //     foundCharacter.quotes = foundCharacter.quotes.filter((e) => {
            //         e._id !== selectedQuote._id
            //     })
            // }
        } else {
        }

        if (req.session.userCurrentQuestion === undefined) {
            req.session.userCurrentQuestion = 1;
        }
        if (req.session.userCurrentScore === undefined) {
            req.session.userCurrentScore = 0
        }

        if (selectedQuote.movie === movie_id && selectedQuote.character === character_id) {
            req.session.userCurrentScore += 1;
            console.log("antwoord is juist")
        } else {
            console.log("antwoord is fout")
        }
        req.session.userCurrentQuestion += 1;
        if (req.session.userCurrentQuestion === 10) {
            console.log(req.session.userCurrentScore)
        }
        req.session.save(() => {
            res.redirect("/quiz/10-rounds")
        })

    });

    router.get("/timed-quiz", async (req, res) => {
        let showMenu = false;
        if (!req.session.tQStarted) {
            req.session.userCurrentQuestion = 1;
            req.session.userCurrentScore = 0;
            req.session.time = 30
        }
        req.session.sDStarted = false;
        req.session.tQStarted = true;
        req.session.tRStarted = false;
        let quizTeam: Character[] = []
        if (req.session.characters) {
            quizTeam = await generateTeam(req.session.characters);
        }
        let blackListedQuote: Quote | undefined
        do {
            await generatedSelectedCharacter(quizTeam, quizTeam.length);
            blackListedQuote = req.session.user?.blacklistedQuotes.find((e) => {
                return e.id === selectedQuote.id
            })
        } while (blackListedQuote !== undefined)
        // quizTeam.forEach((e) => {
        //     console.log(e.name)
        // })

        const moviedebug = res.locals.movies.find((e: Movie) => {
            return e.id === selectedQuote.movie
        })
        // console.log(moviedebug?.name)
        // console.log(selectedCharacter.name)
        let exp: number = 0
        if (req.session.time! <= 0) {
            req.session.tQStarted = false
            showMenu = true
            exp = calculateTimedQuiz(req.session.userCurrentScore!)
            addExp(req.session.user!, exp)
            if (req.session.user?.timedQuizHs! < req.session.userCurrentScore!) {
                req.session.user!.timedQuizHs! = req.session.userCurrentScore!
            }
            req.session.userCurrentQuestion = req.session.userCurrentQuestion! - 1
            await updateProfile(req.session.user)
        }

        res.render("timed-quiz", {
            title: "Timed quiz",
            characters: quizTeam,
            movies: res.locals.movies,
            selectedCharacter: selectedCharacter,
            selectedQuote: selectedQuote,
            userCurrentQuestion: req.session.userCurrentQuestion,
            userCurrentScore: req.session.userCurrentScore || 0,
            favoritedQuotes: req.session.favoritedQuotes || [],
            showMenu: showMenu,
            receivedExp: exp,
            time: req.session.time,
            mvdebug: moviedebug?.name, //DEBUG VERWIJDER LATER
            chardebug: selectedCharacter.name //DEUG
        })
    })

    router.post("/timed-quiz/next", async (req, res) => {
        const character_id = req.body.character_id
        const movie_id = req.body.movie_id
        const choice_quote = req.body.quote_choice
        const blacklist_reason = req.body.blacklist_reason
        const time_left = req.body.timer

        if (choice_quote === "favorited") {
            await addQuoteToFavorites(selectedQuote, req.session.user!)
        } else if (choice_quote === "blacklist") {
            await addQuoteToBlacklist(selectedQuote, req.session.user!, blacklist_reason)
            const foundCharacter = req.session.characters?.find((e) => {
                return e._id === character_id
            })
            if (foundCharacter) {
                foundCharacter.quotes = foundCharacter.quotes.filter((e) => {
                    e._id !== selectedQuote._id
                })
            }
        } else {
        }

        if (req.session.userCurrentQuestion === undefined) {
            req.session.userCurrentQuestion = 1;
        }
        if (req.session.userCurrentScore === undefined) {
            req.session.userCurrentScore = 0
        }

        if (selectedQuote.movie === movie_id && selectedQuote.character === character_id) {
            req.session.userCurrentScore += 1;
            console.log("antwoord is juist")
        } else {
            console.log("antwoord is fout")
            req.session.gameOver = true;
        }
        req.session.userCurrentQuestion += 1;
        req.session.time = time_left
        req.session.save(() => {
            res.redirect("/quiz/timed-quiz")
        })

    })

    router.get("/sudden-death", async (req, res) => {
        let showMenu = false;
        if (!req.session.sDStarted) {
            req.session.userCurrentQuestion = 1;
            req.session.userCurrentScore = 0;
        }
        req.session.sDStarted = true;
        req.session.tQStarted = false;
        req.session.tRStarted = false;
        let quizTeam: Character[] = []
        if (req.session.characters) {
            quizTeam = await generateTeam(req.session.characters);
        }
        let blackListedQuote: Quote | undefined
        do {
            await generatedSelectedCharacter(quizTeam, quizTeam.length);
            blackListedQuote = req.session.user?.blacklistedQuotes.find((e) => {
                return e.id === selectedQuote.id
            })
        } while (blackListedQuote !== undefined)
        // quizTeam.forEach((e) => {
        //     console.log(e.name)
        // })
        const moviedebug = res.locals.movies.find((e: Movie) => {
            return e.id === selectedQuote.movie
        })
        // console.log(moviedebug?.name)
        // console.log(selectedCharacter.name)
        let exp: number = 0
        if (req.session.gameOver && req.session.user && req.session.userCurrentScore && req.session.userCurrentQuestion) {
            req.session.sDStarted = false
            showMenu = true
            exp = calculateSuddenDeath(req.session.userCurrentScore)
            addExp(req.session.user!, exp)
            if (req.session.user.suddenDeathHs! < req.session.userCurrentScore) {
                req.session.user.suddenDeathHs! = req.session.userCurrentScore
            }
            req.session.userCurrentQuestion = req.session.userCurrentQuestion - 1
            await updateProfile(req.session.user)
            req.session.gameOver = false;
        } else {
            throw new Error("Session invalid")
        }

        res.render("sudden-death", {
            title: "Sudden death",
            characters: quizTeam,
            movies: res.locals.movies,
            selectedCharacter: selectedCharacter,
            selectedQuote: selectedQuote,
            userCurrentQuestion: req.session.userCurrentQuestion,
            userCurrentScore: req.session.userCurrentScore || 0,
            favoritedQuotes: req.session.favoritedQuotes || [],
            showMenu: showMenu,
            receivedExp: exp,
            mvdebug: moviedebug?.name, //DEBUG VERWIJDER LATER
            chardebug: selectedCharacter.name //DEUG
        })
    })

    router.post("/sudden-death/next", async (req, res) => {
        const character_id = req.body.character_id
        const movie_id = req.body.movie_id
        const choice_quote = req.body.quote_choice
        const blacklist_reason = req.body.blacklist_reason
        console.log(selectedQuote.dialog)

        if (choice_quote === "favorited") {
            await addQuoteToFavorites(selectedQuote, req.session.user!)
        } else if (choice_quote === "blacklist") {
            await addQuoteToBlacklist(selectedQuote, req.session.user!, blacklist_reason)
            const foundCharacter = req.session.characters?.find((e) => {
                return e._id === character_id
            })
            if (foundCharacter) {
                foundCharacter.quotes = foundCharacter.quotes.filter((e) => {
                    e._id !== selectedQuote._id
                })
            }
        } else {
        }

        if (req.session.userCurrentQuestion === undefined) {
            req.session.userCurrentQuestion = 1;
        }
        if (req.session.userCurrentScore === undefined) {
            req.session.userCurrentScore = 0
        }

        if (selectedQuote.movie === movie_id && selectedQuote.character === character_id) {
            req.session.userCurrentScore += 1;
            console.log("antwoord is juist")
        } else {
            console.log("antwoord is fout")
            req.session.gameOver = true;
        }
        req.session.userCurrentQuestion += 1;
        req.session.save(() => {
            res.redirect("/quiz/sudden-death")
        })

    })

    return router;
}

async function generatedSelectedCharacter(selectedTeam: Character[], number: number) {
    const randomNum = generateRandomNumber(number);
    selectedCharacter = selectedTeam[randomNum];

    const selectedQuoteIndex = generateRandomNumber(selectedCharacter.quotes.length);
    selectedQuote = selectedCharacter.quotes[selectedQuoteIndex];
    
    // console.log("Debug;" + selectedQuoteIndex, selectedCharacter.quotes.length - 1)
}

async function generateTeam(characters: Character[]): Promise<Character[]> {
    //Hier de check uitvoeren voor de blacklisted quotes weg te halen
    //Doe de characters maar in de session variabelen.
    const usedNumbers: number[] = [];
    const team: Character[] = [];
    let randomNum = -1;

    while (team.length < 3) {
        randomNum = generateRandomNumber(characters.length);

        //Dit is een check om te kijken of de nieuw gemaakte nummer al eens is gebruikt geweest met het maken van dit team.
        if (!usedNumbers.includes(randomNum)) {
            const character = characters[randomNum];
            usedNumbers.push(randomNum);
            team.push(character);
        }
    }
    // console.log(team.map((e) => e.name))
    return team;
}

