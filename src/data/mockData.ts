import type { Order } from "../types/order";
import type { Payment } from "../types/payment";

// ─── Sample orders ─────────────────────────────────────────────────────────────
// Illustrative records only. No real orders or transactions exist.
export const mockOrders: Order[] = [
  { id: "PP-1048", customer: "Olivia Martin",  email: "olivia@example.com",  date: "2026-10-28", amount: 248.00, status: "Paid",      item: "Studio headphones" },
  { id: "PP-1047", customer: "Phoenix Baker",  email: "phoenix@example.com", date: "2026-10-28", amount: 125.50, status: "Pending",   item: "Desk lamp" },
  { id: "PP-1046", customer: "Lana Steiner",   email: "lana@example.com",    date: "2026-10-27", amount: 89.99,  status: "Paid",      item: "Ceramic planter set" },
  { id: "PP-1045", customer: "Demi Wilkinson", email: "demi@example.com",    date: "2026-10-27", amount: 340.00, status: "Refunded",  item: "Leather work bag" },
  { id: "PP-1044", customer: "Candice Wu",     email: "candice@example.com", date: "2026-10-26", amount: 64.00,  status: "Paid",      item: "Everyday notebook" },
  { id: "PP-1043", customer: "Natali Craig",   email: "natali@example.com",  date: "2026-10-26", amount: 179.00, status: "Cancelled", item: "Wireless keyboard" },
  { id: "PP-1042", customer: "Drew Cano",      email: "drew@example.com",    date: "2026-10-25", amount: 52.00,  status: "Paid",      item: "Bamboo cutting board" },
  { id: "PP-1041", customer: "Sienna James",   email: "sienna@example.com",  date: "2026-10-25", amount: 410.00, status: "Paid",      item: "Standing desk mat" },
  { id: "PP-1040", customer: "Koray Okumus",   email: "koray@example.com",   date: "2026-10-24", amount: 199.00, status: "Pending",   item: "Ergonomic mouse" },
  { id: "PP-1039", customer: "Amelie Laurent", email: "amelie@example.com",  date: "2026-10-24", amount: 76.50,  status: "Paid",      item: "Scented candle set" },
  { id: "PP-1038", customer: "Tom Wright",     email: "tom@example.com",     date: "2026-10-23", amount: 299.00, status: "Paid",      item: "Mechanical keyboard" },
  { id: "PP-1037", customer: "Rosa Meyers",    email: "rosa@example.com",    date: "2026-10-23", amount: 145.00, status: "Refunded",  item: "Smart mug" },
  { id: "PP-1036", customer: "Ivan Torres",    email: "ivan@example.com",    date: "2026-10-22", amount: 88.00,  status: "Paid",      item: "Leather journal" },
  { id: "PP-1035", customer: "Mia Chen",       email: "mia@example.com",     date: "2026-10-22", amount: 320.00, status: "Cancelled", item: "Monitor light bar" },
  { id: "PP-1034", customer: "Sam Park",       email: "sam@example.com",     date: "2026-10-21", amount: 59.99,  status: "Paid",      item: "Desk organiser" },
];

// ─── Sample payments ───────────────────────────────────────────────────────────
export const mockPayments: Payment[] = [
  { id: "PAY-8901", orderId: "PP-1048", customer: "Olivia Martin",  date: "2026-10-28", amount: 248.00, method: "PayPal (demo)", status: "Completed" },
  { id: "PAY-8900", orderId: "PP-1047", customer: "Phoenix Baker",  date: "2026-10-28", amount: 125.50, method: "PayPal (demo)", status: "Pending"   },
  { id: "PAY-8899", orderId: "PP-1046", customer: "Lana Steiner",   date: "2026-10-27", amount: 89.99,  method: "PayPal (demo)", status: "Completed" },
  { id: "PAY-8898", orderId: "PP-1045", customer: "Demi Wilkinson", date: "2026-10-27", amount: 340.00, method: "PayPal (demo)", status: "Refunded"  },
  { id: "PAY-8897", orderId: "PP-1044", customer: "Candice Wu",     date: "2026-10-26", amount: 64.00,  method: "PayPal (demo)", status: "Completed" },
  { id: "PAY-8896", orderId: "PP-1042", customer: "Drew Cano",      date: "2026-10-25", amount: 52.00,  method: "PayPal (demo)", status: "Completed" },
  { id: "PAY-8895", orderId: "PP-1041", customer: "Sienna James",   date: "2026-10-25", amount: 410.00, method: "PayPal (demo)", status: "Completed" },
  { id: "PAY-8894", orderId: "PP-1040", customer: "Koray Okumus",   date: "2026-10-24", amount: 199.00, method: "PayPal (demo)", status: "Pending"   },
  { id: "PAY-8893", orderId: "PP-1039", customer: "Amelie Laurent", date: "2026-10-24", amount: 76.50,  method: "PayPal (demo)", status: "Completed" },
  { id: "PAY-8892", orderId: "PP-1038", customer: "Tom Wright",     date: "2026-10-23", amount: 299.00, method: "PayPal (demo)", status: "Completed" },
  { id: "PAY-8891", orderId: "PP-1037", customer: "Rosa Meyers",    date: "2026-10-23", amount: 145.00, method: "PayPal (demo)", status: "Refunded"  },
  { id: "PAY-8890", orderId: "PP-1036", customer: "Ivan Torres",    date: "2026-10-22", amount: 88.00,  method: "PayPal (demo)", status: "Completed" },
];
