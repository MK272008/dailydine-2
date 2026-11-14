"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import {
  demoRestaurants,
  getDemoMenu,
  type DemoMenuItem,
} from "@/lib/demo/data";
import {
  getDemoMenuAvailability,
  getDemoOrders,
  resetDemo,
  seedDemoOrder,
  setDemoMenuAvailability,
  updateDemoOrderStatus,
  type DemoOrder,
  type DemoOrderStatus,
} from "@/lib/demo/store";

const statuses: DemoOrderStatus[] = ["NEW", "PREPARING", "READY", "SERVED"];
const actionLabels: Partial<Record<DemoOrderStatus, string>> = {
  NEW: "Start preparing",
  PREPARING: "Mark ready",
  READY: "Mark served",
};
const nextStatus: Partial<Record<DemoOrderStatus, DemoOrderStatus>> = {
  NEW: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
};
type StaffView = "active" | "served" | "qrs" | "menu";

export default function StaffDemoPage() {
  const [restaurantId, setRestaurantId] = useState("green-table");
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [activeView, setActiveView] = useState<StaffView>("active");

  useEffect(() => {
    const refresh = () => setOrders(getDemoOrders());
    seedDemoOrder();
    refresh();
    window.addEventListener("venturex-demo-orders-changed", refresh);
    window.addEventListener("storage", refresh);
    const interval = window.setInterval(refresh, 1000);
    return () => {
      window.removeEventListener("venturex-demo-orders-changed", refresh);
      window.removeEventListener("storage", refresh);
      window.clearInterval(interval);
    };
  }, []);

  const restaurantOrders = useMemo(
    () => orders.filter((order) => order.restaurantId === restaurantId),
    [orders, restaurantId],
  );
  const restaurant = demoRestaurants.find((item) => item.id === restaurantId);
  const tableNumbers = Array.from(
    { length: restaurant?.tableCount ?? 0 },
    (_, index) => index + 1,
  );
  const activeOrders = restaurantOrders
    .filter((order) => order.status !== "SERVED")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const servedOrders = restaurantOrders
    .filter((order) => order.status === "SERVED")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const counts = statuses.reduce<Record<DemoOrderStatus, number>>(
    (result, status) => {
      result[status] = restaurantOrders.filter(
        (order) => order.status === status,
      ).length;
      return result;
    },
    { NEW: 0, PREPARING: 0, READY: 0, SERVED: 0 },
  );

  return (
    <main className="grid min-h-screen px-5 py-8 md:py-16 max-[480px]:px-4 max-[480px]:py-5">
      <section className="m-auto w-full max-w-[82rem] rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12 max-[480px]:rounded-2xl max-[480px]:p-5">
        <header className="flex items-center justify-between gap-4 border-b border-line pb-5">
          <div className="mb-0 flex min-w-0 items-center justify-between gap-4">
            <Link
              className="font-serif text-xl font-bold tracking-[-0.035em] text-wine no-underline"
              href="/"
            >
              Daily Dine
            </Link>
            <span className="rounded-full border border-surface/20 bg-wine px-3 py-1.5 text-[0.67rem] font-extrabold uppercase tracking-[0.06em] text-surface">
              Staff workspace
            </span>
          </div>
          <div className="text-xs font-bold text-muted">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-sage shadow-[0_0_0_4px_rgb(109_128_102/12%)]" />{" "}
            Live demo · updates every second
          </div>
        </header>
        <div className="flex items-end justify-between gap-8 py-8 max-lg:flex-col max-lg:items-start">
          <div>
            <p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-terracotta">
              Service floor
            </p>
            <h1 className="mb-3">Keep every table moving.</h1>
            <p className="max-w-xl leading-relaxed text-muted">
              A clear view of every QR table, active order, and next service
              step.
            </p>
          </div>
          <label className="min-w-56 text-xs font-extrabold uppercase tracking-wide text-muted max-lg:w-full max-lg:max-w-sm">
            Active restaurant
            <select
              className="mt-2"
              value={restaurantId}
              onChange={(event) => setRestaurantId(event.target.value)}
            >
              {demoRestaurants.map((restaurantOption) => (
                <option key={restaurantOption.id} value={restaurantOption.id}>
                  {restaurantOption.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mb-4 mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {statuses.map((status) => (
            <div
              className="relative grid min-h-32 gap-1 rounded-2xl border border-line bg-surface p-4 after:absolute after:right-4 after:top-4 after:h-2 after:w-2 after:rounded-full after:bg-terracotta"
              key={status}
            >
              <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                {status.toLowerCase()}
              </span>
              <strong className="font-serif text-4xl leading-none text-wine">
                {counts[status]}
              </strong>
              <small className="self-end text-xs text-muted">
                {status === "NEW"
                  ? "Needs attention"
                  : status === "SERVED"
                    ? "Completed today"
                    : "In progress"}
              </small>
            </div>
          ))}
        </div>
        <div className="grid gap-6 border-t border-line pt-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <aside
            className="flex flex-col gap-1 max-lg:grid max-lg:grid-cols-4 max-lg:gap-2 max-[480px]:grid-cols-2"
            aria-label="Staff workspace sections"
          >
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-muted max-lg:hidden">
              Workspace
            </p>
            <button
              className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-xs font-extrabold transition max-lg:min-h-14 max-lg:flex-col max-lg:items-start max-lg:justify-center max-lg:gap-0.5 ${activeView === "active" ? "border-line bg-surface text-wine shadow-daily-soft" : "border-transparent bg-transparent text-muted hover:bg-paper hover:text-wine"}`}
              type="button"
              onClick={() => setActiveView("active")}
            >
              <span>Active Orders</span>
              <strong>{activeOrders.length}</strong>
            </button>
            <button
              className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-xs font-extrabold transition max-lg:min-h-14 max-lg:flex-col max-lg:items-start max-lg:justify-center max-lg:gap-0.5 ${activeView === "served" ? "border-line bg-surface text-wine shadow-daily-soft" : "border-transparent bg-transparent text-muted hover:bg-paper hover:text-wine"}`}
              type="button"
              onClick={() => setActiveView("served")}
            >
              <span>Served history</span>
              <strong>{servedOrders.length}</strong>
            </button>
            <button
              className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-xs font-extrabold transition max-lg:min-h-14 max-lg:flex-col max-lg:items-start max-lg:justify-center max-lg:gap-0.5 ${activeView === "qrs" ? "border-line bg-surface text-wine shadow-daily-soft" : "border-transparent bg-transparent text-muted hover:bg-paper hover:text-wine"}`}
              type="button"
              onClick={() => setActiveView("qrs")}
            >
              <span>Table QR codes</span>
              <strong>{tableNumbers.length}</strong>
            </button>
            <button
              className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-xs font-extrabold transition max-lg:min-h-14 max-lg:flex-col max-lg:items-start max-lg:justify-center max-lg:gap-0.5 ${activeView === "menu" ? "border-line bg-surface text-wine shadow-daily-soft" : "border-transparent bg-transparent text-muted hover:bg-paper hover:text-wine"}`}
              type="button"
              onClick={() => setActiveView("menu")}
            >
              <span>Menu availability</span>
              <strong>↗</strong>
            </button>
            <div className="mt-auto grid gap-1 rounded-xl bg-soft p-3 max-lg:hidden">
              <strong className="text-xs text-wine">Floor tip</strong>
              <span className="text-xs leading-snug text-muted">
                Older orders stay at the top so nothing waits unseen.
              </span>
            </div>
          </aside>
          <section className="min-w-0">
            {activeView === "active" && (
              <OrderList
                title="Active orders"
                description="Prioritized oldest first. Move each order forward as the kitchen and floor team work."
                orders={activeOrders}
                emptyMessage="No active orders right now."
              />
            )}
            {activeView === "served" && (
              <OrderList
                title="Served history"
                description="Completed orders stay here for quick reference, away from the working queue."
                orders={servedOrders}
                emptyMessage="No served orders yet."
              />
            )}
            {activeView === "qrs" && (
              <section>
                <div className="floor-heading">
                  <div>
                    <h2>Table QR codes</h2>
                    <p className="muted">
                      Open a card to download or print a table sign.
                    </p>
                  </div>
                  <span className="floor-count">
                    {tableNumbers.length} tables
                  </span>
                </div>
                <div className="table-grid">
                  {tableNumbers.map((tableNumber) => (
                    <TableCard
                      key={tableNumber}
                      restaurantId={restaurantId}
                      tableNumber={tableNumber}
                      orders={restaurantOrders.filter(
                        (order) => order.tableNumber === tableNumber,
                      )}
                    />
                  ))}
                </div>
              </section>
            )}
            {activeView === "menu" && <MenuAvailability />}
          </section>
        </div>
      </section>
    </main>
  );
}

function OrderList({
  title,
  description,
  orders,
  emptyMessage,
}: {
  title: string;
  description: string;
  orders: DemoOrder[];
  emptyMessage: string;
}) {
  return (
    <section>
      <div className="my-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="mb-1">{title}</h2>
          <p className="text-sm leading-relaxed text-muted">{description}</p>
        </div>
        <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
          {orders.length} orders
        </span>
      </div>
      <div className="grid gap-3">
        {orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">
            {emptyMessage}
          </p>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </section>
  );
}

function MenuAvailability() {
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const menu = getDemoMenu("green-table");

  useEffect(() => {
    const refresh = () => setAvailability(getDemoMenuAvailability());
    refresh();
    window.addEventListener("venturex-demo-menu-availability-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(
        "venturex-demo-menu-availability-changed",
        refresh,
      );
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <section>
      <div className="my-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="mb-1">Menu availability</h2>
          <p className="text-sm leading-relaxed text-muted">
            Toggle what guests can order. Changes are saved to this browser.
          </p>
        </div>
        <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
          {menu.filter((item) => availability[item.id] !== false).length}/
          {menu.length} available
        </span>
      </div>
      <div className="grid gap-2">
        {menu.map((item) => (
          <AvailabilityRow
            key={item.id}
            item={item}
            available={availability[item.id] !== false}
            onChange={(available) =>
              setDemoMenuAvailability(item.id, available)
            }
          />
        ))}
      </div>
    </section>
  );
}

function AvailabilityRow({
  item,
  available,
  onChange,
}: {
  item: DemoMenuItem;
  available: boolean;
  onChange: (available: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-3 max-[480px]:items-start max-[480px]:flex-col">
      <div className="flex min-w-0 items-center gap-3">
        <img className="h-10 w-10 shrink-0 rounded-lg border border-line object-cover" src={item.imageSrc} alt="" />
        <span className="grid gap-1">
          <strong className="text-sm">{item.name}</strong>
          <small className="text-xs text-muted">
            {item.category} · ₹{item.price}
          </small>
        </span>
      </div>
      <label className="m-0 inline-flex min-w-24 cursor-pointer items-center justify-end gap-2 self-end">
        <input
          className="sr-only"
          type="checkbox"
          checked={available}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span
          className={`relative h-5 w-9 rounded-full transition after:absolute after:left-1 after:top-1 after:h-3 after:w-3 after:rounded-full after:bg-surface after:transition ${available ? "bg-sage after:translate-x-4" : "bg-line"}`}
          aria-hidden="true"
        />
        <em className="text-[0.66rem] font-extrabold not-italic text-muted">
          {available ? "Available" : "Sold out"}
        </em>
      </label>
    </div>
  );
}

function TableCard({
  restaurantId,
  tableNumber,
  orders,
}: {
  restaurantId: string;
  tableNumber: number;
  orders: DemoOrder[];
}) {
  const activeOrders = orders.filter((order) => order.status !== "SERVED");
  const [qrOpen, setQrOpen] = useState(false);
  const qrSrc = useTableQr(restaurantId, tableNumber);

  return (
    <>
      <article
        className={`grid min-w-0 overflow-hidden rounded-2xl border bg-surface transition hover:-translate-y-0.5 hover:border-wine/40 hover:shadow-daily-soft ${activeOrders.length > 0 ? "border-terracotta/60" : "border-line"}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line p-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-muted">
              Table
            </span>
            <strong className="font-serif text-2xl text-wine">
              {tableNumber.toString().padStart(2, "0")}
            </strong>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-[0.62rem] font-extrabold uppercase ${activeOrders.length > 0 ? "bg-soft text-terracotta" : "bg-sage/10 text-sage"}`}
          >
            {activeOrders.length > 0 ? "Active" : "Open"}
          </span>
        </div>
        <div className="grid grid-cols-[4.75rem_1fr] items-center gap-3 p-3">
          <button
            className="block min-h-0 w-[4.6rem] rounded-xl border-0 bg-transparent p-0"
            type="button"
            onClick={() => setQrOpen(true)}
            aria-label={`Open printable QR code for table ${tableNumber}`}
          >
            <TableQr src={qrSrc} tableNumber={tableNumber} />
          </button>
          <div className="grid gap-1">
            <strong className="text-sm">
              {activeOrders.length
                ? `${activeOrders.length} active ${activeOrders.length === 1 ? "order" : "orders"}`
                : "Ready for guests"}
            </strong>
            <span className="text-xs text-muted">
              {orders.length ? `${orders.length} total today` : "No orders yet"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line p-3">
          <Link
            className="text-xs font-extrabold text-wine no-underline hover:underline"
            href={`/demo/${restaurantId}/table/${tableNumber}`}
          >
            Open guest flow <span aria-hidden="true">↗</span>
          </Link>
          {activeOrders.length > 0 && (
            <span
              className="h-2 w-2 rounded-full bg-terracotta"
              aria-label="Active orders"
            />
          )}
        </div>
      </article>
      {qrOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <QrModal
            restaurantId={restaurantId}
            tableNumber={tableNumber}
            src={qrSrc}
            onClose={() => setQrOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}

function useTableQr(restaurantId: string, tableNumber: number) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(
      `${window.location.origin}/demo/${restaurantId}/table/${tableNumber}`,
      { margin: 1, width: 112, color: { dark: "#5e1b2b", light: "#fffaf2" } },
    ).then((dataUrl) => {
      if (active) setSrc(dataUrl);
    });
    return () => {
      active = false;
    };
  }, [restaurantId, tableNumber]);

  return src;
}

function TableQr({ src, tableNumber }: { src: string; tableNumber: number }) {
  return src ? (
    <img
      className="block h-[4.6rem] w-[4.6rem] rounded-xl border border-line bg-surface object-contain p-1"
      src={src}
      alt={`QR code for table ${tableNumber}`}
    />
  ) : (
    <div
      className="block h-[4.6rem] w-[4.6rem] rounded-xl border border-line bg-paper-deep p-1"
      aria-hidden="true"
    />
  );
}

function QrModal({
  restaurantId,
  tableNumber,
  src,
  onClose,
}: {
  restaurantId: string;
  tableNumber: number;
  src: string;
  onClose: () => void;
}) {
  const guestUrl =
    typeof window === "undefined"
      ? `/demo/${restaurantId}/table/${tableNumber}`
      : `${window.location.origin}/demo/${restaurantId}/table/${tableNumber}`;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-ink/65 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className="max-h-[calc(100svh-2rem)] w-full max-w-md overflow-auto rounded-2xl border border-line bg-surface p-5 shadow-[0_1.5rem_4rem_rgb(43_33_30/30%)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`qr-title-${tableNumber}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-terracotta">
              Print station
            </p>
            <h2 id={`qr-title-${tableNumber}`}>Table {tableNumber} QR</h2>
          </div>
          <button
            className="min-h-9 rounded-full border border-line bg-transparent px-3 py-2 text-xs font-extrabold text-muted"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="grid justify-items-center gap-2 rounded-2xl border border-line bg-paper p-5 text-center">
          {src ? (
            <img
              className="block w-full max-w-52 rounded-xl border border-line bg-surface p-2"
              src={src}
              alt={`Printable QR code for table ${tableNumber}`}
            />
          ) : (
            <div
              className="aspect-square w-full max-w-52 rounded-xl border border-line bg-paper-deep p-2"
              aria-hidden="true"
            />
          )}
          <strong className="font-serif text-lg text-wine">
            Scan to order at Table {tableNumber}
          </strong>
          <span className="text-xs text-muted">
            Daily Dine · Hassle free dining
          </span>
        </div>
        <p className="mt-4 break-all text-center text-xs text-muted">
          {guestUrl}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
          <a
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-wine bg-wine px-4 py-3 text-[0.84rem] font-extrabold text-surface no-underline hover:bg-wine-deep"
            href={src || undefined}
            download={`daily-dine-table-${tableNumber}-qr.png`}
          >
            Download QR
          </a>
          <button
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line bg-transparent px-4 py-3 text-[0.84rem] font-extrabold text-wine hover:bg-paper-deep"
            type="button"
            onClick={() => window.print()}
          >
            Print card
          </button>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-muted">
          Download the image for a sticker or print this card and place it on
          the table.
        </p>
      </section>
    </div>
  );
}

function OrderCard({ order }: { order: DemoOrder }) {
  const next = nextStatus[order.status];
  return (
    <article className="min-w-0 rounded-2xl border border-terracotta/30 bg-surface p-4 shadow-daily-soft">
      <div className="flex justify-between gap-4 border-b border-line py-3 pt-0">
        <div>
          <strong>
            {order.id} · Table {order.tableNumber}
          </strong>
          <span className="mt-1 block text-xs text-muted">
            {order.customerName}
          </span>
        </div>
        <span
          className={`flex items-center justify-center rounded-full px-2.5 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wide ${order.status === "NEW" ? "bg-soft text-terracotta" : order.status === "PREPARING" ? "bg-[#f8edc9] text-[#8b671d]" : order.status === "READY" ? "bg-[#e3eee1] text-[#4e6d4a]" : "bg-paper-deep text-muted"}`}
        >
          {order.status}
        </span>
      </div>
      <p className="my-4 text-sm text-muted">
        {order.items
          .map((item) => `${item.name} × ${item.quantity}`)
          .join(" · ")}
      </p>
      <div className="flex justify-between gap-4 py-3 pb-0">
        <strong>₹{order.total}</strong>
        {next ? (
          <button
            className="min-h-10 rounded-full border border-wine bg-wine px-3 text-xs font-extrabold text-surface"
            type="button"
            onClick={() => updateDemoOrderStatus(order.id, next)}
          >
            {actionLabels[order.status]}
          </button>
        ) : (
          <span className="text-muted">Complete</span>
        )}
      </div>
    </article>
  );
}
