# Totals & Fundraising

> **Address:** `/` · **Last updated:** October 19, 2026

The home page. It shows the grant totals by category and the fundraising and check details for approved teams.

## Grant Matching Totals

- **Refresh Data** (top right) pulls the latest grant form responses and the BioBuzz team list, and shows when data was last refreshed. *Mockup: it only updates the time.*
- One row per category, plus a Total row:

| Column | How it's worked out |
|---|---|
| Teams Applied | Teams that sent the form, each team counted once. |
| Teams Awarded Grants | Teams with Team Approved for Grant = Yes. |
| Matching Multiplier / Grantor Match per Team / Max Fundraising Target | Category settings (see below). |
| Total Possible Grant Amount | Teams Awarded × Grantor Match per Team. |
| Fundraising as of today | Sum of How Much Raised for approved teams. |
| Qualified Grants from Fundraising | Sum of Possible Grant Award for approved teams. |
| Grants Distributed to Teams | Sum of Amount of Check for approved teams. |

- If any application has no School Title 1 Status yet, a yellow notice says how many, links to Applications filtered to them, and those teams are left out of the table.
- Below the table: **Team Age Thresholds** and the **Grant Category Lookup**.

| Category | Multiplier | Max fundraising | Grantor match |
|---|---|---|---|
| Rookie 1 | 1 to 1 | $1,500 | $1,500 |
| Rookie 1 title 1 | 1 to 3 | $1,000 | $3,000 |
| Second Year | 1 to 1 | $750 | $750 |
| Second Year Title 1 | 1 to 3 | $500 | $1,500 |
| Veteran Title 1 | 1 to 2 | $600 | $1,200 |
| Not Qualified | — | $0 | $0 |

## Fundraising Status

- Approved teams by default; untick **Approved teams only** to see every application.
- Yellow columns are entered by the Grant Administrator: **How Much Raised by Team**, **Amount of Check**, **Check #** and **Date Check Mailed**.
- Changing How Much Raised sets **Date of Last Fundraising Update** to today and recalculates **Possible Grant Award**, **Unused Grant Match** (possible award less amount raised) and the totals above.
- Check addressee and address come from the form. **Grant Award Email Sent** is the latest "Grant Award" entry in the Email Log for that team.

## Change history

- **Oct 19, 2026:** Page created (mockup).
