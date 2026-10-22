# Grant Rules and Calculations

> **Applies to:** every page · **Last updated:** October 22, 2026

How the site works out each team's grant category and award, and every calculated number on the Dashboard. The rules are the 2026–27 season's, taken from the Goals tab of *FTC IL Grant Status.xlsx*. They're built into the site (`src/lib/grant.ts`); changing a threshold or amount is a code change, not a setting.

## 1. Team age (from the team number)

FIRST issues team numbers in order, so a lower number means an older team.

| Team number | Team age |
|---|---|
| 35127 and up | **Rookie** |
| 25609 to 35126 | **Second Year** |
| 25608 and below | **Veteran** |

Examples: team 38467 is a Rookie, 29654 is Second Year, 15118 is a Veteran.

The coach also picks a category on the form (**Rookie/Veteran Status Provided** on Applications). The site doesn't use that answer for the grant. If it names an age that doesn't match the team number, Applications shows a yellow **form says …** flag so the Grant Administrator can check it.

## 2. Grant category (team age + School Title 1 Status)

The Grant Administrator enters **School Title 1 Status** (Yes/No) on Applications. Age and Title 1 together give the category, shown as **Rookie/Veteran Status for Grant** (Applications) and **Rookie/Veteran Status** (Dashboard).

| Team age | Title 1 = No | Title 1 = Yes |
|---|---|---|
| Rookie | Rookie 1 | Rookie 1 title 1 |
| Second Year | Second Year | Second Year Title 1 |
| Veteran | **Not Qualified** | Veteran Title 1 |

Until Title 1 is entered, the category is **Title 1 status needed**. A team in that state has no multiplier, maximums or award yet (those cells are blank), and it's left out of the Grant Matching Totals table.

## 3. Category settings

| Category | Matching multiplier | Max fundraising target | Grantor match per team (= Max Grant Award) |
|---|---|---|---|
| Rookie 1 | 1 to 1 | $1,500 | $1,500 |
| Rookie 1 title 1 | 1 to 3 | $1,000 | $3,000 |
| Second Year | 1 to 1 | $750 | $750 |
| Second Year Title 1 | 1 to 3 | $500 | $1,500 |
| Veteran Title 1 | 1 to 2 | $600 | $1,200 |
| Not Qualified | — | $0 | $0 |

- **Max fundraising target** (called **Team Target** on Fundraising Status) is the most of a team's own fundraising that gets matched.
- **Grantor match per team** = max fundraising target × multiplier. It's the most grant money one team in the category can receive, shown as **Max Grant Award** on Fundraising Status.

## 4. One team's award

**Raised by Team** is how much the team has raised. It starts as the form's HQ grant amount and the Grant Administrator can change it on Applications (see [Data and Refresh Data](data-and-refresh.md)).

| Number | Formula |
|---|---|
| **Possible Grant Award** | lesser of (Raised by Team, max fundraising target) × multiplier |
| **Unused Grant Match** | grantor match per team − Possible Grant Award, never below $0 |

Raising more than the target doesn't add grant money: the extra isn't matched. Unused Grant Match is the grant still available to the team if it raises more. It's $0 once the team reaches the target.

Blank Raised by Team means both numbers are blank. A Raised by Team showing **error** (the form's amount wasn't a number) counts as blank.

**Worked examples**

| Team | Category | Raised | Possible Grant Award | Unused Grant Match |
|---|---|---|---|---|
| Rookie, no Title 1 | Rookie 1 (1 to 1, target $1,500) | $900 | $900 × 1 = **$900** | $1,500 − $900 = **$600** |
| Rookie, no Title 1 | Rookie 1 | $2,000 | $1,500 (capped) × 1 = **$1,500** | **$0** |
| Rookie, Title 1 | Rookie 1 title 1 (1 to 3, target $1,000) | $400 | $400 × 3 = **$1,200** | $3,000 − $1,200 = **$1,800** |
| Second Year, Title 1 | Second Year Title 1 (1 to 3, target $500) | $500 | $500 × 3 = **$1,500** | **$0** |
| Veteran, Title 1 | Veteran Title 1 (1 to 2, target $600) | $250 | $250 × 2 = **$500** | $1,200 − $500 = **$700** |
| Veteran, no Title 1 | Not Qualified | $800 | **$0** | **$0** |

## 5. Amount of Check

Entered on the Dashboard's **Check Status** tab.

1. **Default:** the team's Possible Grant Award.
2. **Typed amount:** the Grant Administrator can type a different amount. It holds only while Possible Grant Award stays the same. If Possible Grant Award changes later (for example, Raised by Team is edited, or Title 1 changes the category), the check goes back to the new Possible Grant Award. Clearing the box also goes back to the default.
3. **Mailed (locked):** once **Check #** and **Date Check Mailed** are both filled in, the amount is frozen at what it was at that moment and shows a 🔒. Later changes to Possible Grant Award don't touch it. Clearing either field unlocks it, and rules 1–2 apply again.

**Example timeline** for a Rookie 1 team:

| Step | Possible Grant Award | Amount of Check |
|---|---|---|
| Raised by Team set to $900 | $900 | $900 (default) |
| Administrator types $850 | $900 | $850 (typed) |
| Raised by Team changed to $1,000 | $1,000 | $1,000 (award changed, typed amount dropped) |
| Check # and Date Check Mailed filled in | $1,000 | $1,000 🔒 |
| Raised by Team changed to $1,200 | $1,200 | still $1,000 🔒 (mailed) |

## 6. Grant Matching Totals (Dashboard)

One row per category (the five qualifying categories plus Not Qualified) and a Total row.

**Which applications count:**

- **Teams Applied** counts every application: a team that sent the form twice counts twice.
- **Every other column** counts each **approved** team once (Grant Approved = Yes). If a team sent the form more than once, the site uses its latest approved application, or its latest application if none is approved.
- Applications whose category is still **Title 1 status needed** aren't counted anywhere in the table until Title 1 is entered.

| Column | Formula |
|---|---|
| Teams Applied | Number of applications in the category. |
| Teams Awarded Grants | Number of approved teams in the category. |
| Matching Multiplier, Grantor Match per Team, Max Fundraising Target | The category settings (section 3). |
| Total Possible Grant Amount | Teams Awarded × Grantor Match per Team. The most the category could pay out if every approved team raised its target. |
| Total Team Fundraising as of *today* | Sum of Raised by Team for approved teams: everything they raised, not capped at the target. |
| Qualified Grants from Fundraising | Sum of Possible Grant Award for approved teams: what's been earned so far. |
| Grants Distributed to Teams | Sum of Amount of Check for approved teams whose check was mailed (Check # and Date Check Mailed both filled in). |

**Green highlight:** the Total Team Fundraising cell turns light green when every approved team in the category has raised at least the max fundraising target. In other words, Qualified Grants equals Total Possible Grant Amount. One team raising extra can't make up for a team that's short, because each team's award is capped. A category with no approved teams is never green.

**Example:** Rookie 1 with three approved teams that raised $900, $1,500 and $2,000:

- Total Possible Grant Amount = 3 × $1,500 = $4,500
- Total Team Fundraising = $900 + $1,500 + $2,000 = $4,400
- Qualified Grants = $900 + $1,500 + $1,500 = $3,900. The first team is short, so the cell isn't green.

## 7. Other totals

| Where | Number | Formula |
|---|---|---|
| Dashboard, under the title | "XX applications not fully reviewed/complete" | Applications (not teams) whose Grant Approved is blank or Under Review. |
| Applications, yellow box | Total applications, Grants approved, Rejected, Not reviewed, Under review | Counts of applications by Grant Approved answer, ignoring search and filter. |
| Fundraising Status / Check Status | Total row | Adds up the rows shown (blanks count as $0). It follows **Approved teams only**, and duplicate applications are each counted. The Check Status total includes unmailed checks, so it's usually more than Grants Distributed. |
| Grant Ask Tracker | Total Ask for Year | Cumulative: the last ask in the list that has a cumulative amount. Ask: the sum of every ask's Total Ask Amount. |

## Change history

- **Oct 22, 2026:** Document created.
