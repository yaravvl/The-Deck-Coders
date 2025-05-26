import express from "express";
import { find10Highscores, findSdHighscores, findTqHighscores } from "../database";

export default function highscoresRouter() {
    const router = express.Router();

    router.get("/highscores", async (req, res) => {
        const tenRounds = await find10Highscores()
        const suddenDeath = await findSdHighscores()
        const timedQuiz = await findTqHighscores()
        res.render("highscores", {
            title: "Highscores",
            tenRounds,
            suddenDeath,
            timedQuiz
        })
    })

    return router;
}