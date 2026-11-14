"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDemoMenu, type DemoMenuItem } from "@/lib/demo/data";
import { getDemoMenuAvailability, getDemoOrders, type DemoOrder } from "@/lib/demo/store";

type Cart = Record<string, number>;

export default function TableMenu({
  restaurantId,
  restaurantName,
  address,
  tableNumber,
  tableCount,
}: {
  restaurantId: string;
  restaurantName: string;
  address: string;
  tableNumber: number;
  tableCount: number;
}) {
  const [cart, setCart] = useState<Cart>({});
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [tableOrder, setTableOrder] = useState<DemoOrder>();
  const menu = getDemoMenu(restaurantId);
  const groupedMenu = useMemo(() => Object.groupBy(menu, (item) => item.category), [menu]);
  const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = menu.reduce((sum, item) => sum + item.price * (cart[item.id] ?? 0), 0);

  useEffect(() => {
    const refresh = () => {
      setAvailability(getDemoMenuAvailability());
      const currentOrder = getDemoOrders()
        .filter((order) => order.restaurantId === restaurantId && order.tableNumber === tableNumber)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      setTableOrder(currentOrder);
    };
    refresh();
    window.addEventListener("venturex-demo-orders-changed", refresh);
    window.addEventListener("venturex-demo-menu-availability-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("venturex-demo-orders-changed", refresh);
      window.removeEventListener("venturex-demo-menu-availability-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [restaurantId, tableNumber]);

  function updateQuantity(item: DemoMenuItem, change: number) {
    if (availability[item.id] === false) return;
    setCart((current) => {
      const nextQuantity = Math.max(0, (current[item.id] ?? 0) + change);
      const next = { ...current };
      if (nextQuantity === 0) delete next[item.id];
      else next[item.id] = nextQuantity;
      return next;
    });
  }

  return (
    <main className="grid min-h-screen px-5 py-8 md:py-16 max-[480px]:px-4 max-[480px]:py-5">
      <section className="m-auto w-full max-w-5xl rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12 max-[480px]:rounded-2xl max-[480px]:p-5">
        <header className="mb-10 flex min-w-0 items-center justify-between gap-4"><Link className="font-serif text-xl font-bold tracking-[-0.035em] text-wine no-underline" href="/">Daily Dine</Link><span className="rounded-full border border-terracotta/25 bg-soft px-3 py-1.5 text-[0.67rem] font-extrabold uppercase tracking-[0.06em] text-terracotta">Table {tableNumber}</span>
        </header>
        <nav className="mt-[-0.5rem] mb-7 grid gap-2 border-b border-line pb-4" aria-label="Choose a table">
          <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-muted">Your table</span>
          <div className="flex gap-1.5 overflow-x-auto pb-1">{Array.from({ length: tableCount }, (_, index) => index + 1).map((number) => <Link className={`grid h-8 min-h-8 min-w-8 place-items-center rounded-full border text-xs font-extrabold no-underline ${number === tableNumber ? "border-wine bg-wine text-surface" : "border-line text-muted hover:border-wine hover:text-wine"}`} href={`/demo/${restaurantId}/table/${number}`} key={number}>{number}</Link>)}</div>
          {tableOrder && <Link className={`w-fit rounded-full px-2.5 py-1.5 text-[0.7rem] font-extrabold no-underline ${tableOrder.status === "NEW" ? "bg-soft text-wine" : tableOrder.status === "PREPARING" ? "bg-[#f8edc9] text-[#8b671d]" : tableOrder.status === "READY" ? "bg-[#e3eee1] text-[#4e6d4a]" : "bg-paper-deep text-muted"}`} href={`/demo/order/${tableOrder.id}`}>Order {tableOrder.id} · {tableOrder.status.toLowerCase()}</Link>}
        </nav>
        <p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-terracotta">{restaurantName}</p>
        <h1>What are you in the mood for?</h1>
        <p className="leading-relaxed text-muted">{address} · Dine-in · Pay at table</p>
        {Object.entries(groupedMenu).map(([category, items]) => (
          <section className="mt-7" key={category}>
            <h2 className="flex items-center gap-3 after:h-px after:w-16 after:bg-line after:content-['']">{category}</h2>
            {items?.map((item) => (
              <article className="flex min-w-0 items-center justify-between gap-4 border-t border-line py-3" key={item.id}>
                <div className="flex min-w-0 items-center gap-3"><img className="h-14 w-14 shrink-0 rounded-xl border border-line object-cover" src={item.imageSrc} alt="" /><div className="min-w-0"><h3 className="mb-1 font-sans text-base text-ink">{item.name}</h3><p className="mb-0 max-w-xl text-sm leading-snug text-muted">{item.description}</p><strong className="mt-2 block text-wine">₹{item.price}</strong></div></div>
                {availability[item.id] === false ? <span className="rounded-full bg-paper-deep px-3 py-2 text-[0.68rem] font-extrabold text-muted">Sold out</span> : (cart[item.id] ?? 0) > 0 ? (
                  <div className="flex items-center gap-2"><button className="grid h-8 w-8 min-h-8 place-items-center rounded-full border border-line bg-white font-extrabold text-wine" type="button" onClick={() => updateQuantity(item, -1)} aria-label={`Remove one ${item.name}`}>−</button><span>{cart[item.id]}</span><button className="grid h-8 w-8 min-h-8 place-items-center rounded-full border border-line bg-white font-extrabold text-wine" type="button" onClick={() => updateQuantity(item, 1)} aria-label={`Add one ${item.name}`}>+</button></div>
                ) : <button className="min-w-16 rounded-full border border-wine bg-transparent px-3 py-2 text-xs font-extrabold text-wine transition hover:bg-wine hover:text-surface" type="button" onClick={() => updateQuantity(item, 1)}>Add</button>}
              </article>
            ))}
          </section>
        ))}
        {itemCount > 0 && (
          <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-4 rounded-2xl bg-wine p-4 text-surface shadow-[0_1rem_2rem_rgb(67_17_30/24%)] max-[480px]:bottom-3 max-[480px]:flex-col max-[480px]:items-stretch">
            <div><strong>{itemCount} {itemCount === 1 ? "item" : "items"}</strong><p>Subtotal ₹{subtotal}</p></div>
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-saffron bg-saffron px-4 py-3 text-[0.84rem] font-extrabold text-wine-deep no-underline hover:bg-surface max-[480px]:w-full" href={`/demo/${restaurantId}/table/${tableNumber}/cart?items=${encodeURIComponent(JSON.stringify(cart))}`}>View cart</Link>
          </div>
        )}
      </section>
    </main>
  );
}
