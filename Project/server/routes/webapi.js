import express from "express";
import { db } from "../database.js";

import { lastMessageTime } from "../systemState.js";
import { getDeviceStatus } from "../deviceStatus.js";

const router = express.Router();

// Obter eventos por data
router.get("/events", (req, res) => {

    const date = req.query.date;

    const rows = db.prepare(`
        SELECT *, source
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

    const date = req.query.date;

    const rows = db.prepare(`

        SELECT

            strftime('%H', timestamp)
            AS hour,

            SUM(
                CASE
                    WHEN event = 'entry'
                    THEN 1
                    ELSE 0
                END
            ) AS entries,

            SUM(
                CASE
                    WHEN event = 'exit'
                    THEN 1
                    ELSE 0
                END
            ) AS exits

        FROM events

        WHERE date(timestamp) = ?

        GROUP BY hour

        ORDER BY hour

    `).all(date);

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

// Obter estatísticas semanais (média de ocupação por dia)
router.get("/stats/week", (req, res) => {

    const rows = db.prepare(`

        SELECT

            date(timestamp) AS day,

            AVG(people_inside) AS average_occupancy

        FROM events

        WHERE timestamp >= datetime('now', '-7 days')

        GROUP BY day

        ORDER BY day

    `).all();

    res.json(rows);
});

// Obter estatísticas de duas semanas (média de ocupação por dia)
router.get("/stats/two-weeks", (req, res) => {

    const rows = db.prepare(`

        SELECT

            date(timestamp) AS day,

            AVG(people_inside) AS average_occupancy

        FROM events

        WHERE timestamp >= datetime('now', '-14 days')

        GROUP BY day

        ORDER BY day

    `).all();

    res.json(rows);
});

// Obter estatísticas mensais (média de ocupação por dia)
router.get("/stats/month", (req, res) => {

    const rows = db.prepare(`

        SELECT

            date(timestamp) AS day,

            AVG(people_inside) AS average_occupancy

        FROM events

        WHERE timestamp >= datetime('now', '-30 days')

        GROUP BY day

        ORDER BY day

    `).all();

    res.json(rows);
});

// Obter ocupação média por hora
router.get("/stats/occupancy", (req, res) => {

    const date = req.query.date;

    const rows = db.prepare(`

        SELECT

            strftime('%H', timestamp)
            AS hour,

            AVG(people_inside)
            AS average_occupancy

        FROM events

        WHERE date(timestamp) = ?

        GROUP BY hour

        ORDER BY hour

    `).all(date);

    res.json(rows);
});

// Obter estatísticas por fonte (MQTT, LoRa)
router.get("/stats/sources", (req, res) => {
    const rows = db.prepare(`
        SELECT
            source,
            COUNT(*) as total
        FROM events
        GROUP BY source
    `).all();
    res.json(rows);
});

// Obter o estado do sistema (online/offline) com base no tempo desde a última mensagem recebida
router.get("/status", (req, res) => {

    const lastEvent = db.prepare(`
        SELECT timestamp
        FROM events
        ORDER BY timestamp DESC
        LIMIT 1
    `).get();

    if (!lastEvent) {

        return res.json({

            online: false,
            lastMessageSecondsAgo: null,
        });
    }

    const lastMessageTime =
        new Date(lastEvent.timestamp);

    const now = new Date();

    const secondsAgo = Math.floor(
        (now - lastMessageTime) / 1000
    );

    res.json({

        online: secondsAgo < 10,

        lastMessageSecondsAgo:
            secondsAgo,
    });
});

// Obter dias disponíveis
router.get("/dates", (req, res) => {

    const rows = db.prepare(`

        SELECT DISTINCT
            date(timestamp) AS day

        FROM events

        ORDER BY day DESC

    `).all();

    const dates = rows.map(
        row => row.day
    );

    res.json(dates);
});

// Obter o status do dispositivo
router.get("/devicestatus", (req, res) => {

    res.json(
        getDeviceStatus()
    );

});

// Obter meses disponíveis
router.get("/months", (req, res) => {
 
    const rows = db.prepare(`
 
        SELECT DISTINCT
            strftime('%Y-%m', timestamp) AS month
 
        FROM events
 
        ORDER BY month DESC
 
    `).all();
 
    const months = rows.map(row => row.month);
 
    res.json(months);
});
 
// Obter estatísticas de um mês específico (média de ocupação por dia)
router.get("/stats/monthly", (req, res) => {
 
    const month = req.query.month; // ex: "2026-06"
 
    if (!month) {
        return res.status(400).json({
            error: "Missing month parameter"
        });
    }
 
    const rows = db.prepare(`
 
        SELECT
 
            date(timestamp) AS day,
 
            AVG(people_inside) AS average_occupancy
 
        FROM events
 
        WHERE strftime('%Y-%m', timestamp) = ?
 
        GROUP BY day
 
        ORDER BY day
 
    `).all(month);
 
    res.json(rows);
});

export default router;