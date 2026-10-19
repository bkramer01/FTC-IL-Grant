import type { Metadata } from "next";
import { loadClientGrantData } from "@/lib/data";
import { todayCentral } from "@/lib/format";
import { Dashboard } from "./Dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <Dashboard data={loadClientGrantData()} today={todayCentral()} />;
}
