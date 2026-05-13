const API_URL = "http://localhost:3000/api";

// Fetches a ocupação atual do local
export async function getCurrentOccupancy() {
    try {
        const response = await fetch(`${API_URL}/occupancy`);

        if (!response.ok) {
            throw new Error(
                `Failed to fetch current occupancy with status: ${response.status}`
            );
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching current occupancy:", error);
        return null;
    }
}

// Fetches o status do sistema (online/offline)
export async function getSystemStatus() {
    try {
        const response = await fetch(`${API_URL}/status`);

        if (!response.ok) {
            throw new Error(
                `Failed to fetch system status with status: ${response.status}`
            );
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching system status:", error);
        return null;
    }
}

// Fetches eventos para um dia específico (ou todos se date for null)
export async function getEvents(date = null) {
    try {
        const url = `${API_URL}/events`;

        if (date) {
            url += `?date=${date}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Failed to fetch events with status: ${response.status}`
            );
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

// Fetches estatísticas de hora em hora para o dia atual
export async function getHourlyStats() {
    try {
        const response = await fetch(
            `${API_URL}/stats/hourly`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch hourly statistics with status: ${response.status}`
            );
        }

        return await response.json();

    } catch (err) {
        console.error("Error fetching hourly statistics:", err);
        return [];
    }
}

// Fetches estatísticas diárias de ocupação
export async function getDailyStats() {
    try {
        const response = await fetch(
            `${API_URL}/stats/daily`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch daily statistics with status: ${response.status}`
            );
        }

        return await response.json();

    } catch (err) {
        console.error("Error fetching daily statistics:", err);
        return [];
    }
}


