"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { createDemoOrder } from "@/lib/demo/store";
import { getDemoMenu } from "@/lib/demo/data";

export default function CartPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantId: string; tableNumber: string }>;
  searchParams: Promise<{ items?: string }>;
}) {
  const [route, setRoute] = useState<{ restaurantId: string; tableNumber: number }>();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("Aanya Sharma");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useMemo(() => {
    void Promise.all([params, searchParams]).then(([nextParams, nextSearch]) => {
      setRoute({ restaurantId: nextParams.restaurantId, tableNumber: Number(nextParams.tableNumber) });
      try {
        setCart(nextSearch.items ? JSON.parse(nextSearch.items) : {});
      } catch {
        setError("This cart link is invalid. Please return to the menu.");
      }
    });
  }, [params, searchParams]);

  const menu = route ? getDemoMenu(route.restaurantId) : [];
  const items = menu.filter((item) => (cart[item.id] ?? 0) > 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0);
  const tax = Math.round(subtotal * 0.05);

  function updateQuantity(itemId: string, change: number) {
    setCart((current) => {
      const quantity = Math.max(0, (current[itemId] ?? 0) + change);
      const next = { ...current };
      if (quantity === 0) delete next[itemId];
      else next[itemId] = quantity;
      return next;
    });
  }

  function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!route || !customerName.trim() || items.length === 0 || submitting) {
      setError("Add at least one item and enter your name.");
      return;
    }
    setSubmitting(true);
    const order = createDemoOrder({ ...route, customerName, note, cart });
    window.location.assign(`/demo/order/${order.id}`);
  }

  if (!route) return <main className="grid min-h-screen px-5 py-8 md:py-16"><section className="m-auto w-full max-w-5xl rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12"><p className="leading-relaxed text-muted">Loading your cart…</p></section></main>;
  if (error) return <main className="grid min-h-screen px-5 py-8 md:py-16"><section className="m-auto w-full max-w-5xl rounded-[2rem] border border-[#d9aaa0] bg-[#fff5f1] p-6 shadow-daily md:p-12"><h1>Cart unavailable</h1><p className="leading-relaxed text-muted">{error}</p><Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-wine bg-wine px-4 py-3 font-extrabold text-surface no-underline hover:bg-wine-deep" href={`/demo/${route.restaurantId}/table/${route.tableNumber}`}>Back to menu</Link></section></main>;

  return (
    <main className="grid min-h-screen px-5 py-8 md:py-16 max-[480px]:px-4 max-[480px]:py-5">
      <section className="m-auto w-full max-w-5xl rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12 max-[480px]:rounded-2xl max-[480px]:p-5">
        <header className="mb-10 flex min-w-0 items-center justify-between gap-4"><Link className="font-serif text-xl font-bold tracking-[-0.035em] text-wine no-underline" href="/">Daily Dine</Link><span className="rounded-full border border-terracotta/25 bg-soft px-3 py-1.5 text-[0.67rem] font-extrabold uppercase tracking-[0.06em] text-terracotta">Table {route.tableNumber}</span></header>
        <p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-terracotta">Dine-in order</p>
        <h1>Review your order</h1>
        <ul className="my-7 grid gap-2">{items.map((item) => <li className="flex items-center justify-between gap-4 border-b border-line py-3" key={item.id}><span className="flex items-center gap-3">{item.name}<span className="flex items-center gap-2"><button className="grid h-8 w-8 min-h-8 place-items-center rounded-full border border-line bg-white font-extrabold text-wine" type="button" onClick={() => updateQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}>−</button>{cart[item.id]}<button className="grid h-8 w-8 min-h-8 place-items-center rounded-full border border-line bg-white font-extrabold text-wine" type="button" onClick={() => updateQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button></span></span><strong>₹{item.price * cart[item.id]}</strong></li>)}</ul>
        <div className="flex justify-between gap-4 border-b border-line py-3"><span>Subtotal</span><span>₹{subtotal}</span></div>
        <div className="flex justify-between gap-4 border-b border-line py-3"><span>Demo tax (5%)</span><span>₹{tax}</span></div>
        <div className="flex justify-between gap-4 border-b border-line py-3 text-lg text-wine"><span>Total · Pay at table</span><span>₹{subtotal + tax}</span></div>
        <form onSubmit={placeOrder}>
          <label className="mt-4 block text-sm font-extrabold">Name<input className="mt-2" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required /></label>
          <label className="mt-4 block text-sm font-extrabold">Note for the kitchen (optional)<input className="mt-2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Less spicy, please" /></label>
          <button className="mt-5 min-h-12 w-full rounded-full border border-wine bg-wine px-4 py-3 font-extrabold text-surface hover:bg-wine-deep disabled:cursor-wait disabled:opacity-60" type="submit" disabled={submitting}>{submitting ? "Placing order…" : "Place dine-in order"}</button>
        </form>
        <Link className="mt-5 inline-block text-sm font-extrabold text-wine hover:underline hover:underline-offset-4" href={`/demo/${route.restaurantId}/table/${route.tableNumber}`}>← Add more items</Link>
      </section>
    </main>
  );
}
