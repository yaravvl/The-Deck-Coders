import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Character } from "./types";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

let CHARACTERS: Character[] = [];

async function getCharacters() {
    try {
        const response = await fetch("https://the-one-api.dev/v2/character", {
            headers: {
                //Dit is momenteel gewoon mijn bearer-token we kunnen zien of we dit houden of later nog dynamisch willen aanpassen per log-in account
                authorization: "Bearer FrpwbfRPTwxJOACKq3D_"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Deze stap is er omdat de response voor alle characters in een object zit dat docs noemt. 
        CHARACTERS = data.docs;
    } catch (error) {
        console.error("Error fetching characters:", error);
    }
}


app.get("/", (req, res) => {
    res.render("landingpage")
});

app.get("/:index", (req, res) => {
    let index: string = req.params.index
    res.render(index)
});

//Fix om de error "cannot find module 'ico' te silencen"
app.get('/favico.ico', (req, res) => {
    res.sendStatus(404);
});

app.listen(app.get("port"), () => {
    getCharacters();
    console.log("Server started on http://localhost:" + app.get("port"));
});