import { useEffect, useState } from "react";

import Header from "@/components/Header";

import HomePage
from "@/components/pages/HomePage";

import DailyAveragePage
from "@/components/pages/DailyAveragePage";

import DailyFlowPage
from "@/components/pages/DailyFlowPage";

import WeekPage
from "@/components/pages/WeekPage";

import TwoWeeksPage
from "@/components/pages/TwoWeeksPage";

import MonthPage
from "@/components/pages/MonthPage";

import LoginPage
from "@/components/pages/LoginPage";

import RegisterPage
from "@/components/pages/RegisterPage";

import {
  getCurrentOccupancy,
  getSystemStatus,
  getAvailableDates,
  getOccupancyStats,
  getHourlyStats,
  getWeekStats,
  getTwoWeeksStats,
  getMonthStats,
  getDeviceStatus
}
from "@/services/api";

function App() {

  const [page, setPage] =
    useState("home");

  const [peopleInside, setPeopleInside] =
    useState(0);

  const [status, setStatus] =
    useState<any>(null);

  const [availableDates, setAvailableDates] =
    useState<string[]>([]);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [occupancyStats, setOccupancyStats] =
    useState<any[]>([]);

  const [hourlyStats, setHourlyStats] =
    useState<any[]>([]);

  const [weekStats, setWeekStats] =
    useState<any[]>([]);

  const [twoWeeksStats, setTwoWeeksStats] =
    useState<any[]>([]);

  const [monthStats, setMonthStats] =
    useState<any[]>([]);

  const [loggedUser, setLoggedUser] =
    useState("");

  const [deviceStatus, setDeviceStatus] =
    useState<any>(null);

  //
  // HOME
  //
  useEffect(() => {

    async function fetchHomeData() {

      const occupancy =
        await getCurrentOccupancy();

      const systemStatus =
        await getSystemStatus();

      if (occupancy) {

        setPeopleInside(
          occupancy.people_inside
        );
      }

      if (systemStatus) {

        setStatus(systemStatus);
      }

      const deviceStatus =
        await getDeviceStatus();

      if (deviceStatus) {

        setDeviceStatus(deviceStatus);
      }
    }

    fetchHomeData();

    const interval =
      setInterval(
        fetchHomeData,
        5000
      );

    return () =>
      clearInterval(interval);

  }, []);

  //
  // Datas disponíveis
  //
  useEffect(() => {

    async function fetchDates() {

      const dates =
        await getAvailableDates();

      setAvailableDates(dates);

      if (
        dates.length > 0 &&
        selectedDate === ""
      ) {

        setSelectedDate(
          dates[0]
        );
      }
    }

    fetchDates();

  }, []);

  //
  // Daily Average
  //
  useEffect(() => {

    if (
      page !== "dailyAverage" ||
      !selectedDate
    )
      return;

    async function fetchChart() {

      setOccupancyStats(
        await getOccupancyStats(
          selectedDate
        )
      );
    }

    fetchChart();

    const interval =
      setInterval(
        fetchChart,
        5000
      );

    return () =>
      clearInterval(interval);

  }, [page, selectedDate]);

  //
  // Daily Flow
  //
  useEffect(() => {

    if (
      page !== "dailyFlow" ||
      !selectedDate
    )
      return;

    async function fetchFlow() {

      setHourlyStats(
        await getHourlyStats(
          selectedDate
        )
      );
    }

    fetchFlow();

    const interval =
      setInterval(
        fetchFlow,
        5000
      );

    return () =>
      clearInterval(interval);

  }, [page, selectedDate]);

  //
  // Week
  //
  useEffect(() => {

    if (page !== "week")
      return;

    async function fetchWeek() {

      setWeekStats(
        await getWeekStats()
      );
    }

    fetchWeek();

  }, [page]);

  //
  // Two Weeks
  //
  useEffect(() => {

    if (page !== "twoWeeks")
      return;

    async function fetchTwoWeeks() {

      setTwoWeeksStats(
        await getTwoWeeksStats()
      );
    }

    fetchTwoWeeks();

  }, [page]);

  //
  // Month
  //
  useEffect(() => {

    if (page !== "month")
      return;

    async function fetchMonth() {

      setMonthStats(
        await getMonthStats()
      );
    }

    fetchMonth();

  }, [page]);

  return (

    <div
      className="
        min-h-screen
        bg-background
        p-10
        max-w-7xl
        mx-auto
      "
    >

      <Header
        setPage={setPage}
        loggedUser={loggedUser}
        setLoggedUser={setLoggedUser}
      />

      {
        page === "home" && (

          <HomePage

            peopleInside={
              peopleInside
            }

            status={
              status
            }

            deviceStatus={
              deviceStatus
            }

          />

        )
      }

      {
        page === "dailyAverage" && (

          <DailyAveragePage

            data={
              occupancyStats
            }

            selectedDate={
              selectedDate
            }

            availableDates={
              availableDates
            }

            setSelectedDate={
              setSelectedDate
            }

          />

        )
      }

      {
        page === "dailyFlow" && (

          <DailyFlowPage
            data={hourlyStats}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            availableDates={availableDates}
          />

        )
      }

      {
        page === "week" && (

          <WeekPage

            data={
              weekStats
            }

          />

        )
      }

      {
        page === "twoWeeks" && (

          <TwoWeeksPage

            data={
              twoWeeksStats
            }

          />

        )
      }

      {
        page === "month" && (

          <MonthPage

            data={
              monthStats
            }

          />

        )
      }

      {
        page === "login" && (

          <LoginPage 
            setPage={setPage}
            setLoggedUser={setLoggedUser}
          />

        )
      }

      {
        page === "register" && (

          <RegisterPage 
            setPage={setPage}
          />

        )
      }

    </div>
  );
}

export default App;