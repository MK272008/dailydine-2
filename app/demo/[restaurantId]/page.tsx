import Link from "next/link";
import { getDemoRestaurant } from "@/lib/demo/data";

export default async function RestaurantDemoPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const restaurant = getDemoRestaurant(restaurantId);

  if (!restaurant) {
    return <main className="grid min-h-screen px-5 py-8 md:py-16"><section className="m-auto w-full max-w-5xl rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12"><h1>Restaurant not found</h1><Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-wine bg-wine px-4 py-3 font-extrabold text-surface no-underline hover:bg-wine-deep" href="/">Back home</Link></section></main>;
  }

  return (
    <main className="grid min-h-screen px-5 py-8 md:py-16">
      <section className="m-auto w-full max-w-5xl rounded-[2rem] border border-line bg-surface p-6 shadow-daily md:p-12">
        <header className="mb-10 flex min-w-0 items-center justify-between gap-4"><Link className="font-serif text-xl font-bold tracking-[-0.035em] text-wine no-underline" href="/">Daily Dine</Link><span className="rounded-full border border-terracotta/25 bg-soft px-3 py-1.5 text-[0.67rem] font-extrabold uppercase tracking-[0.06em] text-terracotta">Demo foundation</span></header>
        <p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-terracotta">Restaurant ready</p>
        <h1>{restaurant.name}</h1>
        <p className="leading-relaxed text-muted">{restaurant.address} · {restaurant.tableCount} tables</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-wine bg-wine px-4 py-3 font-extrabold text-surface no-underline hover:bg-wine-deep" href={`/demo/${restaurant.id}/table/4`}>Open Table 4 QR</Link>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-full border border-line bg-transparent px-4 py-3 font-extrabold text-wine no-underline hover:bg-paper-deep" href="/demo/staff">Staff queue</Link>
        </div>
      </section>
    </main>
  );
}
