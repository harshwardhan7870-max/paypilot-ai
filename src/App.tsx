import { useState } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import type { PageId } from "./components/layout/Sidebar";
import { AIAssistant } from "./pages/AIAssistant";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { Payments } from "./pages/Payments";
import { SalesSummary } from "./pages/SalesSummary";

function renderPage(page: PageId, onNavigate: (page: PageId) => void) {
  switch (page) {
    case "dashboard": return <Dashboard onNavigate={onNavigate} />;
    case "orders": return <Orders />;
    case "assistant": return <AIAssistant />;
    case "payments": return <Payments />;
    case "sales": return <SalesSummary />;
  }
}

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  return <MainLayout page={page} onNavigate={setPage}>{renderPage(page, setPage)}</MainLayout>;
}
