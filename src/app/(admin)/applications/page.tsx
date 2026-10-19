import type { Metadata } from "next";
import { loadClientGrantData } from "@/lib/data";
import { ApplicationsTable, type AppFilter } from "./ApplicationsTable";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage({ searchParams }: PageProps<"/applications">) {
  const { title1 } = await searchParams;
  const filter: AppFilter = title1 === "needed" ? "title1" : "all";
  return <ApplicationsTable data={loadClientGrantData()} initialFilter={filter} />;
}
