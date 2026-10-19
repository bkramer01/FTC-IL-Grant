# Dashboard

> **Address:** `/` · **Last updated:** October 19, 2026

The home page, titled **FTC Illinois Matching Grants, 2026–27 season**. It has three sections: Grant Matching Totals, Fundraising Status (with a Check Status tab) and Grant Rules.

## Grant Matching Totals

- **Refresh Data** (top right) pulls the latest grant form responses and the BioBuzz team list, and shows when data was last refreshed. *Mockup: it only updates the time.*
- One row per category, plus a Total row. Hover the **Teams Applied ⓘ** heading for how teams are counted. The asterisk (*) on **Rookie/Veteran Status** links to the explanation in Grant Rules.

| Column | How it's worked out |
|---|---|
| Teams Applied | Teams that sent the form, each team counted once. |
| Teams Awarded Grants | Teams with Team Approved for Grant = Yes. |
| Matching Multiplier / Grantor Match per Team / Max Fundraising Target | Category settings (see Grant Rules). |
| Total Possible Grant Amount | Teams Awarded × Grantor Match per Team. |
| Fundraising as of today | Sum of Raised by Team for approved teams. |
| Qualified Grants from Fundraising | Sum of Possible Grant Award for approved teams. |
| Grants Distributed to Teams | Sum of Amount of Check for approved teams. |

- If any application has no School Title 1 Status yet, a yellow notice says how many, links to Applications filtered to them, and those teams are left out of the table.

## Fundraising Status

- Approved teams by default; untick **Approved teams only** to see every application.
- Two tabs, each starting with Team # and Team Name:
  - **Fundraising Status:** Coach 1, Approved, Rookie/Veteran Status, Possible Grant Award, **Raised by Team**, Unused Grant Match, Last Update (date the amount raised was last changed).
  - **Check Status:** Check Addressee, Street Address, City/State/Zip, **Amount of Check**, **Check #**, **Date Check Mailed**, Grant Award Email Sent.
- Click a heading with ↕ to sort; click again to reverse. Fundraising Status sorts by **Team #**, **Approved** and **Rookie/Veteran Status**; Check Status sorts by **Team #**, **Amount of Check**, **Check #**, **Date Check Mailed** and **Grant Award Email Sent**. Blank values always sort last. The sort carries over between tabs.
- The row count is shown under the table.
- The columns in bold above have yellow headings: the Grant Administrator enters them. Changing Raised by Team sets the update date to today and recalculates Possible Grant Award, Unused Grant Match (possible award less amount raised) and the totals.
- Check addressee and address come from the form. **Grant Award Email Sent** is the latest "Grant Award" entry in the Email Log for that team.

## Grant Rules

A starred (*) note explains how Rookie/Veteran Status is worked out: team age from the team number (**Team Age Thresholds**), combined with School Title 1 Status (**Grant Category Lookup**). Category settings:

| Category | Multiplier | Max fundraising | Grantor match |
|---|---|---|---|
| Rookie 1 | 1 to 1 | $1,500 | $1,500 |
| Rookie 1 title 1 | 1 to 3 | $1,000 | $3,000 |
| Second Year | 1 to 1 | $750 | $750 |
| Second Year Title 1 | 1 to 3 | $500 | $1,500 |
| Veteran Title 1 | 1 to 2 | $600 | $1,200 |
| Not Qualified | — | $0 | $0 |

## Change history

- **Oct 19, 2026:** Asterisk on Rookie/Veteran Status in Grant Matching Totals, linking to a starred explanation in Grant Rules.
- **Oct 19, 2026:** Check Status columns Amount of Check, Check #, Date Check Mailed and Grant Award Email Sent are sortable.
- **Oct 19, 2026:** "Date of Last Fundraising Update" renamed to "Last Update" and "How Much Raised by Team" to "Raised by Team"; Fundraising Status headings on one line.
- **Oct 19, 2026:** Renamed from Totals & Fundraising to Dashboard with a new page title. Teams Applied explanation moved to a hover note. Fundraising Status split into Fundraising Status and Check Status tabs, with two-line headings, sorting by Team #, Approved and Rookie/Veteran Status, and a row count. Grant rules moved to the bottom.
- **Oct 19, 2026:** Page created (mockup).
