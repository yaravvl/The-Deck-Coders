import express from "express";
import bcrypt from "bcrypt";
import { findByX, updateProfile } from "../database";
import { PlayerInfo } from "../types";
import { error } from "console";

const ERROR_MESSAGE_UPDATE_ACCOUNT = ["Het herhaalde wachtwoord is niet hetzelfde!", "Deze gebruiksnaam is al in gebruik!", "Deze email is al in gebruik!"]

export default function updateAccountRouter() {
    const router = express.Router();

    router.get("/account-settings", async (req, res) => {
        res.render("account-settings", {
            title: "Account settings",
            error: null
        })
    })

    router.post("/update-account", async (req, res) => {
        if (req.session.user) {
            const user: PlayerInfo = req.session.user
            //Check of de wachtwoorden wel hetzelfde zijn
            if (req.body.password !== req.body.repeated_password) {
                return res.render("account-settings", {
                    player: req.session.user,
                    error: ERROR_MESSAGE_UPDATE_ACCOUNT[0]
                })
            }
            //Check of de username als is gepakt door iemand
            if (await findByX(user, req.body.username, "username")) {
                return res.render("account-settings", {
                    player: req.session.user,
                    error: ERROR_MESSAGE_UPDATE_ACCOUNT[1]
                })
            }
            //Check of het email al is gepakt door iemand
            if (req.body.username !== user.username && await findByX(user, req.body.username, "username")) {
                return res.render("account-settings", {
                    player: req.session.user,
                    error: ERROR_MESSAGE_UPDATE_ACCOUNT[2]
                })
            }
            req.session.user.imageUrl = req.body.profile_picture;
            req.session.user.email = req.body.email;
            req.session.user.username = req.body.username;
            req.session.user.password = await bcrypt.hash(req.body.password, 10);
            await updateProfile(req.session.user)
            res.render("account-settings", {
                player: req.session.user,
                error: null
            })
        }
    })


    return router;
}