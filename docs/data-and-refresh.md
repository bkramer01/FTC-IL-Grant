# Data and Refresh Data

> **Applies to:** every page · **Last updated:** October 23, 2026

Where the site's information comes from, what **Refresh Data** does, and what's saved where.

## Four kinds of information

| Kind | Where it comes from | Where you see it |
|---|---|---|
| **Form answers** | The grant form's Google Sheet | Plain (white) column headings on Applications and Fundraising Status; everything on Form Responses. |
| **Team names** | The BioBuzz team list (Google Sheet) | Team Name columns on every page. |
| **Grant Administrator entries** | Typed or picked on the site | Yellow column headings, the Email Log and the Grant Ask Tracker. |
| **Calculated** | Worked out from the above every time a page loads | Team age, category, awards, totals ([Grant Rules](grant-rules.md)). |

The site never changes either Google Sheet. It only reads them.

## The two Google Sheets

| Sheet | Tab | Used for |
|---|---|---|
| [Apply for an FTC IL Matching Grant … (Responses)](https://docs.google.com/spreadsheets/d/1b7nY9zdAcAE2zjmlmY_qk7wl69xO2UfHdN7yLbEr8MA/edit?gid=370691157) | "Form Responses 1" (tab ID 370691157) | Every grant application. |
| [2026/2027 BioBuzz Team Registration Parsing](https://docs.google.com/spreadsheets/d/1ydZLnPGo8iGmWBToRH0Qa6lMbiWpNrz3oZW3__-tt7c/edit?gid=1750695360) | "biobuzz - including unpaid - *date*" (tab ID 1750695360) | Team names, by team number (columns A TeamNumber and B TeamName). |

The site finds each tab by its tab ID, not its name, because the BioBuzz tab name ends in a date that changes. Both sheets must be shared, as **Viewer**, with the site's Google service account: `ftc-grant-sheets-reader@project-115d3a43-e62e-443b-8d5.iam.gserviceaccount.com`.

### Form columns the site uses

The site reads form answers by column position. Columns marked ✔ are checked on every refresh (see "When a refresh is refused" below). The others are read but not checked. The site expects the 19 columns below, A to S.

| Col | Form question (short) | Used for | Checked |
|---|---|---|---|
| A | Timestamp | Identifies the application; Timestamp column; newest-first order | ✔ |
| B | Email Address | Coach email (Applications, export) | |
| C | Got a grant last year & did the survey | End of Season Survey Completed? ("rookie Biobuzz" shows as N/A (rookie)) | |
| D | Team is in the green | Fully Registered? | |
| E | Team Number | Team #, team age, team name lookup, duplicate check | ✔ |
| F | Coach Name | Coach Name, Email Log recipient | ✔ |
| G | Team Category | Rookie/Veteran Status Provided and the "form says …" check | |
| H | Grant from FIRST HQ? | Form Responses only | |
| I | HQ grant amount | Starting value of Raised by Team | ✔ |
| J | Team location (city) | Form Responses only | |
| K | Volunteers (2 or more) | List of Volunteers | |
| L | Matching grant letter (upload) | **Letter ↗** link | |
| M | Make the check out to | Check Addressee | |
| N | School or community team | Form Responses only | |
| O | Street Address | Check Status address | ✔ |
| P | City State | Check Status City, State | ✔ |
| Q | VRS screenshot (upload) | **Screenshot ↗** link | |
| R | The VRS 6 Challenges | Form Responses only (VRS Task Completed is picked by hand) | |
| S | Zip | Check Status Zip (added Oct 2026; earlier responses have the zip inside City State) | ✔ |

If the form gains, loses or reorders questions, these positions must be updated in the code (`COL` in `src/lib/applications.ts` and the checks in `src/lib/sheets.ts`).

## Refresh Data

**Refresh Data** is the blue button at the top right of the Dashboard's Grant Matching Totals. It only runs when clicked: nothing refreshes on a schedule.

When clicked, the site:

1. **Reads** the whole Form Responses 1 tab and the whole BioBuzz tab. Rows with a blank first cell are skipped.
2. **Checks** the key column headings (✔ above, plus BioBuzz A and B). A heading has to start with the expected text.
3. **Saves** both tabs as the site's new copy, replacing the old one. It also copies HQ grant amounts into Raised by Team, as below.
4. **Reloads** the page and updates **Last refreshed** with the date and time (Central time).

Steps 3 and 4 happen only if both tabs were read and passed the checks. Otherwise nothing changes.

### HQ grant amount → Raised by Team (copied once)

For each application whose Raised by Team hasn't been set yet:

| HQ grant amount in the sheet | What the refresh does |
|---|---|
| A number, e.g. `1500`, `$2,000`, `800.00` ("$", commas and spaces are ignored; cents are rounded) | Copies it into Raised by Team, sets Last Update to the refresh date, and marks the amount as **set**. |
| Blank | Nothing. Checked again on the next refresh. |
| Anything else, e.g. `none` | Nothing. Raised by Team shows a red **error** (hover it to see the answer) until the sheet is fixed or the amount is typed in. |

Once an amount is **set**, whether copied by a refresh or typed on Applications, later refreshes never change it, even if the sheet changes. Typing in the box counts as setting it even if the box is later cleared.

### What a refresh never changes

Everything the Grant Administrator entered: approvals, notes, Title 1, checklist answers, typed or copied Raised by Team amounts, check details, the Email Log and the Grant Ask Tracker.

### Edited or deleted form responses

- The site connects the Grant Administrator's entries to an application by its **Timestamp** (column A).
- If a response is **deleted** from the sheet, it disappears from the site on the next refresh. Its entries stay in the database and reappear if the response comes back with the same timestamp.
- If a response's **Timestamp is edited** in the sheet, the site treats it as a new application. Its earlier entries won't show. Avoid editing column A.
- Edits to any other answer show up on the next refresh. The exception is the HQ grant amount: once Raised by Team is set, it's not copied again.

### When a refresh is refused

The reason appears in red under the button, and nothing is changed.

| Message | Cause and fix |
|---|---|
| "*Sheet*: Google refused access. Share the sheet with ftc-grant-sheets-reader@… as Viewer." | That sheet isn't shared with the service account, or the share was removed. |
| "*Sheet*: the sheet's columns have changed (column X should be "…" but is "…"). Nothing was refreshed." | A key column was moved, renamed or deleted. Put it back, or have the site updated to the new layout. |
| "GOOGLE_SERVICE_ACCOUNT_KEY is not set…" | The server is missing its Google key ([Behind the Scenes](behind-the-scenes.md)). |
| Any other message | Usually a temporary Google or network problem. Try again. |

## Team names

The **Team Name** comes from the BioBuzz list by team number. A team number that isn't on the list shows a red **not found** badge on Applications and **not in BioBuzz** on Fundraising Status. It usually means the team hasn't registered with BioBuzz yet, or the coach typed the wrong team number on the form.

## Team Number answers

Each response should have one team number. If the Team Number answer isn't a single number (for example "31768, 31769, 31770, 31771"), the site shows it as typed with a red **not one team #** badge and exports it as text. Split it into one response per team in the Google Sheet, then click Refresh Data.

## Duplicate applications

A team number that appears on more than one form response is a duplicate. Every response stays on Applications and Fundraising Status, each with a yellow **Dup ×2** (or **×2**) badge, and each is reviewed separately. In Grant Matching Totals, Teams Applied counts every response, and the other columns count the team once (see [Grant Rules](grant-rules.md#6-grant-matching-totals-dashboard)).

## Saving as you go

There's no Save button. Every change typed or picked on a page is saved to the database about half a second after you stop typing. The note near the page title shows:

- **Saving…** while a change is on its way.
- **All changes saved** once it's stored.
- **Couldn't save the last change. Check your connection and try again.** (in red) if it failed. Re-enter the change.

The browser warns you if you try to leave the page while a save is still on its way.

## Fields saved but not shown

Two review answers are still saved in the database but no longer appear on any page or export (removed Oct 21, 2026):

- **Event Volunteering?** (Yes/No)
- **Qualified Purchase?** (Yes/No)

Answers entered before the change are kept. Bringing either column back is a small code change; the data is still there.

## Dates and times

Dates use Central time (America/Chicago): "today" for Last Update, the Email Log and file names, and the Last refreshed time. Form timestamps are shown as the Google Sheet records them.

## Change history

- **Oct 23, 2026:** Added Team Number answers that aren't a single number.
- **Oct 22, 2026:** Document created.
