# Applications

> **Address:** `/applications` · **Last updated:** October 22, 2026

One row per grant form response, newest first. This is where the Grant Administrator reviews each application.

## Finding applications

- Search by team number, team name or coach.
- A small yellow box above the table shows **Total applications** and counts the Grant Approved answers across all applications: **Grants approved** (Yes), **Rejected** (No), **Not reviewed** (blank) and **Under review**. It updates as answers change and ignores search and filter.
- Click the **Team #**, **Calculated Team Age**, **Grant Approved** or **Timestamp** heading to sort; click again to reverse. The table starts newest first. Team age sorts Rookie, Second Year, Veteran; Grant Approved sorts Yes, Under Review, No, Not reviewed.
- **Show** filter: All applications, or one Grant Approved status (Yes, Under Review, No, Not reviewed). The Dashboard's "not fully reviewed/complete" link opens the page filtered to Not reviewed or Under Review; that choice appears in the list only while it's active.
- The table scrolls inside its own box, no taller than the window, so the column headings stay frozen at the top as you scroll down. **Team #** stays frozen at the left as you scroll sideways. Scroll sideways with the scrollbar just under the headings or the one at the bottom of the box. The number of rows shown (after search and filter) appears under the table.
- **Export** downloads every application (all rows, ignoring search and filter) as a CSV file that opens in Excel, named `grant-applications-YYYY-MM-DD.csv`. It has the table's columns, in the same order, plus Coach Email, the letter and VRS screenshot links, and how many times the team submitted. It includes changes made on the page that haven't been saved. Applications with no Grant Approved decision export as "Not reviewed".

## Flags

- **Dup ×2**: the team sent the form more than once. Both rows stay.
- **not found** (in Team Name): the team number isn't on the BioBuzz list, so there's no team name.
- **form says …**: the team age the coach picked on the form doesn't match the team number. Hover the Calculated Team Age heading (ⓘ) for a reminder of this check.
- **Title 1 status needed**: the category can't be worked out until School Title 1 Status is entered.

## Columns

In order: Team #, Team Name, Coach Name, Rookie/Veteran Status Provided, Calculated Team Age, **Raised by Team**, Possible Grant Award, Rookie/Veteran Status for Grant, **School Title 1 Status**, **Fundraising Letter Rec'd**, List of Volunteers, Fully Registered?, End of Season Survey Completed?, **VRS Task Completed**, Add'l Info Email Sent, **Grant Approved**, **Review Notes**, Timestamp. Columns in bold have yellow headings: the Grant Administrator fills them in.

| Column | Source |
|---|---|
| Timestamp | Form. Shows the date; hover it for the date and time. |
| Coach Name (+ email), Rookie/Veteran Status Provided, List of Volunteers | Form |
| Team Name | BioBuzz, by team number |
| Calculated Team Age, Rookie/Veteran Status for Grant | Calculated |
| Fully Registered? | Form ("Team is in the green") |
| End of Season Survey Completed? | Form question 2 ("rookie Biobuzz" shows as N/A) |
| Add'l Info Email Sent | Latest "Additional Info Needed" entry in the Email Log |
| Grant Approved | Grant Administrator: Yes, Under Review or No ("Not reviewed" until one is picked) |
| VRS Task Completed | Grant Administrator: Yes, In Progress or No |
| Raised by Team | Starts as the form's HQ grant amount (column I, "how much did your team receive as credit from FIRST Headquarters"), copied by Refresh Data with that day as the Last Update date. "$" and commas are fine; anything else that isn't a number shows **error** (hover for the form's answer) and counts as $0 in totals: fix it in the sheet and the next refresh copies it, or type the amount here. A blank answer stays blank until the sheet has one. Once an amount is copied or typed, refreshes never change it. The Grant Administrator can edit it on any row (shows as dollars; click to type a plain number); changing it sets the Last Update date to today. This is the only place it's edited; the Dashboard's Fundraising Status shows the same amount. |
| Possible Grant Award | Calculated from Raised by Team and the team's category, the same as on the Dashboard's Fundraising Status; updates as soon as Raised by Team changes. |

The **Letter ↗** and **Screenshot ↗** links open the files the coach uploaded with the form.

## Change history

- **Oct 22, 2026:** Grant Approved and Review Notes moved to the end, just before Timestamp (also in the export).
- **Oct 21, 2026:** Row count under the table, like Fundraising Status.
- **Oct 21, 2026:** Raised by Team starts from the form's HQ grant amount (copied once by Refresh Data) and shows "error" when that answer isn't a number.
- **Oct 21, 2026:** Added Possible Grant Award (read-only, same as on Fundraising Status) after Raised by Team, also in the export.
- **Oct 21, 2026:** Added Raised by Team after Grant Approved (moved here from the Dashboard, where it's now read-only). Removed the Event Volunteering? and Qualified Purchase? columns (also from the export; earlier answers are kept). Timestamp moved to the last column; Team # is now first and stays frozen when scrolling sideways. The export uses the new column order.
- **Oct 20, 2026:** Changes are now saved to the database as you go ("Saving… / All changes saved" shows near the page title).
- **Oct 20, 2026:** Calculated Team Age heading has a hover note: "Checks the team age calculated by team number against what is reported on the grant form."
- **Oct 19, 2026:** Timestamp, Team #, Calculated Team Age and Grant Approved columns are sortable.
- **Oct 19, 2026:** Grant Approved's empty choice, its Show filter option, the counts box and the export now read "Not reviewed".
- **Oct 19, 2026:** Show filter limited to All applications and the Grant Approved statuses (Duplicate submissions and Title 1 status needed filters removed).
- **Oct 19, 2026:** Counts box starts with Total applications.
- **Oct 19, 2026:** "Approval Notes" renamed "Review Notes" (also in the export).
- **Oct 19, 2026:** Added the Grant Approved counts above the table, in a small yellow box like the Dashboard note.
- **Oct 19, 2026:** New "Not fully reviewed" filter; the page can open with a filter picked (`?show=notReviewed`), used by the Dashboard notice.
- **Oct 19, 2026:** "Coach 1" renamed "Coach Name" (also in the export).
- **Oct 19, 2026:** Grant Approved adds an "Under Review" choice and VRS Task Completed adds "In Progress" (both between Yes and No). New "Under review" filter; "Not yet decided" renamed "Not yet reviewed". Scrollbar under the headings restored.
- **Oct 19, 2026:** Added Export (CSV). Removed the extra scrollbar under the headings. Column key now says "BioBuzz data sheet".
- **Oct 19, 2026:** Column headings frozen: the table scrolls in its own window-height box.
- **Oct 19, 2026:** Fully Registered? narrowed: an answer other than Yes/No is cut short, with the full text on hover. List of Volunteers slightly narrower.
- **Oct 19, 2026:** Calculated Team Age moved before Grant Approved, with its heading on two lines.
- **Oct 19, 2026:** "Additional Info Email Sent" renamed "Add'l Info Email Sent".
- **Oct 19, 2026:** Fully Registered? (from Team), End of Season Survey Completed? and Additional Info Email Sent headings split onto two lines.
- **Oct 19, 2026:** "VRS 6 Lesson Challenge Completed?" renamed "VRS Task Completed".
- **Oct 19, 2026:** "Matching Grant Letter Received?" renamed "Fundraising Letter Rec'd".
- **Oct 19, 2026:** "duplicate ×2" flag shortened to "Dup ×2". Rookie/Veteran Status Provided and Rookie/Veteran Status for Grant headings split onto two lines; Status Provided column widened so answers fit in two lines.
- **Oct 19, 2026:** "Team Approved for Grant" renamed "Grant Approved"; "not in BioBuzz" flag renamed "not found". Yes/No columns (Grant Approved, School Title 1 Status, Matching Grant Letter Received?, Event Volunteering?, Qualified Purchase?, VRS 6 Lesson Challenge Completed?) use narrow dropdowns with wrapped headings.
- **Oct 19, 2026:** Team Approved for Grant (now Grant Approved) and Approval Notes moved next to Rookie/Veteran Status Provided. Timestamp shows the date, with date and time on hover. Added a scrollbar under the column headings. Removed the summary line under the page title. Text columns use the same font size.
- **Oct 19, 2026:** Page created (mockup).
