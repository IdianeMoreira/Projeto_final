import express from "express";
import db from "../database.js";

import { lastMessageTime } from "../systemState.js";

const router = express.Router();

// Obter eventos por data
router.get("/events", (req, res) => {

    const date = req.query.date;

    const rows = db.prepare(`
        SELECT *
        FROM events
        WHERE date(timestamp) = ?
        ORDER BY timestamp ASC
    `).all(date);

    res.json(rows);
});

// Obter número atual de pessoas dentro do local
router.get("/current", (req, res) => {

    const row = db.prepare(`
        SELECT people_inside
        FROM events
        ORDER BY id DESC
        LIMIT 1
    `).get();

    res.json({
        people_inside: row?.people_inside || 0
    });
});

// Obter estatísticas (entradas e saídas) por hora
router.get("/stats/hourly", (req, res) => {

    const rows = db.prepare(`
        SELECT
            strftime('%H', timestamp) AS hour,

            SUM(
                CASE
                    WHEN event = 'entry' THEN 1
                    ELSE 0
                END
            ) AS entries,

            SUM(
                CASE
                    WHEN event = 'exit' THEN 1
                    ELSE 0
                END
            ) AS exits

        FROM events

        GROUP BY hour

        ORDER BY hour
    `).all();

    res.json(rows);
});

// Obter estatísticas diárias (média, máximo, total de entradas e saídas)
router.get("/stats/daily", (req, res) => {

    const rows = db.prepare(`
        SELECT

            date(timestamp) AS day,

            AVG(people_inside) AS avg_people_inside,

            MAX(people_inside) AS max_people_inside,

            SUM(
                CASE
                    WHEN event = 'entry' THEN 1
                    ELSE 0
                END
            ) AS total_entries,

            SUM(
                CASE
                    WHEN event = 'exit' THEN 1
                    ELSE 0
                END
            ) AS total_exits

        FROM events

        WHERE timestamp >= datetime('now', '-14 days')

        GROUP BY day

        ORDER BY day
    `).all();

    res.json(rows);
});

// Obter o estado do sistema (online/offline) com base no tempo desde a última mensagem recebida
router.get("/status", (req, res) => {

    let online = false;
    let secondsAgo = null;

    if (lastMessageTime) {

        secondsAgo = Math.floor(
            (Date.now() - lastMessageTime.getTime()) / 1000
        );

        online = secondsAgo <= 30;
    }

    res.json({
        online,
        lastMessageSecondsAgo: secondsAgo
    });
});

export default router;