import express from "express";
import bcrypt from "bcrypt";

import { db } from "../database.js";

const router = express.Router();

//
// REGISTER
//
router.post("/register", async (req, res) => {

    const { username, password } = req.body;

    try {

        const hash = await bcrypt.hash(password, 10);

        db.prepare(`
            INSERT INTO users(username,password)
            VALUES (?,?)
        `).run(username, hash);

        res.json({
            success: true
        });

    } catch (err) {

        res.json({
            success: false
        });

    }

});

//
// LOGIN
//
router.post("/login", async (req, res) => {

    const { username, password } = req.body;

    const user = db.prepare(`
        SELECT *
        FROM users
        WHERE username = ?
    `).get(username);

    if (!user) {

        return res.json({
            success: false
        });

    }

    const valid = await bcrypt.compare(
        password,
        user.password
    );

    res.json({
        success: valid
    });

});

export default router;