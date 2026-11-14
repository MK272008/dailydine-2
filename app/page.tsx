import { Badge, ButtonLink } from "./components/ui";

export default function HomePage() {
  return (
    <main className="grid min-h-screen px-5 py-8 md:py-16">
      <section className="mx-auto grid w-full max-w-[78rem] items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(22rem,0.78fr)] md:gap-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.05em] text-muted"><Badge>Pitch demo</Badge><span className="text-terracotta">●</span><span>Built for better service</span></div>
          <h1>Dining should feel this easy.</h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted">Daily Dine connects the table, the kitchen, and the guest in one calm flow — from the first QR scan to the last served plate.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/demo/green-table">Open guest demo <span aria-hidden="true">↗</span></ButtonLink>
            <ButtonLink variant="secondary" href="/demo/staff">Open staff workspace</ButtonLink>
            <ButtonLink variant="secondary" href="/demo/owner">Open owner dashboard</ButtonLink>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-[0.72rem] font-extrabold uppercase tracking-[0.06em] text-muted"><span className="grid h-6 w-6 place-items-center rounded-full bg-saffron text-wine">◎</span><span>One shared service view</span><span className="h-px w-8 bg-line" /><span>Live demo data</span></div>
        </div>
        <div className="relative min-h-[23rem] overflow-hidden rounded-[2rem] bg-wine shadow-[1rem_1rem_0_#eee2d1] md:min-h-[34rem] max-[480px]:min-h-[23rem] max-[480px]:rounded-2xl max-[480px]:shadow-[0.65rem_0.65rem_0_#eee2d1]" aria-label="Daily Dine service overview">
          <div className="absolute -left-36 top-12 h-96 w-96 rounded-full border border-surface/20" /><div className="absolute -left-24 top-24 h-72 w-72 rounded-full border border-surface/20" />
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 font-serif text-2xl leading-[0.96] text-surface"><img className="h-16 w-16 rounded-full border-4 border-surface object-cover" src="/logo.jpeg" alt="" /><span>Hassle free<br />dining</span></div>
          <div className="absolute right-[7%] top-[13%] grid min-w-[10.5rem] rotate-2 gap-1 rounded-2xl border border-wine/10 bg-surface p-4 shadow-[0_1rem_2rem_rgb(36_10_18/25%)] md:min-w-[12.5rem]"><span className="text-[0.61rem] font-extrabold uppercase tracking-[0.09em] text-muted">TABLE 04</span><strong className="font-serif text-base text-wine">Order received</strong><small className="text-[0.61rem] font-extrabold uppercase tracking-[0.09em] text-muted">Paneer Tikka · 2 items</small><i className="absolute right-4 top-4 text-xs not-italic text-terracotta">●</i></div>
          <div className="absolute bottom-[11%] left-[7%] grid min-w-[10.5rem] -rotate-2 gap-1 rounded-2xl border border-wine/10 bg-surface p-4 shadow-[0_1rem_2rem_rgb(36_10_18/25%)] md:min-w-[12.5rem]"><span className="text-[0.61rem] font-extrabold uppercase tracking-[0.09em] text-muted">STAFF VIEW</span><strong className="font-serif text-base text-wine">3 tables active</strong><small className="text-[0.61rem] font-extrabold uppercase tracking-[0.09em] text-muted">Ready when you are</small><i className="absolute right-4 top-4 text-xs not-italic text-terracotta">↗</i></div>
          <span className="absolute left-[12%] top-[28%] text-xl text-saffron">✦</span><span className="absolute bottom-[30%] right-[12%] text-sm text-surface">✦</span>
        </div>
        <div id="how-it-works" className="col-span-full grid gap-4 md:grid-cols-3">
          <article className="min-h-44 border-t-2 border-wine bg-surface/50 p-5"><h2>Guests scan in.</h2><p className="text-sm leading-relaxed text-muted">A table QR opens a focused menu with no app download or login.</p></article>
          <article className="min-h-44 border-t-2 border-wine bg-surface/50 p-5"><h2>Staff stay in sync.</h2><p className="text-sm leading-relaxed text-muted">Every order lands in a clear service queue with the next action ready.</p></article>
          <article className="min-h-44 border-t-2 border-wine bg-surface/50 p-5"><h2>Owners see the story.</h2><p className="text-sm leading-relaxed text-muted">The production vision connects verified payments to owner-only sales insight.</p></article>
        </div>
      </section>
    </main>
  );
}
