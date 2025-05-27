import express from "express";
import bcrypt from 'bcrypt';
import { loggedIn } from "../secureMiddleware";
import { PlayerInfo } from "../types";
import { addUser, checkExistingPlayer, checkLogin, createPlayer, updateProfile } from "../database";

export default function loginRouter() {
    const router = express.Router();

    router.get("/login", (req, res) => {
        res.render("login", {
            error: null
        })
    });

    router.post("/login", async (req, res) => {
        let username: string = req.body.username;
        let password: string = req.body.password;
        let userExists: PlayerInfo | undefined = await checkLogin(username, password)
        if (!userExists) {
            return res.render("login", {
                error: "Gebruikersnaam of wachtwoord is onjuist."
            })
        }
        req.session.user = userExists
        res.redirect("/welcomepage")
    });

    router.get("/register", (req, res) => {
        res.render("register", {
            error: null
        });
    });

    router.post("/register", async (req, res) => {
        let email: string = req.body.email;
        let username: string = req.body.username;
        let password: string = req.body.password;
        let image_url: string = req.body.profile_picture;
        const hashedPassword: string = await bcrypt.hash(password, 10)
        if (!(await checkExistingPlayer(email, username))) {
            await addUser(createPlayer(username, hashedPassword, email, image_url))
            res.redirect("/quiz")
        } else {
            return res.render("register", {
                error: "Username or email already exists!"
            })
        }
    });


    router.post("/logout", async (req, res) => {
        await updateProfile(req.session.user)
        req.session.destroy(() => {
            res.redirect("/login")
        })
    })

    return router;
}