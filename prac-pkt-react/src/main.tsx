import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import DashboardPage from "./pages/DashboardPage";
import LotsPage from "./pages/LotsPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
import QualityInspectionsPage from "./pages/QualityInspectionsPage";
import EquipmentsPage from "./pages/EquipmentsPage";
import LoginPage from "./features/auth/ui/LoginPage";
import SignupPage from "./features/auth/ui/SignupPage";
import RequireAuth from "./features/auth/ui/RequireAuth";
import { AuthProvider } from "./features/auth/model/auth.store";
import { UnauthorizedError } from "./shared/api/http";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // 인증이 끊긴 요청은 재시도해도 같은 401이므로 바로 로그인 화면으로 넘긴다.
      retry: (failureCount, error) => !(error instanceof UnauthorizedError) && failureCount < 2,
    },
  },
});

createRoot(document.getElementById("root")!).render(
      <StrictMode><BrowserRouter><AuthProvider><QueryClientProvider client={queryClient}><Routes><Route path="/login" element={<LoginPage />} /><Route path="/signup" element={<SignupPage />} /><Route element={<RequireAuth />}><Route element={<App />}><Route path="/" element={<DashboardPage />} /><Route path="/lots" element={<LotsPage />} /><Route path="/work-orders" element={<WorkOrdersPage />} /><Route path="/quality-inspections" element={<QualityInspectionsPage />} /><Route path="/equipments" element={<EquipmentsPage />} /></Route></Route></Routes></QueryClientProvider></AuthProvider></BrowserRouter></StrictMode>,
);
