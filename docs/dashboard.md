# Dashboard

> **Address:** `/` · **Last updated:** October 23, 2026

The home page, titled **FTC Illinois Matching Grants, 2026–27 season**. It has four sections: Grant Matching Totals, Grant Ask Tracker, Fundraising Status (with a Check Status tab) and Grant Rules.

## Grant Matching Totals

- **Refresh Data** (top right) reads the latest grant form responses and the BioBuzz team list from Google Sheets, saves them, and reloads the page. It shows when data was last refreshed ("never" before the first refresh). Responses deleted from the sheet disappear on the next refresh; the administrator's entries stay linked to each response by its timestamp. Each refresh also copies the form's HQ grant amount (column I) into **Raised by Team** for any response that doesn't have one yet (see Applications); amounts already copied or typed in are never overwritten. If a sheet can't be read (not shared with the service account, or a key column moved), nothing changes and the reason appears under the button.
- Every formula on this page, with worked examples, is in [Grant Rules and Calculations](grant-rules.md). Where the data comes from and what Refresh Data changes is in [Data and Refresh Data](data-and-refresh.md).
- **Ask Period** filter (top right, next to Refresh Data): **All Ask Periods** (the default), one ask, or **Unassigned**. Picking an ask limits every column except Teams Applied to the approved teams assigned to that ask on Check Status; **Unassigned** shows approved teams with no ask yet. A blue note under the title says what's shown. Asks appear in the list once they have both a start and end date. If the chosen ask is removed or loses a date, the filter goes back to All Ask Periods. The filter isn't saved: the page always opens on All Ask Periods.
- One row per category, plus a Total row. Hover the **Teams Applied ⓘ** heading for how teams are counted. The asterisk (*) on **Rookie/Veteran Status** links to the explanation in Grant Rules.

| Column | How it's worked out |
|---|---|
| Teams Applied | Every grant application, by rookie/veteran status: a team that sent the form twice counts twice. Applications still missing a School Title 1 Status aren't counted until it's entered. The other columns count only teams with Grant Approved = Yes, each team once. |
| Teams Awarded Grants | Teams with Grant Approved = Yes, each team once (its latest approved application). |
| Matching Multiplier / Grantor Match per Team / Max Fundraising Target | Category settings (see Grant Rules). |
| Total Possible Grant Amount | Teams Awarded × Grantor Match per Team. |
| Total Team Fundraising as of today | Sum of Raised by Team for approved teams: 100% of what they raised, not capped at the max fundraising target. |
| Qualified Grants from Fundraising | Sum of Possible Grant Award for approved teams. |
| Grants Distributed to Teams | Sum of Amount of Check for approved teams whose check was mailed (Check # and Date Check Mailed both filled in). Hover the heading (ⓘ): "Includes amount of checks mailed to teams". |

- When every approved team in a category has raised at least that category's Max Fundraising Target, its **Total Team Fundraising** cell turns light green. Hover the heading (ⓘ) or a green cell for an explanation. One team raising extra can't make up for another team that is short, and categories with no awarded teams never turn green.

- **⤓ Grant Matching Report** (top right, next to Refresh Data) downloads the table, as currently filtered, as an Excel file, `grant-matching-report-YYYY-MM-DD.xlsx`: a "Grant Matching Report - as of" title row (with the ask name, e.g. "Grant Matching Report - Ask 2 - as of", when the Ask Period filter is set) with the date and time, then the same columns, category rows and Total row. Headings and the Total row are bold, amounts are real numbers with dollar formatting, the heading row stays frozen when scrolling, and Total Team Fundraising has the same light green fill as the page. The note, Grant Rules and other sections aren't included. Unsaved edits on the page are included.
- Under the title, a small yellow note reads "XX applications not fully reviewed/complete.": XX counts every submission whose Grant Approved is blank or Under Review. The count links to Applications filtered to those rows. Teams still missing a School Title 1 Status are left out of the table.

## Grant Ask Tracker

Tracks requests for funds from the Donor Fund during the season. The Grant Administrator names each ask and sets its dates; the amounts are calculated from the teams assigned to it with **Ask Period** on Check Status. One row per ask:

| Column | What goes in it |
|---|---|
| Name | Defaults to "Ask 1", "Ask 2", …; can be renamed (teams assigned to it follow the new name). |
| Start Date / End Date | The period the ask covers. An ask with **both** dates is *active*: it's offered in Ask Period on Check Status and in the Ask Period filter. A row whose end date is before its start date is flagged. |
| Cumulative Qualified Grants as of End Date | Calculated, read-only: a running total of Total Ask Amount, this ask's plus every ask above it. |
| Total Ask Amount from Donor Fund | Calculated, read-only: the Amount of Check (mailed or not) of the approved teams assigned to this ask, each team once. Updates as teams are assigned or their check amounts change. |

- The two calculated headings are plain (white) and have hover notes (ⓘ). Amounts typed into these columns before Oct 23, 2026 are no longer used.
- **+ Add ask** adds a row. There's no limit on the number of asks.
- **Remove** deletes an ask. If any teams are assigned to it, a message asks first (for example, "3 teams are assigned to Ask 2. Remove Ask 2 anyway? Those teams will no longer have an Ask Period."). Removing it anyway clears Ask Period for those teams.
- **Total Ask for Year**: the sum of every ask's Total Ask Amount (the same number under both columns).
- Each change saves as you go. Asks are listed in the order they were added.
- How the numbers are worked out: [Grant Rules](grant-rules.md#7-ask-periods-and-the-grant-ask-tracker).

## Fundraising Status

- One row per application (a team that applied twice has two rows, each with a yellow ×2 badge). Approved applications by default; untick **Approved teams only** to see every application.
- A team number that isn't on the BioBuzz list shows a red **not in BioBuzz** badge instead of a team name.
- Two tabs, each starting with Team # and Team Name:
  - **Fundraising Status:** Coach Name, Approved, Rookie/Veteran Status, Matching Multiplier, Max Grant Award (max fundraising target × multiplier, the grantor match per team; blank until Title 1 is entered), Team Target (the category's Max Fundraising Target: the most of a team's fundraising that gets matched, from the category settings), Raised by Team (read-only; shows **error** when the form's HQ grant amount isn't a number, and counts as $0 in the totals), Possible Grant Award, Unused Grant Match, Last Update (date the amount raised was last changed).
  - **Check Status:** Check Addressee, Street Address, City, State, Zip (from the form's new Zip column; responses sent before it was added show the zip inside City, State and a blank Zip), **Ask Period**, **Amount of Check**, **Check #**, **Date Check Mailed**, Grant Award Email Sent.
  - **Ask Period** tags an approved team with the Grant Ask Tracker ask its check is funded from. The dropdown lists the active asks (both dates set) and a blank (—) for none. It appears only on approved rows; if a team is later un-approved, its Ask Period stays saved but no longer counts. A team assigned to an ask that later loses a date shows that ask with "(no dates)" until it's changed. Hover the heading (ⓘ) for a reminder.
  - **Amount of Check** starts at the team's Possible Grant Award. The Grant Administrator can change it, but if Possible Grant Award changes later (for example, Raised by Team is edited), the check goes back to the new Possible Grant Award. Once **Check #** and **Date Check Mailed** are both filled in, the amount is locked (🔒) and stays as mailed, even if Possible Grant Award changes; clear either one to edit it again. Hover the heading (ⓘ) for a summary of these rules.
- Click a heading with ↕ to sort; click again to reverse. Approved sorts Yes, Under Review, No, then blank. Fundraising Status sorts by **Team #**, **Approved**, **Rookie/Veteran Status**, **Raised by Team** and **Unused Grant Match**; Check Status sorts by **Team #**, **Amount of Check**, **Check #**, **Date Check Mailed** and **Grant Award Email Sent**. Blank values always sort last. The sort carries over between tabs.
- The table scrolls inside its own box, so the column headings stay frozen at the top as you scroll down. The box is sized to leave room under it for the Ask Period breakdown and row count, so the headings and every subtotal fit on screen together (it adjusts as asks are added and when **Approved teams only** is unticked). On Check Status, City, State wraps onto two lines when needed, so every column through Grant Award Email Sent fits on a typical laptop screen (1280 pixels wide) without scrolling sideways.
- A **Total** row at the bottom adds up the rows shown (it stays frozen at the bottom of the scroll box, so it's always visible): Max Grant Award, Team Target, Raised by Team, Possible Grant Award and Unused Grant Match on Fundraising Status, and Amount of Check on Check Status. Blanks count as $0. With **Approved teams only** ticked, the Raised and Possible totals match the Grant Matching Totals table. The Check total adds every Amount of Check shown, mailed or not, so it's usually more than Grants Distributed to Teams.
- **Breakdown by Ask Period** under the Total row (both tabs): the same totals split into one row per active ask (both dates set, shown even with no teams), then **Unassigned** (approved teams with no Ask Period yet), each with its number of rows in brackets. With **Approved teams only** unticked, a **Not approved** row is added. The rows always add up to the Total, and each amount sits under its Total amount. An approved team still tagged to an ask that has lost a date gets its own row, "*name* (no dates)". The Total row stays frozen at the bottom of the scroll box; the breakdown sits just below the box, outside the scrolling, so it is always visible. Its amounts line up under the Total and follow the table when it scrolls sideways. Like the Total, it counts every row shown, so a team with two approved applications counts twice here (the Grant Ask Tracker counts each team once).
- The row count is shown under the table.
- Raised by Team and Amount of Check show dollars like the rest of the site (e.g. $1,050). Raised by Team is read-only here: it's entered on the **Applications** page. Click the Amount of Check box to type a plain number; "$" and commas typed by hand are ignored. Numeric columns are centered.
- **Export** (top right) downloads the rows shown, in their current order, as an Excel file named `grant-fundraising-YYYY-MM-DD.xlsx`. A title row says what was exported ("Approved teams only" or "All applications") and when; the bold headings stay frozen when scrolling. It has the columns of both tabs, Fundraising Status then Check Status (including Ask Period by name). Dollar columns are real numbers shown as whole dollars (e.g. $1,200), so they can be added up in Excel. After a blank row, the bottom of the file has the bold **Total** row and the same **Ask Period** rows as under the table (each ask, Unassigned, and Not approved when unticked), with the label in the first column and each amount in its own column. With **Approved teams only** ticked it has just approved teams; untick it to export every application. Unsaved changes on the page are included.
- The columns in bold above have yellow headings: the Grant Administrator enters them. Raised by Team isn't one of them (it has a plain heading); it's entered on Applications, which sets the update date to today, and this tab recalculates Possible Grant Award, Unused Grant Match (grantor match per team less the Possible Grant Award: the grant still available, $0 once the team raised the max, never negative) and the totals.
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

- **Oct 23, 2026:** Fixed the Fundraising Status Excel export needing repair in Excel when a response's Team Number wasn't a single number; it now shows as typed with a "not one team #" badge.
- **Oct 23, 2026:** Fundraising Status export is now an Excel file (.xlsx) with whole-dollar formatting, a title row, frozen bold headings and a bold Total row.
- **Oct 23, 2026:** The Fundraising Status export ends with the Total and Ask Period subtotal rows, matching the table.
- **Oct 23, 2026:** Fundraising Status scroll box is shorter, leaving room for the Ask Period breakdown, so headings and all subtotals fit on screen together.
- **Oct 23, 2026:** The Ask Period breakdown moved below the table, outside the scroll box, still lined up under the Total.
- **Oct 23, 2026:** Fundraising Status and Check Status show a breakdown of the Total by Ask Period (each active ask, Unassigned, and Not approved when unapproved rows are shown); only the Total row stays frozen.
- **Oct 23, 2026:** Amount of Check hover note now also explains the default: it starts at Possible Grant Award, can be typed over, and follows Possible Grant Award again when that changes.
- **Oct 23, 2026:** Check Status City, State column narrower (wraps), so the whole tab fits without scrolling sideways.
- **Oct 23, 2026:** Ask Period column on Check Status; Ask Period filter on Grant Matching Totals (also in the Grant Matching Report title); Grant Ask Tracker amounts are calculated from assigned teams, Use current removed, and Remove warns when teams are assigned.
- **Oct 22, 2026:** Links to the new Grant Rules and Data documents; Total Ask for Year, duplicate rows and the not-in-BioBuzz badge described; Teams Awarded wording uses "Grant Approved".
- **Oct 21, 2026:** Teams Applied counts every application (a team that applied twice counts twice), and its hover note now reads: Tracks the number of applications by rookie/veteran status. Other columns in the chart only count teams with "Grant Approved" equal to "Yes".
- **Oct 21, 2026:** The Total row on Fundraising Status and Check Status stays frozen at the bottom of the scroll box.
- **Oct 21, 2026:** Grants Distributed to Teams counts only mailed checks (Check # and Date Check Mailed filled in), also in the Grant Matching Report; its heading has a hover note.
- **Oct 21, 2026:** Amount of Check defaults to Possible Grant Award (a typed amount lasts until Possible Grant Award changes) and locks once Check # and Date Check Mailed are filled in; its heading has a hover note. Raised by Team shows "error" when the form's HQ grant amount isn't a number. Refresh Data copies the HQ grant amount into Raised by Team once.
- **Oct 21, 2026:** Raised by Team on Fundraising Status is read-only with a plain (white) heading; it's now entered on the Applications page.
- **Oct 21, 2026:** Refresh Data now reads both Google Sheets. Mockup banner and sample data removed.
- **Oct 20, 2026:** Changes are now saved to the database as you go ("Saving… / All changes saved" shows near the page title).
- **Oct 20, 2026:** Added the Grant Matching Report (Excel) button next to Refresh Data.
- **Oct 20, 2026:** Grant Ask Tracker heading shortened to "Cumulative Qualified Grants as of End Date".
- **Oct 20, 2026:** Grant Ask Tracker made more compact: columns sized to their contents and all boxes in a row lined up. Use current and Remove are small gray pills so the dates and amounts stand out.
- **Oct 20, 2026:** Added the Grant Ask Tracker between Grant Matching Totals and Fundraising Status.
- **Oct 20, 2026:** Grant Matching Totals category names stay on one line; "Teams Applied" heading on two lines and "Total Team Fundraising as of" on three.
- **Oct 20, 2026:** Total row on both Fundraising Status tabs.
- **Oct 20, 2026:** "Fundraising as of" renamed "Total Team Fundraising as of". Only that cell turns light green now (not Qualified Grants from Fundraising); the green rule is unchanged.
- **Oct 20, 2026:** Check Status "City, State, Zip" split into **City, State** and a new **Zip** column, following the form's new Zip question (also in the export).
- **Oct 19, 2026:** Raised by Team and Amount of Check show dollar formatting. Numeric columns (and their headings) are centered on both tabs.
- **Oct 19, 2026:** Removed the explanation lines above the Fundraising Status and Check Status tables (the yellow-header key stays). Column headings now stay frozen while scrolling.
- **Oct 19, 2026:** "Max Fundraising Target" column on Fundraising Status renamed "Team Target" (also in the export).
- **Oct 19, 2026:** Added Max Fundraising Target column before Raised by Team (also in the export). Raised by Team and Last Update headings on two lines, with slightly tighter cell spacing, so the tab still fits without sideways scrolling.
- **Oct 19, 2026:** Rookie/Veteran Status, Matching Multiplier, Max Grant Award, Possible Grant Award and Unused Grant Match headings on two lines so the Fundraising Status tab fits without sideways scrolling.
- **Oct 19, 2026:** Added Matching Multiplier and Max Grant Award columns after Rookie/Veteran Status (also in the export).
- **Oct 19, 2026:** Possible Grant Award moved after Raised by Team (also in the export).
- **Oct 19, 2026:** Fundraising as of and Qualified Grants from Fundraising headings have a hover note explaining the green highlight.
- **Oct 19, 2026:** Raised by Team and Unused Grant Match are sortable.
- **Oct 19, 2026:** Unused Grant Match now shows the grant still available (grantor match less Possible Grant Award), so it never goes negative when a team raises more than the max.
- **Oct 19, 2026:** Fundraising and Qualified Grants cells turn light green when every approved team in the category raised the max.
- **Oct 19, 2026:** Added Export to Fundraising Status.
- **Oct 19, 2026:** Fundraising Status "Coach 1" column renamed "Coach Name".
- **Oct 19, 2026:** Notice under Grant Matching Totals now shows how many applications are not fully reviewed/complete (Grant Approved blank or Under Review), replacing the Title 1 notice.
- **Oct 19, 2026:** Grant Matching Totals column headings centered, with the numbers centered under them.
- **Oct 19, 2026:** Approved column sorts the new "Under Review" answer between Yes and No.
- **Oct 19, 2026:** Asterisk on Rookie/Veteran Status in Grant Matching Totals, linking to a starred explanation in Grant Rules.
- **Oct 19, 2026:** Check Status columns Amount of Check, Check #, Date Check Mailed and Grant Award Email Sent are sortable.
- **Oct 19, 2026:** "Date of Last Fundraising Update" renamed to "Last Update" and "How Much Raised by Team" to "Raised by Team"; Fundraising Status headings on one line.
- **Oct 19, 2026:** Renamed from Totals & Fundraising to Dashboard with a new page title. Teams Applied explanation moved to a hover note. Fundraising Status split into Fundraising Status and Check Status tabs, with two-line headings, sorting by Team #, Approved and Rookie/Veteran Status, and a row count. Grant rules moved to the bottom.
- **Oct 19, 2026:** Page created (mockup).
