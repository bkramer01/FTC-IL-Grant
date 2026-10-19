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

## Key rules

| Term | Meaning |
|---|---|
| **Team age** | Rookie: team # 35127 and up. Second Year: 25609–35126. Veteran: 25608 and below. |
| **Grant category** | Rookie 1 / Rookie 1 title 1 / Second Year / Second Year Title 1 / Veteran Title 1 / Not Qualified (veteran, not Title 1). Shows **Title 1 status needed** until Title 1 is entered. |
| **Possible Grant Award** | Amount raised, capped at the category's max fundraising target, × its multiplier. |
| **Duplicate** | A team number that sent the form more than once. Both rows stay; each is flagged. Totals count the team once. |

## Keeping these docs current

Each page document ends with a **Change history**. Whenever a feature is added or changed, the document for that page is updated in the same change.
