import { Bell, Menu, Search } from "lucide-react";
import type { PageId } from "./Sidebar";

const pageTitles: Record<PageId, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  assistant: "AI Assistant",
  payments: "Payments",
  sales: "Sales summary",
};

interface HeaderProps {
  page: PageId;
  onMenuClick: () => void;
}

export function Header({ page, onMenuClick }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button className="icon-button menu-button" aria-label="Open navigation" onClick={onMenuClick}><Menu size={21} /></button>
        <div><p className="eyebrow">YOUR BUSINESS AT A GLANCE</p><h1>{pageTitles[page]}</h1></div>
      </div>
      <div className="topbar-actions">
        <label className="search-box"><Search size={17} /><span className="sr-only">Search</span><input aria-label="Search (demo only)" placeholder="Search..." disabled /></label>
        <button className="icon-button notification-button" aria-label="Notifications (demo only)" title="Notifications are not configured"><Bell size={19} /><span /></button>
        <div className="avatar" aria-label="Demo account">JD</div>
      </div>
    </header>
  );
}
