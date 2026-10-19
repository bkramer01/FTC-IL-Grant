import type { Metadata } from "next";
import { loadClientGrantData } from "@/lib/data";
import { todayCentral } from "@/lib/format";
import { TotalsAndFundraising } from "./TotalsAndFundraising";

export const metadata: Metadata = { title: "Totals & Fundraising" };

export default function TotalsPage() {
  return <TotalsAndFundraising data={loadClientGrantData()} today={todayCentral()} />;
}
