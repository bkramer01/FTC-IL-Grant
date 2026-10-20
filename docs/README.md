# FTC IL Grant Site: Page Guide

> **Last updated:** October 19, 2026

This folder documents every page of the grant site: what each page does, what users see, and which settings control it. There is one document per page.

> **Mockup stage:** the pages run on sample data copied from `FTC IL Grant Status.xlsx` (`src/mock/sample-data.json`). Edits work on the page but are not saved, and Refresh Data doesn't contact Google yet.

## The pages

| Page | Address | What it's for |
|---|---|---|
| [Sign In](sign-in.md) | `/login` | Shared `FTCAdmin` login. Every other page requires it. |
| [Dashboard](dashboard.md) | `/` | Grant totals by category, Refresh Data, Fundraising and Check Status tabs, and the grant rules. |
| [Applications](applications.md) | `/applications` | One row per grant form response, with the Grant Administrator's review columns. |
| [Email Log](email-log.md) | `/emails` | Emails sent to coaches, entered by hand. |
| [Form Responses](form-responses.md) | `/responses` | Read-only copy of the form's Google Sheet. |

## How the site fits together

- **Data sources** (pulled by Refresh Data): the grant form's Google Sheet ("Form Responses 1") and the BioBuzz team list ("biobuzz - including unpaid"), which supplies team names.
- **Grant Administrator entries** (yellow column headers): Title 1 status, checklist answers, approval, notes, amount raised, and check details.
- **Calculated**: team age from the team number, grant category from age + Title 1, possible award, unused match, totals.

## Data sources (Google Sheets)

| Sheet | Tab | What the site uses |
|---|---|---|
| [Apply for an FTC IL Matching Grant … (Responses)](https://docs.google.com/spreadsheets/d/1b7nY9zdAcAE2zjmlmY_qk7wl69xO2UfHdN7yLbEr8MA/edit?gid=370691157) | "Form Responses 1" (tab ID 370691157) | Every grant form response. |
| [2026/2027 BioBuzz Team Registration Parsing](https://docs.google.com/spreadsheets/d/1ydZLnPGo8iGmWBToRH0Qa6lMbiWpNrz3oZW3__-tt7c/edit?gid=1750695360) | "biobuzz - including unpaid - 10/20" (tab ID 1750695360) | Team names by team number. |

**Changes noted Oct 20, 2026:**

- The form sheet's column P is now **City State**, and a new **Zip** column was added at the end (column S, after the VRS columns). Responses submitted before the change still have the zip inside City State and a blank Zip. The site shows those as entered (it doesn't split them); only the sample rows that aren't in the Google Sheet had their zip moved into Zip.
- The BioBuzz columns are unchanged (it already had TeamZipCode), but its tab names now end in a date ("- 10/20"). When Refresh Data is built, it should find tabs by tab ID, not by name.

## Key rules

| Term | Meaning |
|---|---|
| **Team age** | Rookie: team # 35127 and up. Second Year: 25609–35126. Veteran: 25608 and below. |
| **Grant category** | Rookie 1 / Rookie 1 title 1 / Second Year / Second Year Title 1 / Veteran Title 1 / Not Qualified (veteran, not Title 1). Shows **Title 1 status needed** until Title 1 is entered. |
| **Possible Grant Award** | Amount raised, capped at the category's max fundraising target, × its multiplier. |
| **Duplicate** | A team number that sent the form more than once. Both rows stay; each is flagged. Totals count the team once. |

## Keeping these docs current

Each page document ends with a **Change history**. Whenever a feature is added or changed, the document for that page is updated in the same change.
