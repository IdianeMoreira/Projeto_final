import { useEffect, useState } from "react";

import OccupancyChart
from "@/components/OccupancyChart";

import FlowChart
from "@/components/FlowChart";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  getCurrentOccupancy,
  getSystemStatus,
  getOccupancyStats,
  getAvailableDates,
  getHourlyStats
} from "@/services/api";

function App() {

  const [peopleInside, setPeopleInside] =
    useState(0);

  const [status, setStatus] =
    useState<any>(null);

  const [occupancyStats, setOccupancyStats] =
    useState<any[]>([]);

  const [availableDates, setAvailableDates] =
    useState<string[]>([]);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [hourlyStats, setHourlyStats] =
    useState<any[]>([]);

  useEffect(() => {

    async function fetchData() {

      const occupancy =
        await getCurrentOccupancy();

      const systemStatus =
        await getSystemStatus();

      const dates =
        await getAvailableDates();

      setAvailableDates(dates);

      if (dates.length > 0) {

        setSelectedDate(dates[0]);

        const occupancyStats =
          await getOccupancyStats(
            dates[0]
          );

        setOccupancyStats(
          occupancyStats
        );

        const hourly =
          await getHourlyStats(
            dates[0]
          );

        setHourlyStats(hourly);
      }

      if (occupancy) {

        setPeopleInside(
          occupancy.people_inside
        );
      }

      if (systemStatus) {

        setStatus(systemStatus);
      }
    }

    fetchData();

  }, []);

  async function handleDateChange(
    date: string
  ) {

    setSelectedDate(date);

    const stats =
      await getOccupancyStats(date);

    setOccupancyStats(stats);

    const hourly =
      await getHourlyStats(date);

    setHourlyStats(hourly);
  }

  return (
    <div className="
      min-h-screen
      bg-background
      p-10
    ">

      <h1 className="
        text-5xl
        font-bold
        mb-10
      ">

        Smart Occupancy Dashboard

      </h1>

      {/* TOP CARDS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-6
      ">

        <Card>

          <CardHeader>

            <CardTitle>
              Current Occupancy
            </CardTitle>

          </CardHeader>

          <CardContent>

            <p className="
              text-6xl
              font-bold
            ">

              {peopleInside}

            </p>

          </CardContent>

        </Card>

        <Card>

          <CardHeader>

            <CardTitle>
              System Status
            </CardTitle>

          </CardHeader>

          <CardContent>

            <p className="
              text-2xl
              font-semibold
            ">

              {
                status?.online
                  ? "Online"
                  : "Offline"
              }

            </p>

            <p className="mt-4">

              Last message:

              {" "}

              {
                status?.lastMessageSecondsAgo
                  != null

                  ? `${status.lastMessageSecondsAgo}s ago`

                  : "No data"
              }

            </p>

          </CardContent>

        </Card>

      </div>

      {/* OCCUPANCY CHART */}

      <div className="mt-10">

        <Card>

          <CardHeader>

            <CardTitle>
              Occupancy Over Time
            </CardTitle>

          </CardHeader>

          <CardContent>

            {/* DATE SELECTOR */}

            <div className="mb-6">

              <select

                value={selectedDate}

                onChange={(e) =>
                  handleDateChange(
                    e.target.value
                  )
                }

                className="
                  border
                  rounded-md
                  p-2
                "
              >

                {
                  availableDates.map(
                    (date) => (

                      <option
                        key={date}
                        value={date}
                      >

                        {date}

                      </option>
                    )
                  )
                }

              </select>

            </div>

            {/* CHART */}

            <OccupancyChart
              data={occupancyStats}
            />

          </CardContent>

        </Card>

      </div>

      
      <div className="mt-10">

        <Card>

          <CardHeader>

            <CardTitle>
              Entries vs Exits
            </CardTitle>

          </CardHeader>

          <CardContent>

            <FlowChart
              data={hourlyStats}
            />

          </CardContent>

        </Card>

      </div>

    </div>
  );
}

export default App;