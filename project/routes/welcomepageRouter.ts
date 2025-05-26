import express from "express";

export default function welcomepageRouter() {
    const router = express.Router();

    router.get("/welcomepage", (req, res) => {
        res.render("welcomepage", {
            title: "Welcomepage"
        })
    })

    return router;
}
