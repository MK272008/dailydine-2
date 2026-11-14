import Link from "next/link";
import { getDemoRestaurant } from "@/lib/demo/data";
import TableMenu from "./table-menu";

export default async function TableDemoPage({
  params,
}: {
  params: Promise<{ restaurantId: string; tableNumber: string }>;
}) {
  const { restaurantId, tableNumber } = await params;
  const restaurant = getDemoRestaurant(restaurantId);

  if (!restaurant || Number(tableNumber) < 1 || Number(tableNumber) > restaurant.tableCount) {
    return <main className="page-shell"><section className="card error-card"><h1>Table not found</h1><p className="muted">That QR link is not valid for this demo restaurant.</p><Link className="button" href="/">Back home</Link></section></main>;
  }

  return <TableMenu restaurantId={restaurant.id} restaurantName={restaurant.name} address={restaurant.address} tableNumber={Number(tableNumber)} tableCount={restaurant.tableCount} />;
}
