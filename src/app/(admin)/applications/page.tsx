import type { Metadata } from "next";
import { findFilter } from "@/lib/app-filters";
import { loadClientGrantData } from "@/lib/data";
import { ApplicationsTable } from "./ApplicationsTable";

export const metadata: Metadata = { title: "Applications" };

/** `?show=<filter>` opens the page with that Show filter picked, e.g. `?show=notReviewed`. */
export default async function ApplicationsPage({ searchParams }: PageProps<"/applications">) {
  const { show } = await searchParams;
  const filter = findFilter(show)?.value ?? "all";
  return <ApplicationsTable data={loadClientGrantData()} initialFilter={filter} />;
}
