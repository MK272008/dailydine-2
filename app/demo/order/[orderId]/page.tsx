"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDemoOrder, type DemoOrder, type DemoOrderStatus } from "@/lib/demo/store";
import { getDemoRestaurant } from "@/lib/demo/data";

const statuses: DemoOrderStatus[] = ["NEW", "PREPARING", "READY", "SERVED"];
const statusLabels: Record<DemoOrderStatus, string> = {
  NEW: "Order received",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
};
const statusMessages: Record<DemoOrderStatus, string> = {
  NEW: "The kitchen has received your order.",
  PREPARING: "Your food is being prepared now.",
  READY: "Your order is ready at the table.",
  SERVED: "Enjoy your meal!",
};

export default function OrderTrackingPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [order, setOrder] = useState<DemoOrder>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void params.then(({ orderId }) => {
      if (active) {
        setOrder(getDemoOrder(orderId));
        setLoaded(true);
      }
    });
    const refresh = () => {
      void params.then(({ orderId }) => setOrder(getDemoOrder(orderId)));
    };
    const interval = window.setInterval(refresh, 1000);
    window.addEventListener("venturex-demo-orders-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("venturex-demo-orders-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [params]);

  if (!loaded) return <main className="grid min-h-screen px-5 py-8 md:py-16"><section className="m-auto w-full max-w-5xl rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12"><p className="leading-relaxed text-muted">Loading your order…</p></section></main>;
  if (!order) return <main className="grid min-h-screen px-5 py-8 md:py-16"><section className="m-auto w-full max-w-5xl rounded-[2rem] border border-[#d9aaa0] bg-[#fff5f1] p-6 shadow-daily md:p-12"><h1>Order not found</h1><p className="leading-relaxed text-muted">This demo order may have been cleared. Place a new order from a table QR.</p><Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-wine bg-wine px-4 py-3 font-extrabold text-surface no-underline hover:bg-wine-deep" href="/demo/green-table/table/4">Open Table 4</Link></section></main>;

  const restaurant = getDemoRestaurant(order.restaurantId);
  const activeIndex = statuses.indexOf(order.status);

  return (
    <main className="grid min-h-screen px-5 py-8 md:py-16 max-[480px]:px-4 max-[480px]:py-5">
      <section className="m-auto w-full max-w-5xl rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12 max-[480px]:rounded-2xl max-[480px]:p-5">
        <header className="mb-10 flex min-w-0 items-center justify-between gap-4"><Link className="font-serif text-xl font-bold tracking-[-0.035em] text-wine no-underline" href="/">Daily Dine</Link><span className="rounded-full border border-terracotta/25 bg-soft px-3 py-1.5 text-[0.67rem] font-extrabold uppercase tracking-[0.06em] text-terracotta">{order.id}</span></header>
        <p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-terracotta">{restaurant?.name ?? "Daily Dine restaurant"} · Table {order.tableNumber}</p>
        <h1>Order received.</h1>
        <p className="leading-relaxed text-muted">{statusMessages[order.status]}</p>
        <div className="my-9 grid grid-cols-4 gap-1 max-[480px]:grid-cols-2 max-[480px]:gap-4" aria-label={`Order status: ${statusLabels[order.status]}`}>
          {statuses.map((status, index) => <div className={`relative grid gap-2 ${index <= activeIndex ? "text-wine" : "text-[#b6aa9d]"}`} key={status}><span className={`z-10 grid h-8 w-8 place-items-center rounded-full border text-xs font-extrabold ${index <= activeIndex ? "border-wine bg-wine text-surface" : "border-line bg-surface"}`}>{index + 1}</span><strong className="text-xs">{statusLabels[status]}</strong></div>)}
        </div>
        <div className="rounded-2xl border border-line bg-white/50 p-4">
          <div className="flex justify-between gap-4 border-b border-line py-3 pt-0"><strong>{order.customerName}&apos;s order</strong><span>Pay at table</span></div>
          {order.items.map((item) => <div className="flex justify-between gap-4 border-b border-line py-3" key={item.menuItemId}><span>{item.name} × {item.quantity}</span><strong>₹{item.price * item.quantity}</strong></div>)}
          <div className="flex justify-between gap-4 py-3 pb-0 text-lg text-wine"><strong>Total</strong><strong>₹{order.total}</strong></div>
        </div>
        {order.note && <p className="mt-4 rounded-xl bg-soft p-3 text-sm text-wine">Note: {order.note}</p>}
        <Link className="mt-5 inline-block text-sm font-extrabold text-wine hover:underline hover:underline-offset-4" href={`/demo/${order.restaurantId}/table/${order.tableNumber}`}>Order something else</Link>
      </section>
    </main>
  );
}
