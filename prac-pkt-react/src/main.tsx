import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import DashboardPage from "./pages/DashboardPage";
import GoalsPage from "./pages/GoalsPage";
import LotsPage from "./pages/LotsPage";
import SettingsPage from "./pages/SettingsPage";
import "./styles.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } });

createRoot(document.getElementById("root")!).render(
  <StrictMode><BrowserRouter><QueryClientProvider client={queryClient}><Routes><Route element={<App />}><Route path="/" element={<DashboardPage />} /><Route path="/lots" element={<LotsPage />} /><Route path="/goals" element={<GoalsPage />} /><Route path="/settings" element={<SettingsPage />} /></Route></Routes></QueryClientProvider></BrowserRouter></StrictMode>,
);
