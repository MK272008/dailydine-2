"use client";

import Link from "next/link";

const salesByDay = [
  { day: "Mon", value: 42, amount: "₹6.4k" },
  { day: "Tue", value: 58, amount: "₹8.8k" },
  { day: "Wed", value: 46, amount: "₹7.1k" },
  { day: "Thu", value: 68, amount: "₹10.2k" },
  { day: "Fri", value: 78, amount: "₹11.7k" },
  { day: "Sat", value: 92, amount: "₹13.8k" },
  { day: "Sun", value: 72, amount: "₹10.8k" },
];

const transactions = [
  { id: "VX-1043", customer: "Aanya Sharma", type: "Dine-in", amount: "₹522", status: "Verified", time: "12:42 PM" },
  { id: "VX-1042", customer: "Rohan Mehta", type: "Dine-in", amount: "₹469", status: "Verified", time: "12:18 PM" },
  { id: "VX-1039", customer: "Mira Kapoor", type: "Takeaway", amount: "₹780", status: "Verified", time: "11:56 AM" },
  { id: "VX-1037", customer: "Arjun Rao", type: "Dine-in", amount: "₹348", status: "Refunded", time: "11:32 AM" },
];

function downloadCsv() {
  const rows = [
    ["Order", "Customer", "Type", "Amount", "Status", "Time"],
    ...transactions.map((transaction) => [transaction.id, transaction.customer, transaction.type, transaction.amount, transaction.status, transaction.time]),
  ];
  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "daily-dine-demo-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function OwnerDemoPage() {
  return (
    <main className="grid min-h-screen px-5 py-8 md:py-16 max-[480px]:px-4 max-[480px]:py-5">
      <section className="m-auto w-full max-w-[82rem] rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12 max-[480px]:rounded-2xl max-[480px]:p-5">
        <header className="flex items-center justify-between gap-4 border-b border-line pb-5">
          <div className="mb-0 flex min-w-0 items-center justify-between gap-4"><Link className="font-serif text-xl font-bold tracking-[-0.035em] text-wine no-underline" href="/">Daily Dine</Link><span className="rounded-full border border-surface/20 bg-wine px-3 py-1.5 text-[0.67rem] font-extrabold uppercase tracking-[0.06em] text-surface">Owner preview</span>
          </div>
          <div className="text-xs font-bold text-muted"><span className="mr-1 inline-block h-2 w-2 rounded-sm border-2 border-sage" /> Owner-only financial view</div>
        </header>

        <div className="flex items-end justify-between gap-8 py-8 max-lg:flex-col max-lg:items-start">
          <div>
            <p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-terracotta">Financial control center</p>
            <h1 className="mb-3">Know how your service is doing.</h1>
            <p className="max-w-xl leading-relaxed text-muted">A verified view of sales, payment health, and the moments that need your attention.</p>
          </div>
          <div className="grid min-w-[22rem] grid-cols-2 gap-3 max-lg:w-full max-lg:max-w-sm max-[480px]:grid-cols-1">
            <label className="mt-0 text-xs font-extrabold uppercase tracking-wide text-muted">Restaurant<select className="mt-2" defaultValue="green-table"><option>The Green Table</option><option>Coastal Kitchen</option></select></label>
            <label className="mt-0 text-xs font-extrabold uppercase tracking-wide text-muted">Period<select className="mt-2" defaultValue="7 days"><option>Last 7 days</option><option>Last 30 days</option></select></label>
          </div>
        </div>

        <div className="mb-5 rounded-xl border border-saffron/40 bg-[#fbf0d8] p-3 text-xs leading-relaxed text-[#765a24]"><span className="mr-1 font-extrabold uppercase text-wine">Demo data</span> Illustrative figures only — this preview is not connected to Razorpay, Firestore, or live payment records.</div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Financial overview">
          <article className="grid min-h-36 gap-2 rounded-2xl border border-wine bg-wine p-4 text-surface"><span className="text-[0.69rem] font-extrabold uppercase tracking-[0.08em] text-paper-deep">Gross sales</span><strong className="self-center font-serif text-3xl tracking-[-0.05em] text-surface">₹68,820</strong><small className="self-end text-xs text-paper-deep">↑ 18.4% vs previous week</small></article>
          <article className="grid min-h-36 gap-2 rounded-2xl border border-line bg-surface p-4"><span className="text-[0.69rem] font-extrabold uppercase tracking-[0.08em] text-muted">Verified payments</span><strong className="self-center font-serif text-3xl tracking-[-0.05em] text-wine">₹64,940</strong><small className="self-end text-xs text-muted">94.4% of gross sales</small></article>
          <article className="grid min-h-36 gap-2 rounded-2xl border border-line bg-surface p-4"><span className="text-[0.69rem] font-extrabold uppercase tracking-[0.08em] text-muted">Completed orders</span><strong className="self-center font-serif text-3xl tracking-[-0.05em] text-wine">186</strong><small className="self-end text-xs text-muted">Average order ₹370</small></article>
          <article className="grid min-h-36 gap-2 rounded-2xl border border-line bg-surface p-4"><span className="text-[0.69rem] font-extrabold uppercase tracking-[0.08em] text-muted">Tax collected</span><strong className="self-center font-serif text-3xl tracking-[-0.05em] text-wine">₹3,276</strong><small className="self-end text-xs text-muted">5% demo tax basis</small></article>
        </section>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.45fr_0.75fr]">
          <section className="min-w-0 rounded-2xl border border-line bg-white/45 p-5">
            <div className="flex items-start justify-between gap-4"><div><h2 className="mb-1">Sales trend</h2><p className="text-xs leading-relaxed text-muted">Verified and completed order value</p></div><span className="text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-terracotta">7 days</span></div>
            <div className="flex h-60 items-end justify-around gap-2 pt-8" aria-label="Sales trend for the last seven days">
              {salesByDay.map((entry) => <div className="relative grid h-full w-full items-end justify-items-center gap-2" key={entry.day}><span className="absolute -top-1 text-[0.62rem] font-extrabold text-muted">{entry.amount}</span><div className={`min-h-2 w-7 rounded-t-xl transition-all duration-500 ${entry.value >= 78 ? "bg-wine" : "bg-terracotta"}`} style={{ height: `${entry.value}%` }} /><small className="text-[0.68rem] font-extrabold text-muted">{entry.day}</small></div>)}
            </div>
          </section>
          <section className="min-w-0 rounded-2xl border border-line bg-white/45 p-5">
            <div className="flex items-start justify-between gap-4"><div><h2 className="mb-1">Order mix</h2><p className="text-xs leading-relaxed text-muted">Where sales are coming from</p></div></div>
            <div className="mt-8 grid gap-4"><div className="flex items-center justify-between gap-4 border-b border-line pb-3"><span className="inline-flex items-center gap-2 text-sm text-muted"><i className="h-2.5 w-2.5 rounded-full bg-wine" />Dine-in</span><strong className="text-wine">72%</strong></div><div className="flex items-center justify-between gap-4 border-b border-line pb-3"><span className="inline-flex items-center gap-2 text-sm text-muted"><i className="h-2.5 w-2.5 rounded-full bg-terracotta" />Takeaway</span><strong className="text-wine">19%</strong></div><div className="flex items-center justify-between gap-4 border-b border-line pb-3"><span className="inline-flex items-center gap-2 text-sm text-muted"><i className="h-2.5 w-2.5 rounded-full bg-saffron" />Pre-order</span><strong className="text-wine">9%</strong></div></div>
            <div className="mt-5 flex items-center justify-between gap-4 text-xs text-muted"><span>186 orders</span><strong className="text-wine">₹68,820</strong></div>
          </section>
        </div>

        <section className="mt-3 min-w-0 rounded-2xl border border-line bg-white/45 p-5" id="transactions">
          <div className="flex items-start justify-between gap-4"><div><h2 className="mb-1">Recent verified transactions</h2><p className="text-xs leading-relaxed text-muted">The latest payment records available to the owner.</p></div><button className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-transparent px-4 py-3 text-[0.84rem] font-extrabold text-wine hover:bg-paper-deep" type="button" onClick={downloadCsv}>Export CSV</button></div>
          <div className="mt-5 overflow-x-auto" role="table" aria-label="Recent transactions">
            <div className="grid min-w-[48rem] grid-cols-[0.8fr_1.2fr_0.8fr_0.7fr_0.85fr_0.65fr] items-center gap-3 border-t-0 py-3 text-[0.64rem] font-extrabold uppercase tracking-wider text-muted" role="row"><span>Order</span><span>Customer</span><span>Type</span><span>Amount</span><span>Status</span><span>Time</span></div>
            {transactions.map((transaction) => <div className="grid min-w-[48rem] grid-cols-[0.8fr_1.2fr_0.8fr_0.7fr_0.85fr_0.65fr] items-center gap-3 border-t border-line py-3 text-xs text-muted" role="row" key={transaction.id}><strong className="text-ink">{transaction.id}</strong><span>{transaction.customer}</span><span>{transaction.type}</span><strong className="text-ink">{transaction.amount}</strong><span className={`w-fit rounded-full px-2 py-1 text-[0.62rem] font-extrabold ${transaction.status === "Verified" ? "bg-[#e3eee1] text-[#4e6d4a]" : "bg-soft text-terracotta"}`}>{transaction.status}</span><span className="whitespace-nowrap">{transaction.time}</span></div>)}
          </div>
        </section>

        <section className="mt-10 grid gap-8 border-t border-line pt-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div><p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-terracotta">Needs attention</p><h2>Keep trust visible.</h2><p className="max-w-md text-xs leading-relaxed text-muted">These are the exceptions an owner should be able to resolve before they become a reconciliation problem.</p></div>
          <div className="grid gap-3"><div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-line bg-surface p-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-soft font-extrabold text-terracotta">!</span><span className="grid gap-1"><strong className="text-xs">2 payment-pending sessions</strong><small className="text-[0.68rem] text-muted">Served tables still awaiting closure</small></span><a className="text-xs font-extrabold text-wine no-underline" href="#transactions">Review</a></div><div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-line bg-surface p-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e3eee1] font-extrabold text-sage">↗</span><span className="grid gap-1"><strong className="text-xs">1 refund this period</strong><small className="text-[0.68rem] text-muted">VX-1037 · ₹348 returned</small></span><a className="text-xs font-extrabold text-wine no-underline" href="#transactions">Open</a></div></div>
        </section>
      </section>
    </main>
  );
}
