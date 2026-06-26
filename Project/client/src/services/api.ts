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

// ---------------- Weekly Stats ----------------
export async function getWeekStats() {

    try {

        const response = await fetch(
            `${API_URL}/stats/week`
        );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch weekly stats"
            );
        }

        return await response.json();

    } catch (err) {

        console.error(err);

        return [];
    }
}

// ---------------- Two Weeks Stats ----------------
export async function getTwoWeeksStats() {

    try {

        const response = await fetch(
            `${API_URL}/stats/two-weeks`
        );

        if (!response.ok) {

            throw new Error(
                "Failed to fetch two weeks stats"
            );
        }

        return await response.json();

    } catch (err) {

        console.error(err);

        return [];
    }
}

export async function getMonthStats() {

    try {

        const response = await fetch(
            `${API_URL}/stats/month`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch monthly stats");
        }

        return await response.json();

    } catch (err) {

        console.error(err);

        return [];
    }
}

// ---------------- Authentication ----------------

export async function login(
  username: string,
  password: string
) {

  const response = await fetch(
    `${API_URL}/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        username,
        password
      })
    }
  );

  return response.json();

}

export async function register(
  username: string,
  password: string
) {

  const response = await fetch(
    `${API_URL}/register`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        username,
        password
      })
    }
  );

  return response.json();

}

// ---------------- Device Status ----------------

export async function getDeviceStatus() {

    try {

        const response = await fetch(
            `${API_URL}/devicestatus`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to fetch device status"
            );
        }

        return await response.json();

    } catch (err) {

        console.error(err);

        return null;
    }
}
