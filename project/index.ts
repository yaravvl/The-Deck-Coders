import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Character } from "./types";
import { addExp,  createPlayer, ExpPercentage } from "./public/javascript/experience";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

let CHARACTERS: Character[] = [];
let player = createPlayer()

async function getCharacters() {
    try {
        const response = await fetch("https://the-one-api.dev/v2/character", {
            headers: {
                //Dit is momenteel gewoon mijn bearer-token we kunnen zien of we dit houden of later nog dynamisch willen aanpassen per log-in account
                authorization: "Bearer FrpwbfRPTwxJOACKq3D_"
            }
        });

        if (!response.ok) {
            throw new Error(`Er is iets misgelopen met het ophalen van de API-data: ${response.status}`);
        }

        const data = await response.json();
        // Deze stap is er omdat de response voor alle characters in een object zit dat docs noemt. 
        CHARACTERS = data.docs;
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}


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
    getCharacters();
    console.log("Server started on http://localhost:" + app.get("port"));
});