const API_URL = "http://localhost:3000/api";

// ---------------- Current Occupancy ----------------

export async function getCurrentOccupancy() {

    try {

        const response = await fetch(
            `${API_URL}/current`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to fetch occupancy"
            );
        }

        return await response.json();

    } catch (err) {

        console.error(err);

        return null;
    }
}

// ---------------- System Status ----------------

export async function getSystemStatus() {

    try {

        const response = await fetch(
            `${API_URL}/status`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to fetch system status"
            );
        }

        return await response.json();

    } catch (err) {

        console.error(err);

        return null;
    }
}

// ---------------- Hourly Stats ----------------
export async function getHourlyStats(
    date: string
) {

    try {

        const response = await fetch(
            `${API_URL}/stats/hourly?date=${date}`
        );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch hourly stats"
            );
        }

        return await response.json();

    } catch (err) {

        console.error(err);

        return [];
    }
}

// ---------------- Occupancy Stats ----------------
export async function getOccupancyStats(
    date: string
) {

    try {

        const response = await fetch(
            `${API_URL}/stats/occupancy?date=${date}`
        );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch occupancy stats"
            );
        }

        return await response.json();

    } catch (err) {

        console.error(err);

        return [];
    }
}

// ---------------- Available Dates ----------------
export async function getAvailableDates() {

    try {

        const response = await fetch(
            `${API_URL}/dates`
        );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch dates"
            );
        }

        return await response.json();

    } catch (err) {

        console.error(err);

        return [];
    }
}