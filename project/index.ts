import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { Character, PlayerInfo } from "./types";
import { addExp, ExpPercentage } from "./public/javascript/experience";
import { createPlayer, connect, addUser, checkExistingPlayer, checkLogin } from "./public/javascript/database";
import bcrypt from 'bcrypt';
import session from "./public/javascript/session";
import { secureMiddleware, loggedIn } from "./public/javascript/secureMiddleware";


dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(session)
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

app.get("/register", loggedIn, (req, res) => {
    res.render("register", {
        error: null
    });
  });

app.get("/login", loggedIn, (req, res) => {
    res.render("login", {
        error: null
    })
})

app.post("/login", async (req, res) => {
    console.log("Debug test", req.body);
    let username: string = req.body.username;
    let password: string = req.body.password;
    let userExists: PlayerInfo | undefined = await checkLogin(username, password)
    console.log(userExists)
    if (!userExists) {
        return res.render("login", {
            error: "Gebruikersnaam of wachtwoord is onjuist."
        })
    }
    req.session.user = userExists
    res.redirect("welcomepage")
})

app.post("/register", async (req, res) => {
  let email: string = req.body.email;
  let username: string = req.body.username;
  let password: string = req.body.password;
  let image_url: string = req.body.profile_picture;
  const hashedPassword : string = await bcrypt.hash(password, 10)
  if (!(await checkExistingPlayer(email, username))) {
    await addUser(createPlayer(username, hashedPassword, email, image_url))
    res.redirect("quiz")
  } else {
    return res.render("register", {
        error: "Username or email already exists!"
    })
  }
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login")
    })
})

app.get("/", (req, res) => {
    res.render("landingpage")
});

app.get("/:index", secureMiddleware, async (req, res) => {
    let index: string = req.params.index
    const expPercentage: number = 0
    res.render(index, {
        title: index.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        player: req.session.user,
        exp_progress: expPercentage,
        error: null
    })
});

app.listen(app.get("port"), async() => {
    console.log("Server started on http://localhost:" + app.get("port"));
    await connect();
});