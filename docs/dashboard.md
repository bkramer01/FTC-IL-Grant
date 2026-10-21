# Dashboard

> **Address:** `/` · **Last updated:** October 19, 2026

The home page, titled **FTC Illinois Matching Grants, 2026–27 season**. It has four sections: Grant Matching Totals, Grant Ask Tracker, Fundraising Status (with a Check Status tab) and Grant Rules.

## Grant Matching Totals

- **Refresh Data** (top right) reads the latest grant form responses and the BioBuzz team list from Google Sheets, saves them, and reloads the page. It shows when data was last refreshed ("never" before the first refresh). Responses deleted from the sheet disappear on the next refresh; the administrator's entries stay linked to each response by its timestamp. If a sheet can't be read (not shared with the service account, or a key column moved), nothing changes and the reason appears under the button.
- One row per category, plus a Total row. Hover the **Teams Applied ⓘ** heading for how teams are counted. The asterisk (*) on **Rookie/Veteran Status** links to the explanation in Grant Rules.

| Column | How it's worked out |
|---|---|
| Teams Applied | Teams that sent the form, each team counted once. |
| Teams Awarded Grants | Teams with Team Approved for Grant = Yes. |
| Matching Multiplier / Grantor Match per Team / Max Fundraising Target | Category settings (see Grant Rules). |
| Total Possible Grant Amount | Teams Awarded × Grantor Match per Team. |
| Total Team Fundraising as of today | Sum of Raised by Team for approved teams: 100% of what they raised, not capped at the max fundraising target. |
| Qualified Grants from Fundraising | Sum of Possible Grant Award for approved teams. |
| Grants Distributed to Teams | Sum of Amount of Check for approved teams. |

- When every approved team in a category has raised at least that category's Max Fundraising Target, its **Total Team Fundraising** cell turns light green. Hover the heading (ⓘ) or a green cell for an explanation. One team raising extra can't make up for another team that is short, and categories with no awarded teams never turn green.

- **⤓ Grant Matching Report** (top right, next to Refresh Data) downloads the table as an Excel file, `grant-matching-report-YYYY-MM-DD.xlsx`: a "Grant Matching Report - as of" title row with the date and time, then the same columns, category rows and Total row. Headings and the Total row are bold, amounts are real numbers with dollar formatting, the heading row stays frozen when scrolling, and Total Team Fundraising has the same light green fill as the page. The note, Grant Rules and other sections aren't included. Unsaved edits on the page are included.
- Under the title, a small yellow note reads "XX applications not fully reviewed/complete.": XX counts every submission whose Grant Approved is blank or Under Review. The count links to Applications filtered to those rows. Teams still missing a School Title 1 Status are left out of the table.

## Grant Ask Tracker

Filled out by the Grant Administrator to track requests for funds from the Donor Fund during the season. One row per ask:

| Column | What goes in it |
|---|---|
| Name | Defaults to "Ask 1", "Ask 2", …; can be renamed. |
| Start Date / End Date | The period the ask covers. A row whose end date is before its start date is flagged. |
| Cumulative Qualified Grants as of End Date | Typed in: the season's Qualified Grants from Fundraising as of the ask's end date. **Use current** copies today's Qualified Grants from Fundraising total from Grant Matching Totals. |
| Total Ask Amount from Donor Fund | Typed in. |

- **+ Add ask** adds a row; **Remove** deletes one. There's no limit on the number of asks.
- **Total Ask for Year**: the most recent ask's cumulative amount, and the sum of all ask amounts.
- Each change saves as you go. The sample data starts with the two asks from the spreadsheet's Goals tab.

## Fundraising Status

- Approved teams by default; untick **Approved teams only** to see every application.
- Two tabs, each starting with Team # and Team Name:
  - **Fundraising Status:** Coach Name, Approved, Rookie/Veteran Status, Matching Multiplier, Max Grant Award (max fundraising target × multiplier, the grantor match per team; blank until Title 1 is entered), Team Target (the category's Max Fundraising Target: the most of a team's fundraising that gets matched, from the category settings), **Raised by Team**, Possible Grant Award, Unused Grant Match, Last Update (date the amount raised was last changed).
  - **Check Status:** Check Addressee, Street Address, City, State, Zip (from the form's new Zip column; responses sent before it was added show the zip inside City, State and a blank Zip), **Amount of Check**, **Check #**, **Date Check Mailed**, Grant Award Email Sent.
- Click a heading with ↕ to sort; click again to reverse. Approved sorts Yes, Under Review, No, then blank. Fundraising Status sorts by **Team #**, **Approved**, **Rookie/Veteran Status**, **Raised by Team** and **Unused Grant Match**; Check Status sorts by **Team #**, **Amount of Check**, **Check #**, **Date Check Mailed** and **Grant Award Email Sent**. Blank values always sort last. The sort carries over between tabs.
- The table scrolls inside its own box, no taller than the window, so the column headings stay frozen at the top as you scroll down.
- A **Total** row at the bottom adds up the rows shown: Max Grant Award, Team Target, Raised by Team, Possible Grant Award and Unused Grant Match on Fundraising Status, and Amount of Check on Check Status. Blanks count as $0. With **Approved teams only** ticked, the Raised, Possible and Check totals match the Grant Matching Totals table.
- The row count is shown under the table.
- Raised by Team and Amount of Check show dollars like the rest of the site (e.g. $1,050). Click a box to type a plain number; "$" and commas typed by hand are ignored. Numeric columns are centered.
- **Export** (top right) downloads the rows shown, in their current order, as a CSV file for Excel named `grant-fundraising-YYYY-MM-DD.csv`. It has the columns of both tabs, Fundraising Status then Check Status. With **Approved teams only** ticked it has just approved teams; untick it to export every application. Unsaved changes on the page are included.
- The columns in bold above have yellow headings: the Grant Administrator enters them. Changing Raised by Team sets the update date to today and recalculates Possible Grant Award, Unused Grant Match (grantor match per team less the Possible Grant Award: the grant still available, $0 once the team raised the max, never negative) and the totals.
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
