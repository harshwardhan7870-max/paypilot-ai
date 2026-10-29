// ─── Server-side sample orders ────────────────────────────────────────────────
// These are illustrative demo records. No real orders or transactions exist.
// Served by GET /api/orders while a real database integration is pending.

import type { Order } from "../types/order.js";

function dateDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const demoOrders: Order[] = [
  { id: "PP-1048", customer: "Olivia Martin",  email: "olivia@example.com",  date: dateDaysAgo(0), amount: 248.00, status: "Paid",      item: "Studio headphones" },
  { id: "PP-1047", customer: "Phoenix Baker",  email: "phoenix@example.com", date: dateDaysAgo(0), amount: 125.50, status: "Pending",   item: "Desk lamp" },
  { id: "PP-1046", customer: "Lana Steiner",   email: "lana@example.com",    date: dateDaysAgo(1), amount: 89.99,  status: "Paid",      item: "Ceramic planter set" },
  { id: "PP-1045", customer: "Demi Wilkinson", email: "demi@example.com",    date: dateDaysAgo(1), amount: 340.00, status: "Refunded",  item: "Leather work bag" },
  { id: "PP-1044", customer: "Candice Wu",     email: "candice@example.com", date: dateDaysAgo(2), amount: 64.00,  status: "Paid",      item: "Everyday notebook" },
  { id: "PP-1043", customer: "Natali Craig",   email: "natali@example.com",  date: dateDaysAgo(2), amount: 179.00, status: "Cancelled", item: "Wireless keyboard" },
  { id: "PP-1042", customer: "Drew Cano",      email: "drew@example.com",    date: dateDaysAgo(3), amount: 52.00,  status: "Paid",      item: "Bamboo cutting board" },
  { id: "PP-1041", customer: "Sienna James",   email: "sienna@example.com", date: dateDaysAgo(3), amount: 410.00, status: "Paid",      item: "Standing desk mat" },
  { id: "PP-1040", customer: "Koray Okumus",   email: "koray@example.com",  date: dateDaysAgo(4), amount: 199.00, status: "Pending",   item: "Ergonomic mouse" },
  { id: "PP-1039", customer: "Amelie Laurent", email: "amelie@example.com",  date: dateDaysAgo(4), amount: 76.50,  status: "Paid",      item: "Scented candle set" },
  { id: "PP-1038", customer: "Tom Wright",     email: "tom@example.com",     date: dateDaysAgo(5), amount: 299.00, status: "Paid",      item: "Mechanical keyboard" },
  { id: "PP-1037", customer: "Rosa Meyers",    email: "rosa@example.com",    date: dateDaysAgo(5), amount: 145.00, status: "Refunded",  item: "Smart mug" },
  { id: "PP-1036", customer: "Ivan Torres",    email: "ivan@example.com",    date: dateDaysAgo(6), amount: 88.00,  status: "Paid",      item: "Leather journal" },
  { id: "PP-1035", customer: "Mia Chen",       email: "mia@example.com",     date: dateDaysAgo(6), amount: 320.00, status: "Cancelled", item: "Monitor light bar" },
  { id: "PP-1034", customer: "Sam Park",       email: "sam@example.com",     date: dateDaysAgo(6), amount: 59.99,  status: "Paid",      item: "Desk organiser" },
  { id: "PP-1033", customer: "Avery Brooks",   email: "avery@example.com",   date: dateDaysAgo(0), amount: 142.00, status: "Paid",      item: "Canvas weekend bag" },
  { id: "PP-1032", customer: "Noah Patel",     email: "noah@example.com",    date: dateDaysAgo(1), amount: 215.75, status: "Pending",   item: "Wireless speaker" },
  { id: "PP-1031", customer: "Maya Thompson",  email: "maya@example.com",    date: dateDaysAgo(2), amount: 48.00,  status: "Paid",      item: "Glass water bottle" },
  { id: "PP-1030", customer: "Ethan Rivera",   email: "ethan@example.com",   date: dateDaysAgo(3), amount: 189.00, status: "Refunded",  item: "Travel backpack" },
  { id: "PP-1029", customer: "Zoe Kim",        email: "zoe@example.com",     date: dateDaysAgo(5), amount: 95.00,  status: "Pending",   item: "Tabletop clock" },
];
