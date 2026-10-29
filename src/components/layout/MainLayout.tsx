import type { ReactNode } from "react";
import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import type { PageId } from "./Sidebar";

interface MainLayoutProps {
  page: PageId;
  onNavigate: (page: PageId) => void;
  children: ReactNode;
}

export function MainLayout({ page, onNavigate, children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function navigate(nextPage: PageId) {
    onNavigate(nextPage);
    setSidebarOpen(false);
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={page}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-column">
        <Header page={page} onMenuClick={() => setSidebarOpen(true)} />
        <main className="page-content">{children}</main>
        <footer className="footer-note">
          PayPilot AI demo &mdash; Sample order data only. Payments use PayPal sandbox; AI questions are sent to Google Gemini.
        </footer>
      </div>
    </div>
  );
}
