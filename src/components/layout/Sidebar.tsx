import { Bot, CreditCard, LayoutDashboard, ReceiptText, TrendingUp, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PageId = "dashboard" | "orders" | "assistant" | "payments" | "sales";

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  open: boolean;
  onClose: () => void;
}

const navItems: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ReceiptText },
  { id: "assistant", label: "AI Assistant", icon: Bot },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "sales", label: "Sales summary", icon: TrendingUp },
];

export function Sidebar({ activePage, onNavigate, open, onClose }: SidebarProps) {
  return (
    <>
      {open && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`} aria-label="Main navigation">
        <div className="brand">
          <img src="/logo.svg" alt="PayPilot AI" />
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`nav-link ${activePage === id ? "nav-link--active" : ""}`} aria-current={activePage === id ? "page" : undefined} onClick={() => onNavigate(id)}>
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="demo-dot" />
          <span>Demo workspace<br /><small>Sample data only</small></span>
        </div>
      </aside>
    </>
  );
}
