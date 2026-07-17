import { useEffect, useState } from "react";

import Header from "@/components/Header";
import HomePage from "@/components/pages/HomePage";
import DailyAveragePage from "@/components/pages/DailyAveragePage";
import DailyFlowPage from "@/components/pages/DailyFlowPage";
import WeekPage from "@/components/pages/WeekPage";
import TwoWeeksPage from "@/components/pages/TwoWeeksPage";
import MonthPage from "@/components/pages/MonthPage";
import MonthlyPage from "@/components/pages/MonthlyPage";
import LoginPage from "@/components/pages/LoginPage";
import RegisterPage from "@/components/pages/RegisterPage";

import {
  getCurrentOccupancy,
  getSystemStatus,
  getAvailableDates,
  getOccupancyStats,
  getHourlyStats,
  getWeekStats,
  getTwoWeeksStats,
  getMonthStats,
  getMonthlyStats,
  getAvailableMonths,
  getDeviceStatus,
} from "@/services/api";

const PROTECTED_PAGES = [
  "dailyAverage",
  "dailyFlow",
  "week",
  "twoWeeks",
  "month",
  "monthly",
];

function App() {
  const [page, setPage] = useState("home");
  const [peopleInside, setPeopleInside] = useState(0);
  const [status, setStatus] = useState<any>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [occupancyStats, setOccupancyStats] = useState<any[]>([]);
  const [hourlyStats, setHourlyStats] = useState<any[]>([]);
  const [weekStats, setWeekStats] = useState<any[]>([]);
  const [twoWeeksStats, setTwoWeeksStats] = useState<any[]>([]);
  const [monthStats, setMonthStats] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loggedUser, setLoggedUser] = useState(() => localStorage.getItem("loggedUser") ?? "");
  const [deviceStatus, setDeviceStatus] = useState<any>(null);

  function navigateTo(target: string) {
    if (PROTECTED_PAGES.includes(target) && loggedUser === "") {
      setPage("login");
    } else {
      setPage(target);
    }
  }

  // HOME
  useEffect(() => {
    async function fetchHomeData() {
      const occupancy = await getCurrentOccupancy();
      const systemStatus = await getSystemStatus();
      if (occupancy) setPeopleInside(occupancy.people_inside);
      if (systemStatus) setStatus(systemStatus);
      const device = await getDeviceStatus();
      if (device) setDeviceStatus(device);
    }
    fetchHomeData();
    const interval = setInterval(fetchHomeData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Datas disponíveis
  useEffect(() => {
    async function fetchDates() {
      const dates = await getAvailableDates();
      setAvailableDates(dates);
      if (dates.length > 0 && selectedDate === "") setSelectedDate(dates[0]);
    }
    fetchDates();
  }, []);

  // Meses disponíveis
  useEffect(() => {
    async function fetchMonths() {
      const months = await getAvailableMonths();
      setAvailableMonths(months);
      if (months.length > 0 && selectedMonth === "") setSelectedMonth(months[0]);
    }
    fetchMonths();
  }, []);

  // Daily Average
  useEffect(() => {
    if (page !== "dailyAverage" || !selectedDate) return;
    async function fetchChart() {
      setOccupancyStats(await getOccupancyStats(selectedDate));
    }
    fetchChart();
    const interval = setInterval(fetchChart, 5000);
    return () => clearInterval(interval);
  }, [page, selectedDate]);

  // Daily Flow
  useEffect(() => {
    if (page !== "dailyFlow" || !selectedDate) return;
    async function fetchFlow() {
      setHourlyStats(await getHourlyStats(selectedDate));
    }
    fetchFlow();
    const interval = setInterval(fetchFlow, 5000);
    return () => clearInterval(interval);
  }, [page, selectedDate]);

  // Week
  useEffect(() => {
    if (page !== "week") return;
    async function fetchWeek() {
      setWeekStats(await getWeekStats());
    }
    fetchWeek();
  }, [page]);

  // Two Weeks
  useEffect(() => {
    if (page !== "twoWeeks") return;
    async function fetchTwoWeeks() {
      setTwoWeeksStats(await getTwoWeeksStats());
    }
    fetchTwoWeeks();
  }, [page]);

  // Month (últimos 30 dias)
  useEffect(() => {
    if (page !== "month") return;
    async function fetchMonth() {
      setMonthStats(await getMonthStats());
    }
    fetchMonth();
  }, [page]);

  // Monthly (mês específico)
  useEffect(() => {
    if (page !== "monthly" || !selectedMonth) return;
    async function fetchMonthly() {
      const data = await getMonthlyStats(selectedMonth);
      setMonthlyStats(data);
    }
    fetchMonthly();
  }, [page, selectedMonth]);

  return (
    <div className="min-h-screen bg-background p-10 max-w-7xl mx-auto">

      <Header
        setPage={navigateTo}
        loggedUser={loggedUser}
        setLoggedUser={setLoggedUser}
      />

      {page === "home" && (
        <HomePage
          peopleInside={peopleInside}
          status={status}
          deviceStatus={deviceStatus}
          loggedUser={loggedUser}
          setPage={navigateTo}
        />
      )}

      {page === "dailyAverage" && loggedUser !== "" && (
        <DailyAveragePage
          data={occupancyStats}
          selectedDate={selectedDate}
          availableDates={availableDates}
          setSelectedDate={setSelectedDate}
        />
      )}

      {page === "dailyFlow" && loggedUser !== "" && (
        <DailyFlowPage
          data={hourlyStats}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          availableDates={availableDates}
        />
      )}

      {page === "week" && loggedUser !== "" && (
        <WeekPage data={weekStats} />
      )}

      {page === "twoWeeks" && loggedUser !== "" && (
        <TwoWeeksPage data={twoWeeksStats} />
      )}

      {page === "month" && loggedUser !== "" && (
        <MonthPage data={monthStats} />
      )}

      {page === "monthly" && loggedUser !== "" && (
        <MonthlyPage
          data={monthlyStats}
          selectedMonth={selectedMonth}
          availableMonths={availableMonths}
          setSelectedMonth={setSelectedMonth}
        />
      )}

      {page === "login" && (
        <LoginPage setPage={setPage} setLoggedUser={setLoggedUser} />
      )}

      {page === "register" && (
        <RegisterPage setPage={setPage} />
      )}

    </div>
  );
}

export default App;