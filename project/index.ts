import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Character } from "./types";
import { addExp, ExpPercentage } from "./public/javascript/experience";
import { createPlayer, connect, addUser, checkExistingPlayer } from "./public/javascript/database";

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
    const expPercentage: number = 0
    res.render(index, {
        title: index.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        // player: player,
        exp_progress: expPercentage
    })
});

// app.post('/exp-test', (req, res) => {
//     player = addExp(player, 50)
//     console.log(player)
//     res.redirect('/account-settings')
// })

app.get("/register", (req, res) => {
    res.redirect("register");
  });

app.post("/register", async (req, res) => {
  let email: string = req.body.email;
  let username: string = req.body.username;
  let password: string = req.body.password;
  let image_url: string = req.body.profile_picture;
  if (!(await checkExistingPlayer(email, username))) {
    await addUser(createPlayer(username, password, email, image_url))
    res.redirect("quiz")
  } else {
    return res.status(400).json({ message: "Username or email already exists." });
  }
});

app.listen(app.get("port"), async() => {
    console.log("Server started on http://localhost:" + app.get("port"));
    await connect();
});